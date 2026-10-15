/// <reference path="../types/express-session.d.ts" />
import Database from 'better-sqlite3';
import session from 'express-session';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SQLiteSessionStore } from './sqliteSessionStore.js';

describe('SQLiteSessionStore', () => {
    let db: Database.Database;
    let store: SQLiteSessionStore;

    beforeEach(() => {
        vi.useRealTimers();

        db = new Database(':memory:');
        store = new SQLiteSessionStore(db);
    });

    afterEach(() => {
        db.close();
        vi.restoreAllMocks();
    });

    function createSessionData(
        overrides: Partial<session.SessionData> = {},
    ): session.SessionData {
        return {
            cookie: {
                originalMaxAge: 60_000,
                maxAge: 60_000,
                expires: new Date(Date.now() + 60_000),
                secure: false,
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
            },
            userId: 42,
            ...overrides,
        } as session.SessionData;
    }

    function getSession(sid: string) {
        return new Promise<session.SessionData | null>((resolve, reject) => {
            store.get(sid, (error, storedSession) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(storedSession ?? null);
            });
        });
    }

    function saveSession(
        sid: string,
        data: session.SessionData,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            store.set(sid, data, (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    function destroySession(sid: string): Promise<void> {
        return new Promise((resolve, reject) => {
            store.destroy(sid, (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    it('creates the sessions table and expiry index', () => {
        const tables = db.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = 'sessions'
        `).all();

        const indexes = db.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'index'
              AND name = 'idx_sessions_expires_at'
        `).all();

        expect(tables).toHaveLength(1);
        expect(indexes).toHaveLength(1);
    });

    it('saves and retrieves a session', async () => {
        const data = createSessionData();

        await saveSession('session-1', data);

        await expect(getSession('session-1')).resolves.toMatchObject({
            userId: 42,
            cookie: {
                httpOnly: true,
                sameSite: 'lax',
            },
        });
    });

    it('updates an existing session instead of inserting a duplicate', async () => {
        await saveSession('session-1', createSessionData());

        await saveSession(
            'session-1',
            createSessionData({ userId: 99 }),
        );

        await expect(getSession('session-1')).resolves.toMatchObject({
            userId: 99,
        });

        const rows = db.prepare(`
            SELECT COUNT(*) AS count
            FROM sessions
            WHERE sid = ?
        `).get('session-1') as { count: number };

        expect(rows.count).toBe(1);
    });

    it('returns null when the session does not exist', async () => {
        await expect(getSession('missing')).resolves.toBeNull();
    });

    it('does not return an expired session', async () => {
        await saveSession(
            'expired-session',
            createSessionData({
                cookie: {
                    ...createSessionData().cookie,
                    expires: new Date(Date.now() - 1_000),
                },
            }),
        );

        await expect(getSession('expired-session')).resolves.toBeNull();

        const row = db.prepare(`
            SELECT sid
            FROM sessions
            WHERE sid = ?
        `).get('expired-session');

        expect(row).toBeUndefined();
    });

    it('deletes expired sessions when the store is initialized', async () => {
        await saveSession(
            'expired-session',
            createSessionData({
                cookie: {
                    ...createSessionData().cookie,
                    expires: new Date(Date.now() - 1_000),
                },
            }),
        );

        // Constructing a new store runs its expiry cleanup.
        new SQLiteSessionStore(db);

        const row = db.prepare(`
            SELECT sid
            FROM sessions
            WHERE sid = ?
        `).get('expired-session');

        expect(row).toBeUndefined();
    });

    it('destroys a session', async () => {
        await saveSession('session-1', createSessionData());

        await destroySession('session-1');

        await expect(getSession('session-1')).resolves.toBeNull();
    });

    it('updates the session expiry through touch', async () => {
        await saveSession('session-1', createSessionData());

        const newExpiry = Date.now() + 120_000;

        const data = createSessionData({
            cookie: {
                ...createSessionData().cookie,
                expires: new Date(newExpiry),
            },
        });

        await new Promise<void>((resolve, reject) => {
            store.touch('session-1', data, (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });

        const row = db.prepare(`
            SELECT expires_at
            FROM sessions
            WHERE sid = ?
        `).get('session-1') as { expires_at: number };

        expect(row.expires_at).toBe(newExpiry);
    });

    it('does not fail when touching a session that does not exist', async () => {
        await expect(
            new Promise<void>((resolve, reject) => {
                store.touch(
                    'missing',
                    createSessionData(),
                    (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve();
                    },
                );
            }),
        ).resolves.toBeUndefined();
    });
});