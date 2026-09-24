import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import type { Hero } from '../domain/hero/types.js';
import type { HeroRepository } from '../repositories/heroRepository.js';
import { HeroController } from './heroController.js';

describe('HeroController', () => {
    const heroes: Hero[] = [
        {
            id: 1,
            name: 'Knight of Ashfang',
            description: 'A battle-hardened knight.',
            imageUrl: '/heroes/01-knight-of-ashfang.png',
            health: 18,
            attack: 8,
            defense: 7,
        },
        {
            id: 2,
            name: 'Mireclaw Raider',
            description: 'A relentless swamp raider.',
            imageUrl: '/heroes/02-mireclaw-raider.png',
            health: 15,
            attack: 7,
            defense: 5,
        },
    ];

    function createController() {
        const heroRepository = {
            findAll: vi.fn(),
        } as unknown as HeroRepository;

        const controller = new HeroController(heroRepository);

        const req = {} as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as unknown as Response;

        const next =
            vi.fn() as unknown as NextFunction;

        return {
            controller,
            heroRepository,
            req,
            res,
            next,
        };
    }

    it('returns all heroes', () => {
        const {
            controller,
            heroRepository,
            req,
            res,
            next,
        } = createController();

        vi.mocked(heroRepository.findAll)
            .mockReturnValue(heroes);

        controller.getHeroes(req, res, next);

        expect(
            heroRepository.findAll
        ).toHaveBeenCalledOnce();

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                heroes,
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    it('passes repository errors to the error handler', () => {
        const {
            controller,
            heroRepository,
            req,
            res,
            next,
        } = createController();

        const error = new Error('Database failure');

        vi.mocked(heroRepository.findAll)
            .mockImplementation(() => {
                throw error;
            });

        controller.getHeroes(req, res, next);

        expect(next)
            .toHaveBeenCalledWith(error);

        expect(res.status)
            .not.toHaveBeenCalled();

        expect(res.json)
            .not.toHaveBeenCalled();
    });
});