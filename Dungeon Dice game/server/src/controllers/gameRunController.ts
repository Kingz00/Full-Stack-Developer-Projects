import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';
import { GameRunService } from '../services/gameRunService.js';

export class GameRunController {
    constructor(
        private readonly gameRunService: GameRunService
    ) { }

    createRun(req: Request, res: Response, next: NextFunction): void {
        try {
            const userId = this.getUserId(req);
            const selectedHeroId = this.getSelectedHeroId(req);

            const gameRun = this.gameRunService.createRun(
                userId,
                {
                    selectedHeroId,
                }
            );

            res.status(201).json({
                run: gameRun
            });
        } catch (error) {
            next(error);
        }
    }

    abandonRun(req: Request, res: Response, next: NextFunction): void {
        try {
            const userId = this.getUserId(req);
            const runId = this.getRunId(req);

            const gameRun = this.gameRunService.abandonRun(
                userId,
                runId
            );

            res.status(200).json({
                run: gameRun
            });
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

    private getSelectedHeroId(req: Request): number {
        const { selectedHeroId } = req.body;

        if (
            typeof selectedHeroId !== 'number' ||
            !Number.isInteger(selectedHeroId) ||
            selectedHeroId <= 0
        ) {
            throw new AppError(
                400,
                'A valid selected hero ID is required.',
            );
        }

        return selectedHeroId;
    }

    private getRunId(req: Request): number {
        const runId = Number(req.params.runId);

        if (!Number.isInteger(runId) || runId <= 0) {
            throw new AppError(
                400,
                'A valid game run ID is required.',
            );
        }

        return runId;
    }
}