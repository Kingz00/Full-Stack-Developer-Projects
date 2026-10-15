import 'dotenv/config';
import session from 'express-session';
import type Database from 'better-sqlite3';

import { SQLiteSessionStore } from '../db/sqliteSessionStore.js';

/* Using persistent SQLite session store */

export function createSessionMiddleware(db: Database.Database) {
    const secret = process.env.SESSION_SECRET;

    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error(
            'SESSION_SECRET must be configured with at least 32 bytes.',
        );
    }

    return session({
        name: 'dungeon.sid',
        secret,
        store: new SQLiteSessionStore(db),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24,
        },
    });
}

/* Using in-memory store */

// export function createSessionMiddleware() {
//     return session({
//         secret: process.env.SESSION_SECRET ?? 'development-secret',
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             httpOnly: true,
//             sameSite: 'lax',
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 1000 * 60 * 60 * 24,
//         },
//     });
// }