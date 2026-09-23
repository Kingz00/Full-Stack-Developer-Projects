export interface BestRunStats {
    runId: number;
    totalBattles: number;
    wins: number;
    losses: number;
    draws: number;
}

export interface PlayerStatistics {
    totalBattles: number;
    wins: number;
    losses: number;
    draws: number;
    bestRun: BestRunStats | null;
}