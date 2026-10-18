import type Database from 'better-sqlite3';

export interface CreateVerificationTokenInput {
    userId: number;
    tokenHash: string;
    expiresAt: string;
    now: string;
}

export class EmailVerificationRepository {
    constructor(private readonly db: Database.Database) { }

    replaceTokenForUser(input: CreateVerificationTokenInput): void {
        const replaceToken = this.db.transaction(() => {
            // Invalidate any previously issued, unused tokens.
            this.db.prepare(`
                UPDATE email_verification_tokens
                SET used_at = ?
                WHERE user_id = ?
                  AND used_at IS NULL
            `).run(input.now, input.userId);

            this.db.prepare(`
                INSERT INTO email_verification_tokens (
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

    verifyToken(tokenHash: string, now: string): boolean {
        const verify = this.db.transaction(() => {
            const token = this.db.prepare(`
                SELECT id, user_id
                FROM email_verification_tokens
                WHERE token_hash = ?
                  AND used_at IS NULL
                  AND expires_at > ?
            `).get(tokenHash, now) as { id: number; user_id: number } | undefined;

            if (!token) {
                return false;
            }

            const consumed = this.db.prepare(`
                UPDATE email_verification_tokens
                SET used_at = ?
                WHERE id = ?
                  AND used_at IS NULL
            `).run(now, token.id);

            if (consumed.changes !== 1) {
                return false;
            }

            const updatedUser = this.db.prepare(`
                UPDATE users
                SET email_verified_at = COALESCE(email_verified_at, ?)
                WHERE id = ?
            `).run(now, token.user_id);

            return updatedUser.changes === 1;
        });

        return verify();
    }

    invalidateToken(tokenHash: string, now: string): void {
        this.db.prepare(`
            UPDATE email_verification_tokens
            SET used_at = ?
            WHERE token_hash = ?
            AND used_at IS NULL
        `).run(now, tokenHash);
    }

}