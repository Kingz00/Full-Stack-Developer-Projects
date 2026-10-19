import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';

import { createDatabase } from './database.js';
import { resolveDatabasePath } from './databasePath.js';


const migrationsDirectory = path.resolve(
    import.meta.dirname,
    'migrations',
);

export function runMigrations(database: Database.Database): void {

    database.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrations = fs
        .readdirSync(migrationsDirectory)
        .filter((file) => file.endsWith('.sql'))
        .sort();

    const executedMigrations = database
        .prepare('SELECT name FROM migrations')
        .all() as { name: string }[];

    const executedNames = new Set(
        executedMigrations.map((migration) => migration.name),
    );

    for (const migration of migrations) {
        if (executedNames.has(migration)) {
            continue;
        }

        const migrationPath = path.join(migrationsDirectory, migration);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        const runMigration = database.transaction(() => {
            database.exec(sql);

            database.prepare(
                'INSERT INTO migrations (name) VALUES (?)',
            ).run(migration);
        });

        runMigration();

        console.log(`Applied migration: ${migration}`);
    }

    console.log('Database migrations complete.');
}

// Preserve the existing npm run db:migrate command.
if (process.argv[1] &&
    path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
    const db = createDatabase(resolveDatabasePath());

    try {
        runMigrations(db);
    } finally {
        db.close();
    }
}