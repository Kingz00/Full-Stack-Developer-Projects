import type { Request, Response, NextFunction } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors/AppError.js';
import { requireAuth } from './requireAuth.js';

describe('requireAuth', () => {
    it('allows an authenticated request to continue', () => {
        const req = {
            session: {
                userId: 123
            }
        } as Request;

        const next = vi.fn();

        requireAuth(
            req,
            {} as Response,
            next as NextFunction,
        );

        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith();
    });

    it('rejects an unauthenticated request', () => {
        const req = {
            session: {},
        } as Request;

        const next = vi.fn();

        requireAuth(
            req,
            {} as Response,
            next as NextFunction,
        );

        expect(next).toHaveBeenCalledOnce();

        const error = next.mock.calls[0]![0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Authentication required.');
    });
});