import { describe, expect, it, vi } from 'vitest';

import type { PlayerStatistics } from '../domain/playerStats/types.js';
import type { PlayerStatsRepository } from '../repositories/playerStatsRepository.js';

import { PlayerStatsService } from './playerStatsService.js';

describe('PlayerStatsService', () => {
    function createService() {
        const playerStatsRepository = {
            getPlayerStatistics: vi.fn(),
        } as unknown as PlayerStatsRepository;

        const service = new PlayerStatsService(playerStatsRepository);

        return {
            service,
            playerStatsRepository
        };
    }

    it('returns player statistics from the repository', () => {
        const {
            service,
            playerStatsRepository
        } = createService();

        const statistics: PlayerStatistics = {
            totalBattles: 10,
            wins: 5,
            losses: 3,
            draws: 2,
            bestRun: {
                runId: 7,
                totalBattles: 5,
                wins: 3,
                losses: 1,
                draws: 1,
            },
        };

        vi.mocked(
            playerStatsRepository.getPlayerStatistics,
        ).mockReturnValue(statistics);

        const result = service.getPlayerStatistics(42);

        expect(
            playerStatsRepository.getPlayerStatistics
        ).toHaveBeenCalledWith(42);

        expect(result).toEqual(statistics);
    });
});