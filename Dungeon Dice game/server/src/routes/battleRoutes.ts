import { Router } from 'express';

import { BattleController } from '../controllers/battleController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createBattleRoutes(controller: BattleController): Router {
    const router = Router();

    router.get('/runs/:runId/battles/active', requireAuth,
        (req, res, next) => controller.getActiveBattle(req, res, next)
    );

    router.get('/battles/:battleId', requireAuth,
        (req, res, next) => controller.getBattle(req, res, next)
    );

    router.post('/runs/:runId/battles', requireAuth,
        (req, res, next) => controller.startBattle(req, res, next)
    );

    router.post('/battles/:battleId/rounds', requireAuth,
        (req, res, next) => controller.playRound(req, res, next),
    );

    return router;
}