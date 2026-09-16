import { describe, expect, it } from 'vitest';

import { BattleEngine } from './battleEngine.js';
import type { BattleState } from './types.js';

describe('BattleEngine', () => {
    it('plays a round and returns the updated battle state', () => {
        const battle: BattleState = {
            player: {
                health: 100,
                maxHealth: 100,
                attack: 10,
                defense: 5,
            },
            enemy: {
                health: 100,
                maxHealth: 100,
                attack: 8,
                defense: 4,
            },
            status: 'active',
        };

        const randomValues = [0, 0.999999];
        let index = 0;

        const random = () => randomValues[index++] ?? 0;

        const engine = new BattleEngine(random);

        const result = engine.playRound(battle);

        expect(result.round.playerRoll).toBe(1);
        expect(result.round.enemyRoll).toBe(6);

        expect(result.state.player.health).toBe(91);
        expect(result.state.enemy.health).toBe(93);

        expect(result.state.status).toBe('active');
    });

    it('returns a draw when both combatants reach zero health', () => {
        const battle: BattleState = {
            player: {
                health: 5,
                maxHealth: 100,
                attack: 10,
                defense: 0,
            },
            enemy: {
                health: 5,
                maxHealth: 100,
                attack: 10,
                defense: 0,
            },
            status: 'active',
        };

        const random = () => 0.999999;

        const engine = new BattleEngine(random);

        const result = engine.playRound(battle);

        expect(result.state.player.health).toBe(0);
        expect(result.state.enemy.health).toBe(0);
        expect(result.state.status).toBe('draw');
    });
});