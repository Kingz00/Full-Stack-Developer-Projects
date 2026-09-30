import { Router } from 'express';

import { GameRunController } from '../controllers/gameRunController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createGameRunRoutes(controller: GameRunController): Router {
    const router = Router();

    router.get('/current', requireAuth,
        (req, res, next) => controller.getCurrentRun(req, res, next)
    );

    router.post('/', requireAuth,
        (req, res, next) => controller.createRun(req, res, next)
    );

    router.post('/:runId/reset', requireAuth,
        (req, res, next) => controller.abandonRun(req, res, next)
    );

    router.post('/:runId/abandon', requireAuth,
        (req, res, next) => controller.abandonRun(req, res, next)
    );

    router.post('/:runId/complete', requireAuth,
        (req, res, next) => controller.completeRun(req, res, next)
    );

    return router;
}