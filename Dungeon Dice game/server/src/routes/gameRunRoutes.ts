import { Router } from 'express';

import { GameRunController } from '../controllers/gameRunController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createGameRunRoutes(controller: GameRunController): Router {
    const router = Router();

    router.post('/', requireAuth,
        (req, res, next) => controller.createRun(req, res, next)
    );

    router.post('/:runId/reset', requireAuth,
        (req, res, next) => controller.abandonRun(req, res, next)
    );

    return router;
}