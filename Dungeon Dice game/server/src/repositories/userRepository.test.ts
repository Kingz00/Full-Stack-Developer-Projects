import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { UserRepository } from './userRepository.js';

describe('UserRepository', () => {
    let db: Database.Database;
    let repository: UserRepository;

    beforeEach(() => {
        db = createDatabase(':memory:');

        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        repository = new UserRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    it('creates a user', () => {
        const user = repository.create({
            username: 'testuser',
            passwordHash: 'hashed-password',
        });

        expect(user).toMatchObject({
            id: 1,
            username: 'testuser',
            passwordHash: 'hashed-password',
        });

        expect(user.createdAt).toBeTruthy();
    });

    it('finds a user by username', () => {
        repository.create({
            username: 'testuser',
            passwordHash: 'hashed-password',
        });

        const user = repository.findByUsername('testuser');

        expect(user).toMatchObject({
            id: 1,
            username: 'testuser',
            passwordHash: 'hashed-password',
        });
    });

    it('returns null when the username does not exist', () => {
        expect(repository.findByUsername('unknown')).toBeNull();
    });

    it('finds a user by id', () => {
        const createdUser = repository.create({
            username: 'testuser',
            passwordHash: 'hashed-password',
        });

        const user = repository.findById(createdUser.id);

        expect(user).toEqual(createdUser);
    });

    it('returns null when the user id does not exist', () => {
        expect(repository.findById(999)).toBeNull();
    });

    it('enforces unique usernames', () => {
        repository.create({
            username: 'testuser',
            passwordHash: 'hashed-password',
        });

        expect(() =>
            repository.create({
                username: 'testuser',
                passwordHash: 'another-hash',
            }),
        ).toThrow();
    });
});