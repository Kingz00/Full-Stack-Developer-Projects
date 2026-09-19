import { Router } from 'express';

import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createAuthRoutes(controller: AuthController): Router {
    const router = Router();

    router.post('/register', (req, res, next) =>
        controller.register(req, res, next),
    );

    router.post('/login', (req, res, next) =>
        controller.login(req, res, next),
    );

    router.post('/logout', (req, res, next) =>
        controller.logout(req, res, next),
    );

    router.get('/me', requireAuth, (req, res, next) =>
        controller.me(req, res, next),
    );

    return router;
}