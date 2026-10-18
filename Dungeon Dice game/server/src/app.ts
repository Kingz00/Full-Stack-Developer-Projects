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

import { RecaptchaService } from './services/recaptchaService.js'

import { EmailVerificationController } from './controllers/emailVerificationController.js';
import { EmailVerificationRepository } from './repositories/emailVerificationRepository.js';
import { createEmailVerificationRoutes } from './routes/emailVerificationRoutes.js';
import { EmailVerificationService } from './services/emailVerificationService.js';
import { BrevoEmailSender, type EmailSender } from './services/emailSender.js';

import { PasswordRecoveryController } from './controllers/passwordRecoveryController.js';
import { PasswordResetRepository } from './repositories/passwordResetRepository.js';
import { createPasswordRecoveryRoutes } from './routes/passwordRecoveryRoutes.js';
import { PasswordRecoveryService } from './services/passwordRecoveryService.js';

export function createApp(db: Database.Database, options: { emailSender?: EmailSender } = {}) {
    const app = express();

    if (process.env.NODE_ENV === 'production') {
        // Assumes exactly one trusted reverse proxy in front of Express.
        app.set('trust proxy', 1);
    }

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
    app.use(createSessionMiddleware(db));

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
    const recaptchaService = new RecaptchaService()
    const userRepository = new UserRepository(db);
    const authService = new AuthService(userRepository);
    const sessionService = new SessionService();
    const currentUserService = new CurrentUserService(userRepository)

    const authController = new AuthController(
        authService,
        sessionService,
        currentUserService,
        gameRunService,
        recaptchaService
    );

    // Email Verification
    const emailVerificationRepository = new EmailVerificationRepository(db);
    const emailSender = options.emailSender ?? new BrevoEmailSender();
    const emailVerificationService = new EmailVerificationService(
        userRepository,
        emailVerificationRepository,
        emailSender,
        frontendOrigin
    );

    const emailVerificationController = new EmailVerificationController(emailVerificationService);

    // Password Recovery
    const passwordResetRepository = new PasswordResetRepository(db);
    const passwordRecoveryService = new PasswordRecoveryService(
        userRepository,
        passwordResetRepository,
        emailSender,
        frontendOrigin
    );

    const passwordRecoveryController = new PasswordRecoveryController(passwordRecoveryService);

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
    app.use('/api/auth/email-verification', createEmailVerificationRoutes(emailVerificationController));
    app.use('/api/auth', createPasswordRecoveryRoutes(passwordRecoveryController));
    app.use('/api', createHeroRoutes(heroController));
    app.use('/api/runs', createGameRunRoutes(gameRunController));
    app.use('/api', createBattleRoutes(battleController));
    app.use('/api/stats', createPlayerStatsRoutes(playerStatsController));

    app.get('/api/health', (_req, res) => {
        try {
            db.prepare('SELECT 1').get();

            res.status(200).json({
                status: 'ok',
                database: 'ok',
            });
        } catch {
            res.status(503).json({
                status: 'unavailable',
                database: 'unavailable',
            });
        }
    });

    // Error handler must be registered after the routes
    app.use(errorHandler);

    return app;
}