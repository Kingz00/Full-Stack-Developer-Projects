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

export interface Battle {
    id: number;
    runId: number;
    heroId: number;

    playerHealth: number;
    playerMaxHealth: number;

    enemyName: string;
    enemyHealth: number;
    enemyMaxHealth: number;
    enemyAttack: number;
    enemyDefense: number;

    status: BattleStatus;
    startedAt: string;
    completedAt: string | null;
}

export interface BattleRound {
    id: number;
    battleId: number;
    roundNumber: number;
    playerRoll: number;
    enemyRoll: number;
    playerDamage: number;
    enemyDamage: number;
    playerHealthAfter: number;
    enemyHealthAfter: number;
    outcome: 'active' | 'win' | 'loss' | 'draw';
    createdAt: string;
}