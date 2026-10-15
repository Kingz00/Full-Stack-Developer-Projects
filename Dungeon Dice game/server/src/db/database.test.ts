import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDatabase } from './database.js';

describe('createDatabase', () => {
    let tempDirectory: string | undefined;
    let db: Database.Database | undefined;

    afterEach(() => {
        if (db?.open) {
            db.close();
        }

        if (tempDirectory) {
            fs.rmSync(tempDirectory, {
                recursive: true,
                force: true,
            });
        }

        vi.restoreAllMocks();
    });

    it('creates the parent directory when it does not exist', () => {
        tempDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), 'dungeon-db-'),
        );

        const databasePath = path.join(
            tempDirectory,
            'nested',
            'dungeon.db',
        );

        db = createDatabase(databasePath);

        expect(fs.existsSync(databasePath)).toBe(true);
        expect(db.open).toBe(true);
    });

    it('enables foreign-key enforcement', () => {
        tempDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), 'dungeon-db-'),
        );

        db = createDatabase(
            path.join(tempDirectory, 'dungeon.db'),
        );

        expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    });

    it('enables WAL journal mode for file-backed databases', () => {
        tempDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), 'dungeon-db-'),
        );

        db = createDatabase(
            path.join(tempDirectory, 'dungeon.db'),
        );

        expect(
            String(db.pragma('journal_mode', { simple: true })).toLowerCase(),
        ).toBe('wal');
    });
});
