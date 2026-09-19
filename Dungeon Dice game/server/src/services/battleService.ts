import { BattleEngine } from '../domain/battle/battleEngine.js';
import type { Battle, BattleRoundResult, BattleState } from '../domain/battle/types.js';
import type { RandomNumberGenerator } from '../domain/battle/dice.js';
import { AppError } from '../errors/AppError.js';
import { BattleRepository } from '../repositories/battleRepository.js';
import { GameRunRepository } from '../repositories/gameRunRepository.js';
import { HeroRepository } from '../repositories/heroRepository.js';

export interface StartBattleInput {
    runId: number;
}

export class BattleService {
    constructor(
        private readonly gameRunRepository: GameRunRepository,
        private readonly heroRepository: HeroRepository,
        private readonly battleRepository: BattleRepository,
        private readonly battleEngine: BattleEngine,
        private readonly random: RandomNumberGenerator = Math.random,
    ) { }

    startBattle(userId: number, input: StartBattleInput): Battle {
        const gameRun = this.gameRunRepository.findByIdForUser(
            input.runId,
            userId,
        );

        if (!gameRun) {
            throw new AppError(404, 'Game run not found.');
        }

        if (gameRun.status !== 'active') {
            throw new AppError(409, 'Game run is not active.');
        }

        const selectedHero = this.heroRepository.findById(
            gameRun.selectedHeroId
        );

        if (!selectedHero) {
            throw new AppError(404, 'Selected hero not found.');
        }

        const availableEnemies = this.heroRepository
            .findAll()
            .filter((hero) => hero.id !== selectedHero.id);

        if (availableEnemies.length === 0) {
            throw new AppError(409, 'No available enemy heroes.');
        }

        const enemy = availableEnemies[
            Math.floor(this.random() * availableEnemies.length)
        ];

        if (!enemy) {
            throw new AppError(409, 'No enemy returned.');
        }

        return this.battleRepository.createBattle({
            runId: gameRun.id,
            heroId: selectedHero.id,

            playerHealth: selectedHero.health,
            playerMaxHealth: selectedHero.health,

            enemyName: enemy.name,
            enemyHealth: enemy.health,
            enemyMaxHealth: enemy.health,
            enemyAttack: enemy.attack,
            enemyDefense: enemy.defense,
        });
    }

    playRound(userId: number, battleId: number): BattleRoundResult {
        const battle = this.battleRepository.findByIdForUser(
            battleId,
            userId,
        );

        if (!battle) {
            throw new AppError(404, 'Battle not found.');
        }

        if (battle.status !== 'active') {
            throw new AppError(409, 'Battle is already complete.');
        }

        const hero = this.heroRepository.findById(battle.heroId);

        if (!hero) {
            throw new AppError(404, 'Battle hero not found.');
        }

        const state: BattleState = {
            player: {
                health: battle.playerHealth,
                maxHealth: battle.playerMaxHealth,
                attack: hero.attack,
                defense: hero.defense,
            },

            enemy: {
                health: battle.enemyHealth,
                maxHealth: battle.enemyMaxHealth,
                attack: battle.enemyAttack,
                defense: battle.enemyDefense,
            },

            status: battle.status,
        };

        const result = this.battleEngine.playRound(state);

        const rounds = this.battleRepository.findRounds(battle.id);
        const roundNumber = rounds.length + 1;

        this.battleRepository.addRound({
            battleId: battle.id,
            roundNumber,
            playerRoll: result.round.playerRoll,
            enemyRoll: result.round.enemyRoll,
            playerDamage: result.round.playerDamage,
            enemyDamage: result.round.enemyDamage,
            playerHealthAfter: result.round.playerHealthAfter,
            enemyHealthAfter: result.round.enemyHealthAfter,
            outcome: this.toRoundOutcome(result.round.status),
        });

        this.battleRepository.updateState(battle.id, {
            playerHealth: result.state.player.health,
            enemyHealth: result.state.enemy.health,
            status: result.state.status,
        });

        return result;
    }

    private toRoundOutcome(
        status: BattleRoundResult['round']['status']
    ): 'active' | 'win' | 'loss' | 'draw' {
        switch (status) {
            case 'active':
                return 'active';

            case 'won':
                return 'win';

            case 'lost':
                return 'loss';

            case 'draw':
                return 'draw';
        }
    }
}