import type { Server } from 'node:http';
import type Database from 'better-sqlite3';

import { runMigrations } from './db/migrate.js';
import { seedHeroes } from './db/seedHeroes.js';

export function initializeDatabase(db: Database.Database): void {
    runMigrations(db);
    seedHeroes(db);
}

export function closeServer(
    server: Server,
    db: Database.Database,
    timeoutMs = 10_000,
): Promise<void> {
    return new Promise((resolve) => {
        let settled = false;

        const finish = () => {
            if (settled) {
                return;
            }

            settled = true;
            clearTimeout(timeout);
            resolve();
        };

        const closeDatabase = () => {
            try {
                if (db.open) {
                    db.close();
                }
            } catch (error) {
                console.error('Database shutdown failed:', error);
                process.exitCode = 1;
            }
        };

        const timeout = setTimeout(() => {
            console.error('Graceful shutdown timed out.');

            // Stop accepting connections and terminate remaining ones.
            server.closeAllConnections();

            closeDatabase();
            process.exitCode = 1;
            finish();
        }, timeoutMs);

        timeout.unref();

        server.close((error) => {
            if (error) {
                console.error('HTTP server shutdown failed:', error);
                process.exitCode = 1;
            }

            closeDatabase();
            finish();
        });
    });
}