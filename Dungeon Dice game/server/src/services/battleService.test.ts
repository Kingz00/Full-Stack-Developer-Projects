import { describe, expect, it, vi } from 'vitest';
import { BattleService } from './battleService.js';
import type { Battle, BattleRoundResult } from '../domain/battle/types.js';
import type { GameRun } from '../domain/gameRun/types.js';
import type { Hero } from '../domain/hero/types.js';
import type { BattleRepository } from '../repositories/battleRepository.js';
import type { GameRunRepository } from '../repositories/gameRunRepository.js';
import type { HeroRepository } from '../repositories/heroRepository.js';
import type { BattleEngine } from '../domain/battle/battleEngine.js';
import type { RandomNumberGenerator } from '../domain/battle/dice.js';

describe('BattleService', () => {

    interface GameRunExtended extends GameRun {
        startedAt: string;
    }

    const selectedHero: Hero = {
        id: 1,
        name: 'Warrior',
        description: 'A strong warrior.',
        imageUrl: 'warrior.png',
        health: 100,
        attack: 15,
        defense: 8,
    };

    const enemyHero: Hero = {
        id: 2,
        name: 'Mage',
        description: 'A powerful mage.',
        imageUrl: 'mage.png',
        health: 80,
        attack: 12,
        defense: 4,
    };

    const gameRun: GameRunExtended = {
        id: 1,
        userId: 10,
        selectedHeroId: 1,
        status: 'active',
        startedAt: '2026-09-18T10:00:00.000Z',
        completedAt: null,
    };

    const createdBattle: Battle = {
        id: 1,
        runId: 1,
        heroId: 1,
        playerHealth: 100,
        playerMaxHealth: 100,
        enemyName: 'Mage',
        enemyHealth: 80,
        enemyMaxHealth: 80,
        enemyAttack: 12,
        enemyDefense: 4,
        status: 'active',
        startedAt: '2026-09-18T10:01:00.000Z',
        completedAt: null,
    };

    const activeBattle: Battle = {
        ...createdBattle
    };

    const activeRoundResult: BattleRoundResult = {
        state: {
            player: {
                health: 94,
                maxHealth: 100,
                attack: 15,
                defense: 8,
            },
            enemy: {
                health: 72,
                maxHealth: 80,
                attack: 12,
                defense: 4,
            },
            status: 'active',
        },
        round: {
            playerRoll: 5,
            enemyRoll: 3,
            playerDamage: 8,
            enemyDamage: 6,
            playerHealthAfter: 94,
            enemyHealthAfter: 72,
            status: 'active',
        },
    };

    function createService() {
        const gameRunRepository = {
            findByIdForUser: vi.fn()
                .mockReturnValue(gameRun),
            updateStatus: vi.fn()
        } as unknown as GameRunRepository;

        const heroRepository = {
            findById: vi.fn(),
            findAll: vi.fn(),
        } as unknown as HeroRepository;

        const battleRepository = {
            createBattle: vi.fn(),
            findByIdForUser: vi.fn(),
            findActiveByRunId: vi.fn(),
            findRounds: vi.fn(),
            persistRound: vi.fn()
        } as unknown as BattleRepository;

        const battleEngine = {
            playRound: vi.fn(),
        } as unknown as BattleEngine;

        const random: RandomNumberGenerator = () => 0;

        const service = new BattleService(
            gameRunRepository,
            heroRepository,
            battleRepository,
            battleEngine,
            random,
        );

        return {
            service,
            gameRunRepository,
            heroRepository,
            battleRepository,
            battleEngine,
        };
    }

    describe('startBattle', () => {

        it('starts a battle with the selected hero and a different random enemy', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
                battleRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(gameRun);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(heroRepository.findAll)
                .mockReturnValue([selectedHero, enemyHero]);

            vi.mocked(battleRepository.createBattle)
                .mockReturnValue(createdBattle);

            vi.mocked(battleRepository.findActiveByRunId)
                .mockReturnValue(null);

            const battle = service.startBattle(10, {
                runId: 1,
            });

            expect(battleRepository.findActiveByRunId)
                .toHaveBeenCalledWith(1);

            expect(battle).toEqual(createdBattle);

            expect(gameRunRepository.findByIdForUser)
                .toHaveBeenCalledWith(1, 10);

            expect(heroRepository.findById)
                .toHaveBeenCalledWith(1);

            expect(heroRepository.findAll)
                .toHaveBeenCalled();

            expect(battleRepository.createBattle)
                .toHaveBeenCalledWith({
                    runId: 1,
                    heroId: 1,
                    playerHealth: 100,
                    playerMaxHealth: 100,
                    enemyName: 'Mage',
                    enemyHealth: 80,
                    enemyMaxHealth: 80,
                    enemyAttack: 12,
                    enemyDefense: 4,
                });
        });

        it('rejects starting a battle when the game run already has an active battle', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
                heroRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(gameRun);

            vi.mocked(battleRepository.findActiveByRunId)
                .mockReturnValue(activeBattle);

            expect(() =>
                service.startBattle(10, {
                    runId: 1,
                }),
            ).toThrow(
                expect.objectContaining({
                    statusCode: 409,
                    message: 'An active battle already exists for this game run.',
                }),
            );

            expect(battleRepository.findActiveByRunId)
                .toHaveBeenCalledWith(1);

            expect(heroRepository.findById)
                .not.toHaveBeenCalled();

            expect(heroRepository.findAll)
                .not.toHaveBeenCalled();

            expect(battleRepository.createBattle)
                .not.toHaveBeenCalled();
        });

        it('does not select the player hero as the enemy', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
                battleRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(gameRun);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(heroRepository.findAll)
                .mockReturnValue([selectedHero, enemyHero]);

            vi.mocked(battleRepository.createBattle)
                .mockReturnValue(createdBattle);

            service.startBattle(10, {
                runId: 1,
            });

            const createBattleCall =
                vi.mocked(battleRepository.createBattle)
                    .mock.calls[0]?.[0];

            expect(createBattleCall?.enemyName)
                .toBe('Mage');

            expect(createBattleCall?.enemyName)
                .not.toBe('Warrior');
        });

        it('throws when the game run does not exist or does not belong to the user', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(null);

            expect(() =>
                service.startBattle(10, {
                    runId: 999,
                }),
            ).toThrow('Game run not found.');
        });

        it('throws when the game run is not active', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...gameRun,
                    status: 'completed',
                });

            expect(() =>
                service.startBattle(10, {
                    runId: 1,
                }),
            ).toThrow('Game run is not active.');
        });

        it('throws when the selected hero does not exist', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(gameRun);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(null);

            expect(() =>
                service.startBattle(10, {
                    runId: 1,
                }),
            ).toThrow('Selected hero not found.');
        });

        it('throws when there are no available enemies', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(gameRun);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(heroRepository.findAll)
                .mockReturnValue([selectedHero]);

            expect(() =>
                service.startBattle(10, {
                    runId: 1,
                }),
            ).toThrow('No available enemy heroes.');
        });

        it('snapshots the enemy combat stats into the battle', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
                battleRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(gameRun);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(heroRepository.findAll)
                .mockReturnValue([selectedHero, enemyHero]);

            vi.mocked(battleRepository.createBattle)
                .mockReturnValue(createdBattle);

            service.startBattle(10, {
                runId: 1,
            });

            expect(battleRepository.createBattle)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        enemyName: 'Mage',
                        enemyHealth: 80,
                        enemyMaxHealth: 80,
                        enemyAttack: 12,
                        enemyDefense: 4,
                    }),
                );
        });
    });

    describe('playRound', () => {

        it('plays a round and persists the updated battle state', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue(activeRoundResult);

            const result = service.playRound(10, 1);

            expect(result).toEqual(activeRoundResult);

            expect(battleRepository.findByIdForUser)
                .toHaveBeenCalledWith(1, 10);

            expect(gameRunRepository.findByIdForUser)
                .toHaveBeenCalledWith(1, 10);

            expect(heroRepository.findById)
                .toHaveBeenCalledWith(1);

            expect(battleEngine.playRound)
                .toHaveBeenCalledWith({
                    player: {
                        health: 100,
                        maxHealth: 100,
                        attack: 15,
                        defense: 8,
                    },
                    enemy: {
                        health: 80,
                        maxHealth: 80,
                        attack: 12,
                        defense: 4,
                    },
                    status: 'active',
                });

            expect(battleRepository.findRounds)
                .toHaveBeenCalledWith(1);

            expect(battleRepository.persistRound)
                .toHaveBeenCalledWith(
                    {
                        battleId: 1,
                        roundNumber: 1,
                        playerRoll: 5,
                        enemyRoll: 3,
                        playerDamage: 8,
                        enemyDamage: 6,
                        playerHealthAfter: 94,
                        enemyHealthAfter: 72,
                        outcome: 'active',
                    },
                    {
                        playerHealth: 94,
                        enemyHealth: 72,
                        status: 'active',
                    },
                );
        });

        it('records a win when the player wins the round', () => {
            const {
                service,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue({
                    state: {
                        player: {
                            health: 94,
                            maxHealth: 100,
                            attack: 15,
                            defense: 8,
                        },
                        enemy: {
                            health: 0,
                            maxHealth: 80,
                            attack: 12,
                            defense: 4,
                        },
                        status: 'won',
                    },
                    round: {
                        playerRoll: 6,
                        enemyRoll: 2,
                        playerDamage: 12,
                        enemyDamage: 6,
                        playerHealthAfter: 94,
                        enemyHealthAfter: 0,
                        status: 'won',
                    },
                });

            const result = service.playRound(10, 1);

            expect(result.round.status).toBe('won');

            expect(battleRepository.persistRound)
                .toHaveBeenCalledWith(
                    {
                        battleId: 1,
                        roundNumber: 1,
                        playerRoll: 6,
                        enemyRoll: 2,
                        playerDamage: 12,
                        enemyDamage: 6,
                        playerHealthAfter: 94,
                        enemyHealthAfter: 0,
                        outcome: 'win',
                    },
                    {
                        playerHealth: 94,
                        enemyHealth: 0,
                        status: 'won',
                    },
                );
        });

        it('records a loss when the player loses the round', () => {
            const {
                service,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue({
                    state: {
                        player: {
                            health: 0,
                            maxHealth: 100,
                            attack: 15,
                            defense: 8,
                        },
                        enemy: {
                            health: 72,
                            maxHealth: 80,
                            attack: 12,
                            defense: 4,
                        },
                        status: 'lost',
                    },
                    round: {
                        playerRoll: 2,
                        enemyRoll: 6,
                        playerDamage: 8,
                        enemyDamage: 100,
                        playerHealthAfter: 0,
                        enemyHealthAfter: 72,
                        status: 'lost',
                    },
                });

            const result = service.playRound(10, 1);

            expect(result.round.status).toBe('lost');

            expect(battleRepository.persistRound)
                .toHaveBeenCalledWith(
                    {
                        battleId: 1,
                        roundNumber: 1,
                        playerRoll: 2,
                        enemyRoll: 6,
                        playerDamage: 8,
                        enemyDamage: 100,
                        playerHealthAfter: 0,
                        enemyHealthAfter: 72,
                        outcome: 'loss',
                    },
                    {
                        playerHealth: 0,
                        enemyHealth: 72,
                        status: 'lost',
                    },
                );
        });

        it('records a draw when both combatants reach zero health', () => {
            const {
                service,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue({
                    state: {
                        player: {
                            health: 0,
                            maxHealth: 100,
                            attack: 15,
                            defense: 8,
                        },
                        enemy: {
                            health: 0,
                            maxHealth: 80,
                            attack: 12,
                            defense: 4,
                        },
                        status: 'draw',
                    },
                    round: {
                        playerRoll: 4,
                        enemyRoll: 4,
                        playerDamage: 80,
                        enemyDamage: 100,
                        playerHealthAfter: 0,
                        enemyHealthAfter: 0,
                        status: 'draw',
                    },
                });

            const result = service.playRound(10, 1);

            expect(result.round.status).toBe('draw');

            expect(battleRepository.persistRound)
                .toHaveBeenCalledWith(
                    {
                        battleId: 1,
                        roundNumber: 1,
                        playerRoll: 4,
                        enemyRoll: 4,
                        playerDamage: 80,
                        enemyDamage: 100,
                        playerHealthAfter: 0,
                        enemyHealthAfter: 0,
                        outcome: 'draw',
                    },
                    {
                        playerHealth: 0,
                        enemyHealth: 0,
                        status: 'draw',
                    },
                );
        });

        it('increments the round number for subsequent rounds', () => {
            const {
                service,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([
                    {
                        id: 1,
                        battleId: 1,
                        roundNumber: 1,
                        playerRoll: 5,
                        enemyRoll: 3,
                        playerDamage: 8,
                        enemyDamage: 6,
                        playerHealthAfter: 94,
                        enemyHealthAfter: 72,
                        outcome: 'active',
                        createdAt: '2026-09-18T10:02:00.000Z',
                    },
                ]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue(activeRoundResult);

            service.playRound(10, 1);

            expect(battleRepository.persistRound)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        battleId: 1,
                        roundNumber: 2,
                    }),
                    expect.any(Object),
                );
        });

        it('throws when the battle does not exist or does not belong to the user', () => {
            const {
                service,
                battleRepository,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(null);

            expect(() =>
                service.playRound(10, 999),
            ).toThrow('Battle not found.');
        });

        it('throws when the battle is already complete', () => {
            const {
                service,
                battleRepository,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue({
                    ...activeBattle,
                    status: 'won',
                });

            expect(() =>
                service.playRound(10, 1),
            ).toThrow('Battle is already complete.');
        });

        it('throws when the battle hero no longer exists', () => {
            const {
                service,
                battleRepository,
                heroRepository,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(null);

            expect(() =>
                service.playRound(10, 1),
            ).toThrow('Battle hero not found.');
        });

        it('does not complete the game run when a battle ends', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue({
                    state: {
                        player: {
                            health: 100,
                            maxHealth: 100,
                            attack: 15,
                            defense: 8,
                        },
                        enemy: {
                            health: 0,
                            maxHealth: 80,
                            attack: 12,
                            defense: 4,
                        },
                        status: 'won',
                    },
                    round: {
                        playerRoll: 5,
                        enemyRoll: 2,
                        playerDamage: 20,
                        enemyDamage: 80,
                        playerHealthAfter: 100,
                        enemyHealthAfter: 0,
                        status: 'won',
                    },
                });

            const result = service.playRound(10, activeBattle.id);

            expect(result.round.status).toBe('won');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('does not complete the game run when the battle remains active', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(battleRepository.findRounds)
                .mockReturnValue([]);

            vi.mocked(battleEngine.playRound)
                .mockReturnValue({
                    state: {
                        player: {
                            health: 90,
                            maxHealth: 100,
                            attack: 15,
                            defense: 8,
                        },
                        enemy: {
                            health: 70,
                            maxHealth: 80,
                            attack: 12,
                            defense: 4,
                        },
                        status: 'active',
                    },
                    round: {
                        playerRoll: 5,
                        enemyRoll: 4,
                        playerDamage: 10,
                        enemyDamage: 10,
                        playerHealthAfter: 90,
                        enemyHealthAfter: 70,
                        status: 'active',
                    },
                });

            service.playRound(10, activeBattle.id);

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the parent game run does not exist or does not belong to the user', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(null);

            expect(() =>
                service.playRound(10, activeBattle.id),
            ).toThrow('Game run not found.');

            expect(battleEngine.playRound)
                .not.toHaveBeenCalled();

            expect(battleRepository.persistRound)
                .not.toHaveBeenCalled();
        });

        it('throws when the parent game run is abandoned', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
                battleEngine,
            } = createService();

            vi.mocked(battleRepository.findByIdForUser)
                .mockReturnValue(activeBattle);

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...gameRun,
                    status: 'abandoned',
                    completedAt: '2026-09-20T06:00:00.000Z',
                });

            expect(() =>
                service.playRound(10, activeBattle.id),
            ).toThrow('Game run is not active.');

            expect(gameRunRepository.findByIdForUser)
                .toHaveBeenCalledWith(
                    activeBattle.runId,
                    10,
                );

            expect(battleEngine.playRound)
                .not.toHaveBeenCalled();

            expect(battleRepository.persistRound)
                .not.toHaveBeenCalled();
        });


    });
});