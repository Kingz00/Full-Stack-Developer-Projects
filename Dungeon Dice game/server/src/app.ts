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

import { GameRunController } from './controllers/gameRunController.js';
import { createGameRunRoutes } from './routes/gameRunRoutes.js';
import { GameRunService } from './services/gameRunService.js';

import { BattleController } from './controllers/battleController.js';
import { BattleRepository } from './repositories/battleRepository.js';
import { GameRunRepository } from './repositories/gameRunRepository.js';
import { HeroRepository } from './repositories/heroRepository.js';
import { BattleEngine } from './domain/battle/battleEngine.js';
import { BattleService } from './services/battleService.js';
import { createBattleRoutes } from './routes/battleRoutes.js';

export function createApp(db: Database.Database) {
    const app = express();

    app.use(express.json());
    app.use(createSessionMiddleware());

    // Dependency composition
    // Authentication
    const userRepository = new UserRepository(db);
    const authService = new AuthService(userRepository);
    const sessionService = new SessionService();

    const authController = new AuthController(
        authService,
        sessionService,
        userRepository
    );

    // GameRun and Battle Service
    const gameRunRepository = new GameRunRepository(db);
    const heroRepository = new HeroRepository(db);
    const battleRepository = new BattleRepository(db);

    const gameRunService = new GameRunService(
        gameRunRepository,
        heroRepository
    );

    const gameRunController = new GameRunController(gameRunService);

    const battleEngine = new BattleEngine();

    const battleService = new BattleService(
        gameRunRepository,
        heroRepository,
        battleRepository,
        battleEngine
    );

    const battleController = new BattleController(battleService);

    // Routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/runs', createGameRunRoutes(gameRunController));
    app.use('/api', createBattleRoutes(battleController));

    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
        });
    });

    // Error handler must be registered after the routes
    app.use(errorHandler);

    return app;
}