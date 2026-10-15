import session from 'express-session';
import type Database from 'better-sqlite3';

type SessionCallback = (error?: unknown) => void;

export class SQLiteSessionStore extends session.Store {
    constructor(private readonly db: Database.Database) {
        super();

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                sid TEXT PRIMARY KEY,
                session TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
                ON sessions(expires_at);
        `);

        this.deleteExpiredSessions();
    }

    private deleteExpiredSessions(): void {
        this.db.prepare(`
            DELETE FROM sessions
            WHERE expires_at <= ?
        `).run(Date.now());
    }

    get(
        sid: string,
        callback: (error: unknown, session?: session.SessionData | null) => void,
    ): void {
        try {
            const row = this.db.prepare(`
                SELECT session, expires_at
                FROM sessions
                WHERE sid = ?
            `).get(sid) as
                | { session: string; expires_at: number }
                | undefined;

            if (!row || row.expires_at <= Date.now()) {
                if (row) {
                    this.destroy(sid, () => { });
                }

                callback(null, null);
                return;
            }

            callback(null, JSON.parse(row.session) as session.SessionData);
        } catch (error) {
            callback(error);
        }
    }

    set(
        sid: string,
        sessionData: session.SessionData,
        callback?: SessionCallback,
    ): void {
        try {
            const cookieExpiry = sessionData.cookie.expires
                ? new Date(sessionData.cookie.expires).getTime()
                : Date.now() + (sessionData.cookie.maxAge ?? 0);

            this.db.prepare(`
                INSERT INTO sessions (sid, session, expires_at)
                VALUES (?, ?, ?)
                ON CONFLICT(sid) DO UPDATE SET
                    session = excluded.session,
                    expires_at = excluded.expires_at
            `).run(sid, JSON.stringify(sessionData), cookieExpiry);

            this.deleteExpiredSessions();
            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    touch(
        sid: string,
        sessionData: session.SessionData,
        callback?: SessionCallback,
    ): void {
        try {
            const cookieExpiry = sessionData.cookie.expires
                ? new Date(sessionData.cookie.expires).getTime()
                : Date.now() + (sessionData.cookie.maxAge ?? 0);

            this.db.prepare(`
                UPDATE sessions
                SET expires_at = ?
                WHERE sid = ?
            `).run(cookieExpiry, sid);

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    destroy(sid: string, callback?: SessionCallback): void {
        try {
            this.db.prepare(`
                DELETE FROM sessions
                WHERE sid = ?
            `).run(sid);

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }
}
