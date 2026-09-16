import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export function createDatabase(databasePath: string): Database.Database {
    const directory = path.dirname(databasePath);

    fs.mkdirSync(directory, { recursive: true });

    const db = new Database(databasePath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    return db;
}

const databasePath = path.resolve(
    process.cwd(),
    'data/dungeon-dice.db',
);

const db = createDatabase(databasePath);

export default db;