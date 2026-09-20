import { describe, expect, it, vi } from 'vitest';

import type { GameRun } from '../domain/gameRun/types.js';
import type { Hero } from '../domain/hero/types.js';
import type { GameRunRepository } from '../repositories/gameRunRepository.js';
import type { HeroRepository } from '../repositories/heroRepository.js';

import { GameRunService } from './gameRunService.js';

describe('GameRunService', () => {
    const selectedHero: Hero = {
        id: 1,
        name: 'Warrior',
        description: 'A strong warrior.',
        imageUrl: 'warrior.png',
        health: 100,
        attack: 15,
        defense: 8,
    };

    const createdGameRun: GameRun = {
        id: 1,
        userId: 10,
        selectedHeroId: 1,
        status: 'active',
        startedAt: '2026-09-19T10:00:00.000Z',
        completedAt: null,
    };

    function createService() {
        const gameRunRepository = {
            create: vi.fn(),
            findByIdForUser: vi.fn(),
            updateStatus: vi.fn(),
        } as unknown as GameRunRepository;

        const heroRepository = {
            findById: vi.fn(),
        } as unknown as HeroRepository;

        const service = new GameRunService(
            gameRunRepository,
            heroRepository,
        );

        return {
            service,
            gameRunRepository,
            heroRepository,
        };
    }

    describe('createRun', () => {
        it('creates a game run for a valid selected hero', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
            } = createService();

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(gameRunRepository.create)
                .mockReturnValue(createdGameRun);

            const gameRun = service.createRun(10, {
                selectedHeroId: 1
            });

            expect(gameRun).toEqual(createdGameRun);

            expect(heroRepository.findById)
                .toHaveBeenCalledWith(1);

            expect(gameRunRepository.create)
                .toHaveBeenCalledWith({
                    userId: 10,
                    selectedHeroId: 1
                });
        });

        it('throws when the selected hero does not exist', () => {
            const {
                service,
                gameRunRepository,
                heroRepository
            } = createService();

            vi.mocked(heroRepository.findById)
                .mockReturnValue(null);

            expect(() =>
                service.createRun(10, {
                    selectedHeroId: 999,
                }),
            ).toThrow('Selected hero not found.');

            expect(gameRunRepository.create)
                .not.toHaveBeenCalled();
        });
    });

    describe('abandonRun', () => {
        it('abandons an active game run belonging to the user', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            const abandonedGameRun: GameRun = {
                ...createdGameRun,
                status: 'abandoned',
                completedAt: '2026-09-20 05:00:00',
            };

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(createdGameRun);

            vi.mocked(gameRunRepository.updateStatus)
                .mockReturnValue(abandonedGameRun);

            const gameRun = service.abandonRun(10, 1);

            expect(gameRun).toEqual(abandonedGameRun);

            expect(gameRunRepository.findByIdForUser)
                .toHaveBeenCalledWith(1, 10);

            expect(gameRunRepository.updateStatus)
                .toHaveBeenCalledWith(1, 'abandoned');
        });

        it('throws when the game run does not exist or belong to the user', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(null);

            expect(() =>
                service.abandonRun(10, 999),
            ).toThrow('Game run not found.');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the game run is already completed', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...createdGameRun,
                    status: 'completed',
                    completedAt: '2026-09-20 05:00:00',
                });

            expect(() =>
                service.abandonRun(10, 1),
            ).toThrow('Game run is not active.');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the game run is already abandoned', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...createdGameRun,
                    status: 'abandoned',
                    completedAt: '2026-09-20 05:00:00',
                });

            expect(() =>
                service.abandonRun(10, 1),
            ).toThrow('Game run is not active.');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });
    });
});