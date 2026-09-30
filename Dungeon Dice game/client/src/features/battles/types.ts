export type BattleStatus = 'active' | 'won' | 'lost' | 'draw' | 'abandoned'

export interface Battle {
    id: number
    runId: number
    heroId: number
    playerHealth: number
    playerMaxHealth: number
    enemyName: string
    enemyImageUrl: string
    enemyHealth: number
    enemyMaxHealth: number
    enemyAttack: number
    enemyDefense: number
    status: BattleStatus
    startedAt: string
    completedAt: string | null
}