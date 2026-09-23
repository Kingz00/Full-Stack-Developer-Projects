import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import type { PlayerStatistics } from '../domain/playerStats/types.js';
import type { PlayerStatsService } from '../services/playerStatsService.js';
import { PlayerStatsController } from './playerStatsController.js';

type MockRequest = Request & {
    session: {
        userId?: number;
    };
};

describe('PlayerStatsController', () => {
    const statistics: PlayerStatistics = {
        totalBattles: 10,
        wins: 5,
        losses: 3,
        draws: 2,
        bestRun: {
            runId: 7,
            totalBattles: 5,
            wins: 3,
            losses: 1,
            draws: 1,
        },
    };

    function createController() {
        const playerStatsService = {
            getPlayerStatistics: vi.fn(),
        } as unknown as PlayerStatsService;

        const controller = new PlayerStatsController(playerStatsService);

        const req = {
            session: {
                userId: undefined,
            },
        } as MockRequest;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as unknown as Response;

        const next =
            vi.fn() as unknown as NextFunction;

        return {
            controller,
            playerStatsService,
            req,
            res,
            next,
        };
    }

    it('returns statistics for the authenticated user', () => {
        const {
            controller,
            playerStatsService,
            req,
            res,
            next,
        } = createController();

        req.session.userId = 42;

        vi.mocked(
            playerStatsService.getPlayerStatistics
        ).mockReturnValue(statistics);

        controller.getPlayerStatistics(req, res, next);

        expect(
            playerStatsService.getPlayerStatistics
        ).toHaveBeenCalledWith(42);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                statistics
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('rejects an unauthenticated request', () => {
        const {
            controller,
            playerStatsService,
            req,
            res,
            next,
        } = createController();

        controller.getPlayerStatistics(req, res, next);

        expect(
            playerStatsService.getPlayerStatistics
        ).not.toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalledOnce();

        const error = vi.mocked(next).mock.calls[0]?.[0];

        expect(error).toMatchObject({
            statusCode: 401,
            message: 'Authentication required.',
        });
    });
});