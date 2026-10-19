import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export function createDatabase(databasePath: string): Database.Database {
    const directory = path.dirname(databasePath);

    fs.mkdirSync(directory, { recursive: true });

    const db = new Database(databasePath);

    try {

        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        return db;
    } catch (error) {
        db.close();
        throw error;
    }
}