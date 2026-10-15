import { afterEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import type { Server } from 'node:http';

import { initializeDatabase, closeServer } from './serverLifecycle.js';
import { runMigrations } from './db/migrate.js';
import { seedHeroes } from './db/seedHeroes.js';

vi.mock('./db/migrate.js', () => ({
    runMigrations: vi.fn(),
}));

vi.mock('./db/seedHeroes.js', () => ({
    seedHeroes: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

describe('initializeDatabase', () => {
    it('runs migrations before seeding heroes', () => {
        const db = new Database(':memory:');

        try {
            initializeDatabase(db);

            expect(runMigrations).toHaveBeenCalledOnce();
            expect(runMigrations).toHaveBeenCalledWith(db);
            expect(seedHeroes).toHaveBeenCalledOnce();
            expect(seedHeroes).toHaveBeenCalledWith(db);

            expect(
                vi.mocked(runMigrations).mock.invocationCallOrder[0],
            ).toBeLessThan(
                vi.mocked(seedHeroes).mock.invocationCallOrder[0],
            );
        } finally {
            db.close();
        }
    });

    it('does not seed heroes when migrations fail', () => {
        const db = new Database(':memory:');
        const error = new Error('Migration failed');

        vi.mocked(runMigrations).mockImplementationOnce(() => {
            throw error;
        });

        try {
            expect(() => initializeDatabase(db)).toThrow(error);
            expect(seedHeroes).not.toHaveBeenCalled();
        } finally {
            db.close();
        }
    });

    it('does not continue when seeding fails', () => {
        const db = new Database(':memory:');

        vi.mocked(seedHeroes).mockImplementationOnce(() => {
            throw new Error('Seeding failed');
        });

        try {
            expect(() => initializeDatabase(db)).toThrow('Seeding failed');
            expect(runMigrations).toHaveBeenCalledOnce();
            expect(seedHeroes).toHaveBeenCalledOnce();
        } finally {
            db.close();
        }
    });
});

describe('closeServer', () => {
    it('closes the database after the HTTP server closes', async () => {
        const db = new Database(':memory:');
        const events: string[] = [];

        const server = {
            close: (callback: (error?: Error) => void) => {
                events.push('http');
                callback();
            },
            closeAllConnections: vi.fn(),
        } as unknown as Server;

        const originalClose = db.close.bind(db);

        vi.spyOn(db, 'close').mockImplementation(() => {
            events.push('database');
            return originalClose();
        });

        try {
            await closeServer(server, db);

            expect(events).toEqual(['http', 'database']);
            expect(db.open).toBe(false);
        } finally {
            if (db.open) {
                db.close();
            }
        }
    });

    it('closes the database and reports an HTTP shutdown error', async () => {
        const db = new Database(':memory:');
        const originalExitCode = process.exitCode;

        const server = {
            close: (callback: (error?: Error) => void) => {
                callback(new Error('HTTP close failed'));
            },
            closeAllConnections: vi.fn(),
        } as unknown as Server;

        try {
            await closeServer(server, db);

            expect(db.open).toBe(false);
            expect(process.exitCode).toBe(1);
        } finally {
            process.exitCode = originalExitCode;
            if (db.open) {
                db.close();
            }
        }
    });
});