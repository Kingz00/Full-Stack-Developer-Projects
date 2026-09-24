import { Router } from 'express';

import { HeroController } from '../controllers/heroController.js';

export function createHeroRoutes(controller: HeroController): Router {
    const router = Router();

    router.get('/heroes',
        (req, res, next) => controller.getHeroes(req, res, next)
    );

    return router;
}