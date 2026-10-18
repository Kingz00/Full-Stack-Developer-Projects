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
                email TEXT,
                email_verified_at TEXT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE UNIQUE INDEX idx_users_email_unique
                ON users(email)
                WHERE email IS NOT NULL;
        `);

        repository = new UserRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    it('creates a user', () => {
        const user = repository.create({
            username: 'testuser',
            email: 'testuser@example.com',
            passwordHash: 'hashed-password',
        });

        expect(user).toMatchObject({
            id: 1,
            username: 'testuser',
            email: 'testuser@example.com',
            passwordHash: 'hashed-password',
        });

        expect(user.createdAt).toBeTruthy();
    });

    it('finds a user by username', () => {
        repository.create({
            username: 'testuser',
            email: 'testuser@example.com',
            passwordHash: 'hashed-password',
        });

        const user = repository.findByUsername('testuser');

        expect(user).toMatchObject({
            id: 1,
            username: 'testuser',
            email: 'testuser@example.com',
            passwordHash: 'hashed-password',
        });
    });

    it('returns null when the username does not exist', () => {
        expect(repository.findByUsername('unknown')).toBeNull();
    });

    it('finds a user by id', () => {
        const createdUser = repository.create({
            username: 'testuser',
            email: 'testuser@example.com',
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
            email: 'testuser@example.com',
            passwordHash: 'hashed-password',
        });

        expect(() =>
            repository.create({
                username: 'testuser',
                email: 'testuser@example.com',
                passwordHash: 'another-hash',
            }),
        ).toThrow();
    });


    it('finds a user by email', () => {
        const createdUser = repository.create({
            username: 'testuser',
            email: 'testuser@example.com',
            passwordHash: 'hashed-password',
        });

        expect(
            repository.findByEmail('testuser@example.com'),
        ).toEqual(createdUser);
    });

    it('returns null when the email does not exist', () => {
        expect(
            repository.findByEmail('unknown@example.com'),
        ).toBeNull();
    });

    it('allows legacy users without an email address', () => {
        db.prepare(`
            INSERT INTO users (username, password_hash)
            VALUES (?, ?)
        `).run('legacyuser', 'hashed-password');

        const user = repository.findByUsername('legacyuser');

        expect(user).toMatchObject({
            username: 'legacyuser',
            email: null,
        });

        expect(user?.id).toBeTruthy();
    });

    it('rejects duplicate non-null email addresses', () => {
        repository.create({
            username: 'firstuser',
            email: 'same@example.com',
            passwordHash: 'first-hash',
        });

        expect(() => {
            repository.create({
                username: 'seconduser',
                email: 'same@example.com',
                passwordHash: 'second-hash',
            });
        }).toThrow(/UNIQUE constraint failed/);
    });

});