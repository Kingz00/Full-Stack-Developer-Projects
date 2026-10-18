import { Router } from 'express';

import { EmailVerificationController } from '../controllers/emailVerificationController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createEmailVerificationRoutes(controller: EmailVerificationController): Router {
    const router = Router();

    router.post('/request', requireAuth, (req, res, next) =>
        controller.requestVerification(req, res, next),
    );

    router.post('/verify', (req, res, next) =>
        controller.verifyEmail(req, res, next),
    );

    return router;
}