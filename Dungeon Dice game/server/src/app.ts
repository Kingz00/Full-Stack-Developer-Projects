import express from 'express';
import type Database from 'better-sqlite3';

import { AuthController } from './controllers/authController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/requireAuth.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { AuthService } from './services/authService.js';
import { SessionService } from './services/sessionService.js';
import { UserRepository } from './repositories/userRepository.js';
import { createSessionMiddleware } from './config/session.js';

export function createApp(db: Database.Database) {
    const app = express();

    app.use(express.json());
    app.use(createSessionMiddleware());

    // Dependency composition
    const userRepository = new UserRepository(db);
    const authService = new AuthService(userRepository);
    const sessionService = new SessionService();

    const authController = new AuthController(
        authService,
        sessionService,
        userRepository
    );

    // Routes
    app.use('/api/auth', createAuthRoutes(authController));

    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
        });
    });

    // Error handler must be registered after the routes
    app.use(errorHandler);

    return app;
}