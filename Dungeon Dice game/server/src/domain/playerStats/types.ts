export interface BestRunStats {
    runId: number;
    runNumber: number;
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