import { Router } from 'express';

import { PlayerStatsController } from '../controllers/playerStatsController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createPlayerStatsRoutes(controller: PlayerStatsController): Router {
    const router = Router();

    router.get('/', requireAuth,
        (req, res, next) => controller.getPlayerStatistics(req, res, next)
    );

    return router;
}