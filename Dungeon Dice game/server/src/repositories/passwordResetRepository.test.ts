import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { PasswordResetRepository } from './passwordResetRepository.js';

describe('PasswordResetRepository', () => {
    let db: Database.Database;
    let repository: PasswordResetRepository;

    const now = '2026-10-17T12:00:00.000Z';
    const future = '2026-10-17T13:00:00.000Z';
    const past = '2026-10-17T11:00:00.000Z';

    beforeEach(() => {
        db = createDatabase(':memory:');
        db.pragma('foreign_keys = ON');

        // Minimal schema matching the production tables used by the repository.
        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                email_verified_at TEXT
            );

            CREATE TABLE password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_password_reset_tokens_user_id
                ON password_reset_tokens(user_id);

            CREATE TABLE sessions (
                sid TEXT PRIMARY KEY,
                session TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            );
        `);

        repository = new PasswordResetRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    function createUser(
        username: string,
        passwordHash = `hash-${username}`,
    ): number {
        const result = db.prepare(`
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        `).run(username, `${username}@example.com`, passwordHash);

        return Number(result.lastInsertRowid);
    }

    function createToken(
        userId: number,
        tokenHash: string,
        expiresAt = future,
        usedAt: string | null = null,
    ): void {
        db.prepare(`
            INSERT INTO password_reset_tokens (
                user_id, token_hash, expires_at, used_at
            )
            VALUES (?, ?, ?, ?)
        `).run(userId, tokenHash, expiresAt, usedAt);
    }

    function getToken(tokenHash: string): {
        user_id: number;
        token_hash: string;
        expires_at: string;
        used_at: string | null;
    } | undefined {
        return db.prepare(`
            SELECT user_id, token_hash, expires_at, used_at
            FROM password_reset_tokens
            WHERE token_hash = ?
        `).get(tokenHash) as {
            user_id: number;
            token_hash: string;
            expires_at: string;
            used_at: string | null;
        } | undefined;
    }

    it('replaces existing unused tokens for the same user', () => {
        const userId = createUser('firstuser');

        createToken(userId, 'old-token-hash');

        repository.replaceTokenForUser({
            userId,
            tokenHash: 'new-token-hash',
            expiresAt: future,
            now,
        });

        expect(getToken('old-token-hash')?.used_at).toBe(now);
        expect(getToken('new-token-hash')).toMatchObject({
            user_id: userId,
            token_hash: 'new-token-hash',
            expires_at: future,
            used_at: null,
        });
    });

    it('does not invalidate another user’s tokens when replacing a token', () => {
        const firstUserId = createUser('firstuser');
        const secondUserId = createUser('seconduser');

        createToken(firstUserId, 'first-old-token');
        createToken(secondUserId, 'second-token');

        repository.replaceTokenForUser({
            userId: firstUserId,
            tokenHash: 'first-new-token',
            expiresAt: future,
            now,
        });

        expect(getToken('first-old-token')?.used_at).toBe(now);
        expect(getToken('first-new-token')?.used_at).toBeNull();
        expect(getToken('second-token')?.used_at).toBeNull();
    });

    it('rolls back token replacement if inserting the new token fails', () => {
        const userId = createUser('firstuser');

        createToken(userId, 'existing-token');

        // A duplicate hash violates the UNIQUE constraint.
        expect(() => {
            repository.replaceTokenForUser({
                userId,
                tokenHash: 'existing-token',
                expiresAt: future,
                now,
            });
        }).toThrow(/UNIQUE constraint failed/);

        // The earlier UPDATE must be rolled back with the failed INSERT.
        expect(getToken('existing-token')?.used_at).toBeNull();

        const tokens = db.prepare(`
            SELECT token_hash
            FROM password_reset_tokens
            WHERE user_id = ?
        `).all(userId);

        expect(tokens).toEqual([{ token_hash: 'existing-token' }]);
    });

    it('invalidates an unused token', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'token-to-invalidate');

        repository.invalidateToken('token-to-invalidate', now);

        expect(getToken('token-to-invalidate')?.used_at).toBe(now);
    });

    it('does not change a token that has already been used', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'used-token', future, past);

        repository.invalidateToken('used-token', now);

        expect(getToken('used-token')?.used_at).toBe(past);
    });

    it('returns false for an unknown token without changing any data', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'valid-token');

        const result = repository.resetPassword(
            'unknown-token',
            'new-password-hash',
            now,
        );

        expect(result).toBe(false);
        expect(
            db.prepare('SELECT password_hash FROM users WHERE id = ?')
                .get(userId),
        ).toEqual({ password_hash: 'hash-firstuser' });
        expect(getToken('valid-token')?.used_at).toBeNull();
    });

    it('returns false for an expired token without changing the password', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'expired-token', past);

        const result = repository.resetPassword(
            'expired-token',
            'new-password-hash',
            now,
        );

        expect(result).toBe(false);
        expect(
            db.prepare('SELECT password_hash FROM users WHERE id = ?')
                .get(userId),
        ).toEqual({ password_hash: 'hash-firstuser' });
        expect(getToken('expired-token')?.used_at).toBeNull();
    });

    it('returns false for a previously used token', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'previously-used-token', future, past);

        const result = repository.resetPassword(
            'previously-used-token',
            'new-password-hash',
            now,
        );

        expect(result).toBe(false);
        expect(
            db.prepare('SELECT password_hash FROM users WHERE id = ?')
                .get(userId),
        ).toEqual({ password_hash: 'hash-firstuser' });
    });

    it('updates the password and consumes the token atomically', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'valid-token');

        const result = repository.resetPassword(
            'valid-token',
            'new-password-hash',
            now,
        );

        expect(result).toBe(true);
        expect(
            db.prepare('SELECT password_hash FROM users WHERE id = ?')
                .get(userId),
        ).toEqual({ password_hash: 'new-password-hash' });
        expect(getToken('valid-token')?.used_at).toBe(now);
    });

    it('invalidates other outstanding reset tokens for the same user', () => {
        const userId = createUser('firstuser');

        createToken(userId, 'token-being-used');
        createToken(userId, 'another-outstanding-token');
        createToken(userId, 'already-used-token', future, past);

        const result = repository.resetPassword(
            'token-being-used',
            'new-password-hash',
            now,
        );

        expect(result).toBe(true);
        expect(getToken('token-being-used')?.used_at).toBe(now);
        expect(getToken('another-outstanding-token')?.used_at).toBe(now);
        expect(getToken('already-used-token')?.used_at).toBe(past);
    });

    it('revokes all sessions for the reset user but preserves other users’ sessions', () => {
        const firstUserId = createUser('firstuser');
        const secondUserId = createUser('seconduser');

        createToken(firstUserId, 'first-user-token');

        const sessionExpiry = Date.now() + 60 * 60 * 1000;

        db.prepare(`
            INSERT INTO sessions (sid, session, expires_at)
            VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
        `).run(
            'first-session-a',
            JSON.stringify({ userId: firstUserId, cookie: {} }),
            sessionExpiry,
            'first-session-b',
            JSON.stringify({ userId: firstUserId, cookie: {} }),
            sessionExpiry,
            'second-session',
            JSON.stringify({ userId: secondUserId, cookie: {} }),
            sessionExpiry,
        );

        const result = repository.resetPassword(
            'first-user-token',
            'new-password-hash',
            now,
        );

        expect(result).toBe(true);

        const remainingSessions = db.prepare(`
            SELECT sid FROM sessions ORDER BY sid
        `).all();

        expect(remainingSessions).toEqual([
            { sid: 'second-session' },
        ]);
    });

    it('rejects duplicate token hashes at the database level', () => {
        const firstUserId = createUser('firstuser');
        const secondUserId = createUser('seconduser');

        createToken(firstUserId, 'duplicate-hash');

        expect(() => {
            createToken(secondUserId, 'duplicate-hash');
        }).toThrow(/UNIQUE constraint failed/);
    });

    it('enforces the foreign-key relationship to users', () => {
        expect(() => {
            createToken(999, 'orphan-token');
        }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it('deletes a user’s reset tokens when that user is deleted', () => {
        const userId = createUser('firstuser');
        createToken(userId, 'token-to-cascade-delete');

        db.prepare('DELETE FROM users WHERE id = ?').run(userId);

        expect(getToken('token-to-cascade-delete')).toBeUndefined();
    });

    it('does not alter another user’s password during a reset', () => {
        const firstUserId = createUser('firstuser');
        const secondUserId = createUser('seconduser');

        createToken(firstUserId, 'first-user-token');

        const result = repository.resetPassword(
            'first-user-token',
            'new-first-user-password-hash',
            now,
        );

        expect(result).toBe(true);

        const secondUser = db.prepare(`
            SELECT password_hash FROM users WHERE id = ?
        `).get(secondUserId);

        expect(secondUser).toEqual({
            password_hash: 'hash-seconduser',
        });
    });
});
