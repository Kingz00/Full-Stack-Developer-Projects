export interface BestRunStatistics {
    runId: number
    runNumber: number
    totalBattles: number
    wins: number
    losses: number
    draws: number
}

export interface PlayerStatistics {
    totalBattles: number
    wins: number
    losses: number
    draws: number
    bestRun: BestRunStatistics | null
}

export interface StatisticsLoaderData {
    statistics: PlayerStatistics
}