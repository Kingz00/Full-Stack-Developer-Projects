import 'dotenv/config';
import type { Server } from 'node:http';

import db from './db/database.js';
import { closeServer, initializeDatabase } from './serverLifecycle.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);

let server: Server | undefined;
let shuttingDown = false;

async function startServer(): Promise<void> {
    try {
        initializeDatabase(db);

        const app = createApp(db);

        server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

        server.on('error', (error) => {
            console.error('HTTP server error:', error);
            void shutdown(1);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        db.close();
        process.exitCode = 1;
    }
}

function shutdown(exitCode = 0): Promise<void> {
    if (shuttingDown) {
        return Promise.resolve();
    }

    shuttingDown = true;
    process.exitCode = exitCode;

    if (!server) {
        if (db.open) {
            db.close();
        }

        return Promise.resolve();
    }

    return closeServer(server, db);
}

process.once('SIGINT', () => {
    void shutdown();
});

process.once('SIGTERM', () => {
    void shutdown();
});

void startServer();