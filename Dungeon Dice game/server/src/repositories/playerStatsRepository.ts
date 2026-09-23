import type Database from 'better-sqlite3';

import type { BestRunStats, PlayerStatistics } from '../domain/playerStats/types.js';

export class PlayerStatsRepository {
    constructor(
        private readonly db: Database.Database
    ) { }

    getPlayerStatistics(userId: number): PlayerStatistics {
        const overallStats = this.db
            .prepare(`
                SELECT
                    COUNT(*) AS total_battles,
                    COUNT(
                        CASE
                            WHEN battles.status = 'won' THEN 1
                        END
                    ) AS wins,
                    COUNT(
                        CASE
                            WHEN battles.status = 'lost' THEN 1
                        END
                    ) AS losses,
                    COUNT(
                        CASE
                            WHEN battles.status = 'draw' THEN 1
                        END
                    ) AS draws
                FROM battles
                INNER JOIN game_runs
                    ON game_runs.id = battles.run_id
                WHERE game_runs.user_id = ?
                AND battles.status IN ('won', 'lost', 'draw')
            `)
            .get(userId) as {
                total_battles: number;
                wins: number;
                losses: number;
                draws: number;
            };

        const bestRunRow = this.db
            .prepare(`
                SELECT
                    game_runs.id AS run_id,
                    COUNT(*) AS total_battles,
                    COUNT(
                        CASE
                            WHEN battles.status = 'won' THEN 1
                        END
                    ) AS wins,
                    COUNT(
                        CASE
                            WHEN battles.status = 'lost' THEN 1
                        END
                    ) AS losses,
                    COUNT(
                        CASE
                            WHEN battles.status = 'draw' THEN 1
                        END
                    ) AS draws
                FROM game_runs
                INNER JOIN battles
                    ON battles.run_id = game_runs.id
                WHERE game_runs.user_id = ?
                AND game_runs.status = 'completed'
                AND battles.status IN ('won', 'lost', 'draw')
                GROUP BY game_runs.id
                HAVING COUNT(*) > 0
                ORDER BY
                    wins DESC,
                    losses ASC,
                    total_battles DESC,
                    game_runs.id ASC
                LIMIT 1
            `)
            .get(userId) as {
                run_id: number;
                total_battles: number;
                wins: number;
                losses: number;
                draws: number;
            } | undefined;

        const bestRun: BestRunStats | null = bestRunRow
            ? {
                runId: bestRunRow.run_id,
                totalBattles: bestRunRow.total_battles,
                wins: bestRunRow.wins,
                losses: bestRunRow.losses,
                draws: bestRunRow.draws,
            }
            : null;

        return {
            totalBattles: overallStats.total_battles,
            wins: overallStats.wins,
            losses: overallStats.losses,
            draws: overallStats.draws,
            bestRun
        };
    }
}