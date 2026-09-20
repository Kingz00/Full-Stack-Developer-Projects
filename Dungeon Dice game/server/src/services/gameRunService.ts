import type { GameRun } from '../domain/gameRun/types.js';
import { AppError } from '../errors/AppError.js';
import { GameRunRepository } from '../repositories/gameRunRepository.js';
import { HeroRepository } from '../repositories/heroRepository.js';

export interface CreateGameRunInput {
    selectedHeroId: number;
}

export class GameRunService {
    constructor(
        private readonly gameRunRepository: GameRunRepository,
        private readonly heroRepository: HeroRepository,
    ) { }

    createRun(userId: number, input: CreateGameRunInput): GameRun {
        const hero = this.heroRepository.findById(
            input.selectedHeroId
        );

        if (!hero) {
            throw new AppError(404, 'Selected hero not found.');
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

        const updatedGameRun = this.gameRunRepository.updateStatus(
            runId,
            'abandoned'
        );

        if (!updatedGameRun) {
            throw new AppError(404, 'Game run not found.');
        }

        return updatedGameRun;
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

        const updatedGameRun = this.gameRunRepository.updateStatus(
            runId,
            'completed'
        );

        if (!updatedGameRun) {
            throw new AppError(404, 'Game run not found.');
        }

        return updatedGameRun;
    }
}