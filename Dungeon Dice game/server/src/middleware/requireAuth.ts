import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (req.session.userId === undefined) {
        next(new AppError(401, 'Authentication required.'));
        return;
    }

    next();
}