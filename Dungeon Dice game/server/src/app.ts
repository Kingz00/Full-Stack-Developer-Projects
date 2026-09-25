import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

import { PlayerStatsController } from './controllers/playerStatsController.js';
import { PlayerStatsRepository } from './repositories/playerStatsRepository.js';
import { createPlayerStatsRoutes } from './routes/playerStatsRoutes.js';
import { PlayerStatsService } from './services/playerStatsService.js';
import { CurrentUserService } from './services/currentUserService.js';

import { HeroController } from './controllers/heroController.js';
import { createHeroRoutes } from './routes/heroRoutes.js';

export function createApp(db: Database.Database) {
    const app = express();

    const frontendOrigin = process.env.FRONTEND_ORIGIN

    if (!frontendOrigin) {
        throw new Error('FRONTEND_ORIGIN is not configured.')
    }

    app.use(
        cors({
            origin: frontendOrigin,
            credentials: true
        })
    )

    app.use(express.json());
    app.use(createSessionMiddleware());

    // Dependency composition

    // GameRun Service
    const gameRunRepository = new GameRunRepository(db);
    const heroRepository = new HeroRepository(db);
    const battleRepository = new BattleRepository(db);

    const heroController = new HeroController(heroRepository);

    const gameRunService = new GameRunService(
        gameRunRepository,
        heroRepository,
        battleRepository,
        db
    );

    const gameRunController = new GameRunController(gameRunService);

    // Authentication
    const userRepository = new UserRepository(db);
    const authService = new AuthService(userRepository);
    const sessionService = new SessionService();
    const currentUserService = new CurrentUserService(userRepository)

    const authController = new AuthController(
        authService,
        sessionService,
        currentUserService,
        gameRunService
    );

    // Battle Service
    const battleEngine = new BattleEngine();

    const battleService = new BattleService(
        gameRunRepository,
        heroRepository,
        battleRepository,
        battleEngine
    );

    const battleController = new BattleController(battleService);

    // Player Statistics
    const playerStatsRepository = new PlayerStatsRepository(db);

    const playerStatsService = new PlayerStatsService(playerStatsRepository);

    const playerStatsController = new PlayerStatsController(playerStatsService);

    // Routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api', createHeroRoutes(heroController));
    app.use('/api/runs', createGameRunRoutes(gameRunController));
    app.use('/api', createBattleRoutes(battleController));
    app.use('/api/stats', createPlayerStatsRoutes(playerStatsController));

    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
        });
    });

    // Error handler must be registered after the routes
    app.use(errorHandler);

    return app;
}