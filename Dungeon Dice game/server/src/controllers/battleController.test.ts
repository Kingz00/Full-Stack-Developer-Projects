/// <reference path="../types/express-session.d.ts" />

import { describe, expect, it, vi } from 'vitest';

import type { Request, Response, NextFunction } from 'express';

import type { Battle } from '../domain/battle/types.js';
import type { BattleService } from '../services/battleService.js';

import { BattleController } from './battleController.js';

describe('BattleController', () => {
    const battle: Battle = {
        id: 1,
        runId: 5,
        heroId: 2,

        playerHealth: 100,
        playerMaxHealth: 100,

        enemyName: 'Goblin',
        enemyImageUrl: '/images/goblin.png',
        enemyHealth: 80,
        enemyMaxHealth: 80,
        enemyAttack: 12,
        enemyDefense: 4,

        status: 'active',
        startedAt: '2026-09-20T10:00:00.000Z',
        completedAt: null,
    };

    function createController() {
        const battleService = {
            startBattle: vi.fn(),
            getBattle: vi.fn(),
            getActiveBattle: vi.fn(),
            playRound: vi.fn(),
        } as unknown as BattleService;

        const controller = new BattleController(battleService);

        const req = {
            params: {},
            session: {},
        } as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as unknown as Response;

        const next = vi.fn() as unknown as NextFunction;

        return {
            controller,
            battleService,
            req,
            res,
            next,
        };
    }

    it('returns a battle by ID', () => {
        const {
            controller,
            battleService,
            req,
            res,
            next,
        } = createController();

        req.session.userId = 10;
        req.params = {
            battleId: '1',
        };

        vi.mocked(battleService.getBattle)
            .mockReturnValue(battle);

        controller.getBattle(req, res, next);

        expect(battleService.getBattle)
            .toHaveBeenCalledWith(10, 1);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                battle,
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('returns the active battle for a run', () => {
        const {
            controller,
            battleService,
            req,
            res,
            next,
        } = createController();

        req.session.userId = 10;
        req.params = {
            runId: '5',
        };

        vi.mocked(battleService.getActiveBattle)
            .mockReturnValue(battle);

        controller.getActiveBattle(req, res, next);

        expect(battleService.getActiveBattle)
            .toHaveBeenCalledWith(10, 5);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                battle,
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('returns null when there is no active battle', () => {
        const {
            controller,
            battleService,
            req,
            res,
            next,
        } = createController();

        req.session.userId = 10;
        req.params = {
            runId: '5',
        };

        vi.mocked(battleService.getActiveBattle)
            .mockReturnValue(null);

        controller.getActiveBattle(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                battle: null,
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('rejects battle lookup when the user is not authenticated', () => {
        const {
            controller,
            battleService,
            req,
            res,
            next,
        } = createController();

        req.params = {
            battleId: '1',
        };

        controller.getBattle(req, res, next);

        expect(battleService.getBattle)
            .not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 401,
            message: 'Authentication required.',
        });
    });

    it('rejects an invalid battle ID', () => {
        const {
            controller,
            battleService,
            req,
            res,
            next,
        } = createController();

        req.session.userId = 10;
        req.params = {
            battleId: 'abc',
        };

        controller.getBattle(req, res, next);

        expect(battleService.getBattle)
            .not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 400,
            message: 'Invalid battleId.',
        });
    });
});