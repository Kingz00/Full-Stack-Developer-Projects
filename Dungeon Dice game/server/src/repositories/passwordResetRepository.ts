import type Database from 'better-sqlite3';

export interface CreatePasswordResetTokenInput {
    userId: number;
    tokenHash: string;
    expiresAt: string;
    now: string;
}

export class PasswordResetRepository {
    constructor(private readonly db: Database.Database) { }

    replaceTokenForUser(input: CreatePasswordResetTokenInput): void {
        const replaceToken = this.db.transaction(() => {
            this.db.prepare(`
                UPDATE password_reset_tokens
                SET used_at = ?
                WHERE user_id = ?
                  AND used_at IS NULL
            `).run(input.now, input.userId);

            this.db.prepare(`
                INSERT INTO password_reset_tokens (
                    user_id,
                    token_hash,
                    expires_at
                )
                VALUES (?, ?, ?)
            `).run(
                input.userId,
                input.tokenHash,
                input.expiresAt,
            );
        });

        replaceToken();
    }

    invalidateToken(tokenHash: string, now: string): void {
        this.db.prepare(`
            UPDATE password_reset_tokens
            SET used_at = ?
            WHERE token_hash = ?
              AND used_at IS NULL
        `).run(now, tokenHash);
    }

    resetPassword(tokenHash: string, passwordHash: string, now: string): boolean {
        const reset = this.db.transaction(() => {
            const token = this.db.prepare(`
                SELECT id, user_id
                FROM password_reset_tokens
                WHERE token_hash = ?
                  AND used_at IS NULL
                  AND expires_at > ?
            `).get(tokenHash, now) as { id: number; user_id: number } | undefined;

            if (!token) {
                return false;
            }

            const consumed = this.db.prepare(`
                UPDATE password_reset_tokens
                SET used_at = ?
                WHERE id = ?
                  AND used_at IS NULL
            `).run(now, token.id);

            if (consumed.changes !== 1) {
                return false;
            }

            const updatedUser = this.db.prepare(`
                UPDATE users
                SET password_hash = ?
                WHERE id = ?
            `).run(passwordHash, token.user_id);

            if (updatedUser.changes !== 1) {
                // Throwing rolls back token consumption as well.
                throw new Error(
                    'Failed to update password for reset token owner.'
                );
            }

            // Invalidate any other outstanding reset tokens.
            this.db.prepare(`
                UPDATE password_reset_tokens
                SET used_at = ?
                WHERE user_id = ?
                  AND used_at IS NULL
            `).run(now, token.user_id);

            // Sessions are JSON records in the existing SQLite session store.
            // Revoke every stored session belonging to this user.
            this.db.prepare(`
                DELETE FROM sessions
                WHERE json_extract(session, '$.userId') = ?
            `).run(token.user_id);

            return true;
        });

        return reset();
    }
}