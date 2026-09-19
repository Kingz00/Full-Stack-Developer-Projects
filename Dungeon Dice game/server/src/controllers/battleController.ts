import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';
import { BattleService } from '../services/battleService.js';

export class BattleController {
    constructor(
        private readonly battleService: BattleService,
    ) { }

    startBattle(req: Request, res: Response, next: NextFunction): void {
        try {
            const userId = this.getUserId(req);
            const runId = this.getIdParam(req, 'runId');

            const battle = this.battleService.startBattle(userId, {
                runId,
            });

            res.status(201).json({
                battle
            });
        } catch (error) {
            next(error);
        }
    }

    playRound(req: Request, res: Response, next: NextFunction): void {
        try {
            const userId = this.getUserId(req);
            const battleId = this.getIdParam(req, 'battleId');

            const result = this.battleService.playRound(
                userId,
                battleId
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    private getUserId(req: Request): number {
        if (req.session.userId === undefined) {
            throw new AppError(401, 'Authentication required.');
        }

        return req.session.userId;
    }

    private getIdParam(req: Request, name: string): number {
        const value = Number(req.params[name]);

        if (!Number.isInteger(value) || value <= 0) {
            throw new AppError(400, `Invalid ${name}.`);
        }

        return value;
    }
}