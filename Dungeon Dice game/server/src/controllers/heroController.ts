import type { Request, Response, NextFunction } from 'express';

import { HeroRepository } from '../repositories/heroRepository.js';

export class HeroController {
    constructor(
        private readonly heroRepository: HeroRepository
    ) { }

    getHeroes(_req: Request, res: Response, next: NextFunction): void {
        try {
            const heroes = this.heroRepository.findAll();

            res.status(200).json({
                heroes
            });
        } catch (error) {
            next(error);
        }
    }
}