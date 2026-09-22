import type { GameRun } from '../domain/gameRun/types.js';
import { AppError } from '../errors/AppError.js';
import { GameRunRepository } from '../repositories/gameRunRepository.js';
import { HeroRepository } from '../repositories/heroRepository.js';
import { BattleRepository } from '../repositories/battleRepository.js';
import type Database from 'better-sqlite3';

export interface CreateGameRunInput {
    selectedHeroId: number;
}

export class GameRunService {
    constructor(
        private readonly gameRunRepository: GameRunRepository,
        private readonly heroRepository: HeroRepository,
        private readonly battleRepository: BattleRepository,
        private readonly db: Database.Database
    ) { }

    createRun(userId: number, input: CreateGameRunInput): GameRun {
        const hero = this.heroRepository.findById(
            input.selectedHeroId
        );

        if (!hero) {
            throw new AppError(404, 'Selected hero not found.');
        }

        const activeRun = this.gameRunRepository.findActiveByUserId(userId);

        if (activeRun) {
            throw new AppError(
                409,
                'An active game run already exists.',
            );
        }

        return this.gameRunRepository.create({
            userId,
            selectedHeroId: hero.id
        });
    }

    abandonRun(userId: number, runId: number): GameRun {
        const gameRun = this.gameRunRepository.findByIdForUser(
            runId,
            userId
        );

        if (!gameRun) {
            throw new AppError(404, 'Game run not found.');
        }

        if (gameRun.status !== 'active') {
            throw new AppError(409, 'Game run is not active.');
        }

        const transaction = this.db.transaction(() => {
            this.battleRepository.abandonActiveByRunId(runId);

            const updatedGameRun = this.gameRunRepository.updateStatus(
                runId,
                'abandoned'
            );

            if (!updatedGameRun) {
                throw new AppError(404, 'Game run not found.');
            }

            return updatedGameRun;
        });

        return transaction();
    }

    completeRun(userId: number, runId: number): GameRun {
        const gameRun = this.gameRunRepository.findByIdForUser(
            runId,
            userId
        );

        if (!gameRun) {
            throw new AppError(404, 'Game run not found.');
        }

        if (gameRun.status !== 'active') {
            throw new AppError(409, 'Game run is not active.');
        }

        const transaction = this.db.transaction(() => {
            this.battleRepository.abandonActiveByRunId(runId);

            const updatedGameRun = this.gameRunRepository.updateStatus(
                runId,
                'completed'
            );

            if (!updatedGameRun) {
                throw new AppError(404, 'Game run not found.');
            }

            return updatedGameRun;
        });

        return transaction();
    }
}