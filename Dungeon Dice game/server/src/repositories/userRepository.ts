import type Database from 'better-sqlite3';

import type { User } from '../domain/user/types.js';

export interface CreateUserInput {
    username: string;
    email: string;
    passwordHash: string;
}

export class UserRepository {
    constructor(private readonly db: Database.Database) { }

    create(input: CreateUserInput): User {
        const result = this.db
            .prepare(`
                        INSERT INTO users (
                        username,
                    email,
                        password_hash
                        )
                VALUES (?, ?, ?)
                    `)
            .run(input.username, input.email, input.passwordHash);

        const user = this.findById(Number(result.lastInsertRowid));

        if (!user) {
            throw new Error('Failed to retrieve created user.');
        }

        return user;
    }

    findByUsername(username: string): User | null {
        const row = this.db
            .prepare(`
                SELECT id, username, email, password_hash, created_at, email_verified_at
                        FROM users
                        WHERE username = ?
                `)
            .get(username);

        return row ? this.toDomain(row) : null;
    }

    findByEmail(email: string): User | null {
        const row = this.db
            .prepare(`
                SELECT id, username, email, password_hash, created_at, email_verified_at
                FROM users
                WHERE email = ?
            `)
            .get(email);

        return row ? this.toDomain(row) : null;
    }

    findById(id: number): User | null {
        const row = this.db
            .prepare(`
                SELECT id, username, email, password_hash, created_at, email_verified_at
                        FROM users
                        WHERE id = ?
                `)
            .get(id);

        return row ? this.toDomain(row) : null;
    }

    private toDomain(row: unknown): User {
        const user = row as {
            id: number;
            username: string;
            email: string | null;
            password_hash: string;
            created_at: string;
            email_verified_at: string | null;
        };

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            passwordHash: user.password_hash,
            createdAt: user.created_at,
            emailVerifiedAt: user.email_verified_at,
        };
    }
}