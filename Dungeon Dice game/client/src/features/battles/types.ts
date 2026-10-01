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

export type BattleRoundStatus = 'active' | 'won' | 'lost' | 'draw'

export interface BattleCombatant {
    health: number
    maxHealth: number
    attack: number
    defense: number
}

export interface BattleState {
    player: BattleCombatant
    enemy: BattleCombatant
    status: BattleStatus
}

export interface RoundResult {
    playerRoll: number
    enemyRoll: number
    playerDamage: number
    enemyDamage: number
    playerHealthAfter: number
    enemyHealthAfter: number
    status: BattleRoundStatus
}

export interface BattleRoundResult {
    state: BattleState
    round: RoundResult
}