import type { PlayerStatistics } from '../domain/playerStats/types.js';
import { PlayerStatsRepository } from '../repositories/playerStatsRepository.js';

export class PlayerStatsService {
    constructor(
        private readonly playerStatsRepository: PlayerStatsRepository
    ) { }

    getPlayerStatistics(userId: number): PlayerStatistics {
        return this.playerStatsRepository.getPlayerStatistics(userId);
    }
}