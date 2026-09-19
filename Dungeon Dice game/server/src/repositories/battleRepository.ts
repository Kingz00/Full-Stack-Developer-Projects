import type Database from 'better-sqlite3';

import type { Battle, BattleRound, BattleStatus } from '../domain/battle/types.js';

export interface CreateBattleInput {
    runId: number;
    heroId: number;
    playerHealth: number;
    playerMaxHealth: number;
    enemyName: string;
    enemyHealth: number;
    enemyMaxHealth: number;
    enemyAttack: number;
    enemyDefense: number;
}

export interface CreateBattleRoundInput {
    battleId: number;
    roundNumber: number;
    playerRoll: number;
    enemyRoll: number;
    playerDamage: number;
    enemyDamage: number;
    playerHealthAfter: number;
    enemyHealthAfter: number;
    outcome: 'active' | 'win' | 'loss' | 'draw';
}

export interface UpdateBattleStateInput {
    playerHealth: number;
    enemyHealth: number;
    status: BattleStatus;
}

export class BattleRepository {
    constructor(private readonly db: Database.Database) { }

    createBattle(input: CreateBattleInput): Battle {
        const result = this.db
            .prepare(`
                            INSERT INTO battles (
                            run_id,
                            hero_id,
                            player_health,
                            player_max_health,
                            enemy_name,
                            enemy_health,
                            enemy_max_health,
                            enemy_attack,
                            enemy_defense
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `)
            .run(
                input.runId,
                input.heroId,
                input.playerHealth,
                input.playerMaxHealth,
                input.enemyName,
                input.enemyHealth,
                input.enemyMaxHealth,
                input.enemyAttack,
                input.enemyDefense,
            );

        const battle = this.findById(Number(result.lastInsertRowid));

        if (!battle) {
            throw new Error('Failed to retrieve created battle.');
        }

        return battle;
    }

    findById(id: number): Battle | null {
        const row = this.db
            .prepare(`
                        SELECT
                            id,
                            run_id,
                            hero_id,
                            player_health,
                            player_max_health,
                            enemy_name,
                            enemy_health,
                            enemy_max_health,
                            enemy_attack,
                            enemy_defense,
                            status,
                            started_at,
                            completed_at
                        FROM battles
                        WHERE id = ?
                    `)
            .get(id);

        if (!row) {
            return null;
        }

        return this.toBattleDomain(row);
    }

    findByIdForUser(id: number, userId: number): Battle | null {
        const row = this.db
            .prepare(`
                        SELECT
                            battles.id,
                            battles.run_id,
                            battles.hero_id,
                            battles.player_health,
                            battles.player_max_health,
                            battles.enemy_name,
                            battles.enemy_health,
                            battles.enemy_max_health,
                            battles.enemy_attack,
                            battles.enemy_defense,
                            battles.status,
                            battles.started_at,
                            battles.completed_at
                        FROM battles
                        INNER JOIN game_runs
                            ON game_runs.id = battles.run_id
                        WHERE battles.id = ?
                        AND game_runs.user_id = ?
                    `)
            .get(id, userId);

        if (!row) {
            return null;
        }

        return this.toBattleDomain(row);
    }

    addRound(input: CreateBattleRoundInput): BattleRound {
        const result = this.db
            .prepare(`
                            INSERT INTO battle_rounds (
                                battle_id,
                                round_number,
                                player_roll,
                                enemy_roll,
                                player_damage,
                                enemy_damage,
                                player_health_after,
                                enemy_health_after,
                                outcome
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `)
            .run(
                input.battleId,
                input.roundNumber,
                input.playerRoll,
                input.enemyRoll,
                input.playerDamage,
                input.enemyDamage,
                input.playerHealthAfter,
                input.enemyHealthAfter,
                input.outcome,
            );

        const round = this.db
            .prepare(`
                            SELECT
                                id,
                                battle_id,
                                round_number,
                                player_roll,
                                enemy_roll,
                                player_damage,
                                enemy_damage,
                                player_health_after,
                                enemy_health_after,
                                outcome,
                                created_at
                            FROM battle_rounds
                            WHERE id = ?
                        `)
            .get(Number(result.lastInsertRowid));

        if (!round) {
            throw new Error('Failed to retrieve created battle round.');
        }

        return this.toBattleRoundDomain(round);
    }

    findRounds(battleId: number): BattleRound[] {
        const rows = this.db
            .prepare(`
                            SELECT
                                id,
                                battle_id,
                                round_number,
                                player_roll,
                                enemy_roll,
                                player_damage,
                                enemy_damage,
                                player_health_after,
                                enemy_health_after,
                                outcome,
                                created_at
                            FROM battle_rounds
                            WHERE battle_id = ?
                            ORDER BY round_number ASC
                        `)
            .all(battleId);

        return rows.map((row) => this.toBattleRoundDomain(row));
    }

    updateState(id: number, input: UpdateBattleStateInput): Battle | null {
        this.db
            .prepare(`
                UPDATE battles
                SET
                    player_health = ?,
                    enemy_health = ?,
                    status = ?,
                    completed_at = CASE
                        WHEN ? = 'active' THEN NULL
                        ELSE CURRENT_TIMESTAMP
                    END
                WHERE id = ?
            `)
            .run(
                input.playerHealth,
                input.enemyHealth,
                input.status,
                input.status,
                id
            );

        return this.findById(id);
    }

    private toBattleDomain(row: unknown): Battle {
        const battle = row as {
            id: number;
            run_id: number;
            hero_id: number;
            player_health: number;
            player_max_health: number;
            enemy_name: string;
            enemy_health: number;
            enemy_max_health: number;
            enemy_attack: number;
            enemy_defense: number;
            status: BattleStatus;
            started_at: string;
            completed_at: string | null;
        };

        return {
            id: battle.id,
            runId: battle.run_id,
            heroId: battle.hero_id,
            playerHealth: battle.player_health,
            playerMaxHealth: battle.player_max_health,
            enemyName: battle.enemy_name,
            enemyHealth: battle.enemy_health,
            enemyMaxHealth: battle.enemy_max_health,
            enemyAttack: battle.enemy_attack,
            enemyDefense: battle.enemy_defense,
            status: battle.status,
            startedAt: battle.started_at,
            completedAt: battle.completed_at,
        };
    }

    private toBattleRoundDomain(row: unknown): BattleRound {
        const round = row as {
            id: number;
            battle_id: number;
            round_number: number;
            player_roll: number;
            enemy_roll: number;
            player_damage: number;
            enemy_damage: number;
            player_health_after: number;
            enemy_health_after: number;
            outcome: 'active' | 'win' | 'loss' | 'draw';
            created_at: string;
        };

        return {
            id: round.id,
            battleId: round.battle_id,
            roundNumber: round.round_number,
            playerRoll: round.player_roll,
            enemyRoll: round.enemy_roll,
            playerDamage: round.player_damage,
            enemyDamage: round.enemy_damage,
            playerHealthAfter: round.player_health_after,
            enemyHealthAfter: round.enemy_health_after,
            outcome: round.outcome,
            createdAt: round.created_at,
        };
    }
}