import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { UserRepository } from '../repositories/userRepository.js';
import { AuthService } from './authService.js';

describe('AuthService', () => {
    let db: Database.Database;
    let userRepository: UserRepository;
    let authService: AuthService;

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

        userRepository = new UserRepository(db);
        authService = new AuthService(userRepository);
    });

    afterEach(() => {
        db.close();
    });

    it('registers a user and stores a password hash', async () => {
        const user = await authService.register({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });

        expect(user).toMatchObject({
            id: 1,
            username: 'testuser',
            email: 'testuser@example.com'
        });

        const passwordMatches = await bcrypt.compare(
            'password123',
            user.passwordHash,
        );

        expect(passwordMatches).toBe(true);

        expect(user.passwordHash).not.toBe('password123');
        expect(user.passwordHash).toBeTruthy();

        const storedUser = userRepository.findByUsername('testuser');

        expect(storedUser?.passwordHash).toBe(user.passwordHash);
    });

    it('does not allow duplicate usernames', async () => {
        await authService.register({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });

        await expect(
            authService.register({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'another-password',
            }),
        ).rejects.toEqual(
            expect.objectContaining({
                statusCode: 409,
                message: 'Username already exists.',
            }),
        );
    });


    it('normalizes email addresses before storing them', async () => {
        const user = await authService.register({
            username: 'emailuser',
            email: '  Player@Example.COM  ',
            password: 'password123',
        });

        expect(user.email).toBe('player@example.com');

        expect(
            userRepository.findByEmail('player@example.com')?.id,
        ).toBe(user.id);
    });

    it('rejects a duplicate email address', async () => {
        await authService.register({
            username: 'firstuser',
            email: 'player@example.com',
            password: 'password123',
        });

        await expect(
            authService.register({
                username: 'seconduser',
                email: 'PLAYER@example.com',
                password: 'another-password',
            }),
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Email address already exists.',
        });
    });

    it('allows different users to register with different email addresses', async () => {
        const firstUser = await authService.register({
            username: 'firstuser',
            email: 'first@example.com',
            password: 'password123',
        });

        const secondUser = await authService.register({
            username: 'seconduser',
            email: 'second@example.com',
            password: 'password123',
        });

        expect(firstUser.email).toBe('first@example.com');
        expect(secondUser.email).toBe('second@example.com');
        expect(firstUser.id).not.toBe(secondUser.id);
    });


    it('logs in with valid credentials', async () => {
        await authService.register({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });

        const user = await authService.login({
            username: 'testuser',
            password: 'password123',
        });

        expect(user).toMatchObject({
            id: 1,
            username: 'testuser',
        });
    });

    it('rejects an unknown username', async () => {
        await expect(
            authService.login({
                username: 'unknown',
                password: 'password123',
            }),
        ).rejects.toEqual(
            expect.objectContaining({
                statusCode: 401,
                message: 'Invalid username or password.',
            }),
        );
    });

    it('rejects an incorrect password', async () => {
        await authService.register({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });

        await expect(
            authService.login({
                username: 'testuser',
                password: 'wrong-password',
            }),
        ).rejects.toEqual(
            expect.objectContaining({
                statusCode: 401,
                message: 'Invalid username or password.',
            }),
        );
    });
});