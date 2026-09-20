import { describe, expect, it, vi } from 'vitest';

import type { Request, Response, NextFunction } from 'express';

import type { GameRun } from '../domain/gameRun/types.js';
import type { GameRunService } from '../services/gameRunService.js';

import { GameRunController } from './gameRunController.js';

describe('GameRunController', () => {
    const gameRun: GameRun = {
        id: 1,
        userId: 10,
        selectedHeroId: 2,
        status: 'active',
        startedAt: '2026-09-19T10:00:00.000Z',
        completedAt: null
    };

    const abandonedGameRun: GameRun = {
        ...gameRun,
        status: 'abandoned',
        completedAt: '2026-09-20T05:00:00.000Z',
    };

    function createController() {
        const gameRunService = {
            createRun: vi.fn(),
            abandonRun: vi.fn()
        } as unknown as GameRunService;

        const controller = new GameRunController(gameRunService);

        const req = {
            body: {},
            session: {}
        } as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as unknown as Response;

        const next = vi.fn() as unknown as NextFunction;

        return {
            controller,
            gameRunService,
            req,
            res,
            next
        };
    }

    it('creates a game run for the authenticated user', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next,
        } = createController();

        req.session.userId = 10;
        req.body = {
            selectedHeroId: 2
        };

        vi.mocked(gameRunService.createRun)
            .mockReturnValue(gameRun);

        controller.createRun(req, res, next);

        expect(gameRunService.createRun)
            .toHaveBeenCalledWith(10, {
                selectedHeroId: 2
            });

        expect(req.session.runId).toBe(gameRun.id);

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({
                run: gameRun
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('rejects the request when the user is not authenticated', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next
        } = createController();

        req.body = {
            selectedHeroId: 2,
        };

        controller.createRun(req, res, next);

        expect(gameRunService.createRun)
            .not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 401,
            message: 'Authentication required.',
        });
    });

    it('rejects an invalid selected hero ID', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next
        } = createController();

        req.session.userId = 10;
        req.body = {
            selectedHeroId: 0,
        };

        controller.createRun(req, res, next);

        expect(gameRunService.createRun)
            .not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 400,
            message: 'A valid selected hero ID is required.',
        });
    });

    it('abandons an active game run for the authenticated user', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next
        } = createController();

        req.session.userId = 10;
        req.session.runId = 1;
        req.params = {
            runId: '1'
        };

        vi.mocked(gameRunService.abandonRun)
            .mockReturnValue(abandonedGameRun);

        controller.abandonRun(req, res, next);

        expect(gameRunService.abandonRun)
            .toHaveBeenCalledWith(10, 1);

        expect(req.session.runId).toBeUndefined();

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                run: abandonedGameRun
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('rejects reset when the user is not authenticated', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next
        } = createController();

        req.params = {
            runId: '1'
        };

        controller.abandonRun(req, res, next);

        expect(gameRunService.abandonRun)
            .not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 401,
            message: 'Authentication required.',
        });
    });

    it('rejects an invalid game run ID', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next
        } = createController();

        req.session.userId = 10;
        req.params = {
            runId: 'abc'
        };

        controller.abandonRun(req, res, next);

        expect(gameRunService.abandonRun)
            .not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 400,
            message: 'A valid game run ID is required.',
        });
    });

    it('does not clear a different active session run when abandoning another run', () => {
        const {
            controller,
            gameRunService,
            req,
            res,
            next
        } = createController();

        req.session.userId = 10;
        req.session.runId = 2;
        req.params = {
            runId: '1',
        };

        vi.mocked(gameRunService.abandonRun)
            .mockReturnValue(abandonedGameRun);

        controller.abandonRun(req, res, next);

        expect(gameRunService.abandonRun)
            .toHaveBeenCalledWith(10, 1);

        expect(req.session.runId)
            .toBe(2);

        expect(next)
            .not.toHaveBeenCalled();
    });
});