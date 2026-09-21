import type { Request, Response, NextFunction } from 'express';

import type { Credentials } from '../domain/auth/types.js';
import { toAuthUser } from '../domain/user/toAuthUser.js';
import { AppError } from '../errors/AppError.js';
import { AuthService } from '../services/authService.js';
import { SessionService } from '../services/sessionService.js';
import { UserRepository } from '../repositories/userRepository.js';
import { GameRunService } from '../services/gameRunService.js';

export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
        private readonly userRepository: UserRepository,
        private readonly gameRunService: GameRunService
    ) { }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const credentials = this.getCredentials(req);

            const user = await this.authService.register(credentials);

            await this.sessionService.create(req, user.id);

            res.status(201).json({
                user: toAuthUser(user),
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const credentials = this.getCredentials(req);

            const user = await this.authService.login(credentials);

            await this.sessionService.create(req, user.id);

            res.status(200).json({
                user: toAuthUser(user),
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.session.userId;
            const runId = req.session.runId;

            if (userId !== undefined && runId !== undefined) {
                this.gameRunService.completeRun(userId, runId);
            }

            await this.sessionService.destroy(req.session);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (req.session.userId === undefined) {
                throw new AppError(401, 'Authentication required.');
            }

            const user = this.userRepository.findById(req.session.userId);

            if (!user) {
                await this.sessionService.destroy(req.session);

                throw new AppError(401, 'Authentication required.');
            }

            res.status(200).json({
                user: toAuthUser(user),
            });
        } catch (error) {
            next(error);
        }
    }

    private getCredentials(req: Request): Credentials {
        const { username, password } = req.body;

        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            username.trim() === '' ||
            password === ''
        ) {
            throw new AppError(
                400,
                'Username and password are required.',
            );
        }

        const normalizedUsername = username.trim();
        const regex = /^[A-Za-z0-9_-]+$/

        if (
            normalizedUsername.length > 20 ||
            !regex.test(normalizedUsername)
        ) {
            throw new AppError(
                400,
                'Username must be 1–20 characters, using letters, numbers, _ or -.',
            );
        }

        return {
            username: normalizedUsername,
            password
        };
    }
}