import { Router } from 'express';

import { PasswordRecoveryController } from '../controllers/passwordRecoveryController.js';

export function createPasswordRecoveryRoutes(controller: PasswordRecoveryController): Router {
    const router = Router();

    router.post('/forgot-password', (req, res, next) =>
        controller.forgotPassword(req, res, next),
    );

    router.post('/reset-password', (req, res, next) =>
        controller.resetPassword(req, res, next),
    );

    router.post('/forgot-username', (req, res, next) =>
        controller.forgotUsername(req, res, next),
    );

    return router;
}
