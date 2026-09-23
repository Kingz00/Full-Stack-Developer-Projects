import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';
import { PlayerStatsService } from '../services/playerStatsService.js';

export class PlayerStatsController {
    constructor(
        private readonly playerStatsService: PlayerStatsService
    ) { }

    getPlayerStatistics(req: Request, res: Response, next: NextFunction): void {
        try {
            const userId = this.getUserId(req);

            const statistics =
                this.playerStatsService.getPlayerStatistics(userId);

            res.status(200).json({
                statistics
            });
        } catch (error) {
            next(error);
        }
    }

    private getUserId(req: Request): number {
        if (req.session.userId === undefined) {
            throw new AppError(
                401,
                'Authentication required.'
            );
        }

        return req.session.userId;
    }
}