import fs from 'node:fs';
import path from 'node:path';

import db from './database.js';

const migrationsDirectory = path.resolve(
    import.meta.dirname,
    'migrations',
);

db.exec(`
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

const executedMigrations = db
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

    const runMigration = db.transaction(() => {
        db.exec(sql);

        db.prepare(
            'INSERT INTO migrations (name) VALUES (?)',
        ).run(migration);
    });

    runMigration();

    console.log(`Applied migration: ${migration}`);
}

console.log('Database migrations complete.');