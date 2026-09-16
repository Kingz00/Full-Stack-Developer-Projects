export type BattleStatus = 'active' | 'won' | 'lost' | 'draw';

export type RunStatus = 'active' | 'completed' | 'abandoned';

export interface BattleCombatant {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
}

export interface BattleState {
    player: BattleCombatant;
    enemy: BattleCombatant;
    status: BattleStatus;
}

export interface RoundResult {
    playerRoll: number;
    enemyRoll: number;
    playerDamage: number;
    enemyDamage: number;
    playerHealthAfter: number;
    enemyHealthAfter: number;
    status: BattleStatus;
}

export interface BattleRoundResult {
    state: BattleState;
    round: RoundResult;
}