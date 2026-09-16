import { rollDie, type RandomNumberGenerator } from './dice.js';
import type {
    BattleRoundResult,
    BattleState,
    BattleStatus,
} from './types.js';

export class BattleEngine {
    constructor(
        private readonly random: RandomNumberGenerator = Math.random,
    ) { }

    playRound(state: BattleState): BattleRoundResult {
        if (state.status !== 'active') {
            throw new Error('Battle is already complete.');
        }

        const playerRoll = rollDie(6, this.random);
        const enemyRoll = rollDie(6, this.random);

        const playerDamage = Math.max(
            0,
            playerRoll + state.player.attack - state.enemy.defense,
        );

        const enemyDamage = Math.max(
            0,
            enemyRoll + state.enemy.attack - state.player.defense,
        );

        const playerHealthAfter = Math.max(
            0,
            state.player.health - enemyDamage,
        );

        const enemyHealthAfter = Math.max(
            0,
            state.enemy.health - playerDamage,
        );

        const status = this.determineStatus(
            playerHealthAfter,
            enemyHealthAfter,
        );

        const nextState: BattleState = {
            player: {
                ...state.player,
                health: playerHealthAfter,
            },
            enemy: {
                ...state.enemy,
                health: enemyHealthAfter,
            },
            status,
        };

        return {
            state: nextState,

            round: {
                playerRoll,
                enemyRoll,
                playerDamage,
                enemyDamage,
                playerHealthAfter,
                enemyHealthAfter,
                status,
            },
        };
    }

    private determineStatus(playerHealth: number, enemyHealth: number): BattleStatus {

        if (playerHealth === 0 && enemyHealth === 0) {
            return 'draw';
        }

        if (enemyHealth === 0) {
            return 'won';
        }

        if (playerHealth === 0) {
            return 'lost';
        }

        return 'active';
    }
}