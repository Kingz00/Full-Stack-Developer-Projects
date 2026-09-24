/// <reference path="../types/express-session.d.ts" />

import { describe, expect, it, vi } from 'vitest';

import type { Request, Response, NextFunction } from 'express';

import type { User } from '../domain/user/types.js';
import type { AuthService } from '../services/authService.js';
import type { SessionService } from '../services/sessionService.js';
import type { CurrentUserService } from '../services/currentUserService.js';
import type { GameRunService } from '../services/gameRunService.js';

import { AuthController } from './authController.js';

describe('AuthController', () => {
    const user: User = {
        id: 10,
        username: 'testuser',
        passwordHash: 'hashed-password',
        createdAt: '2026-09-20T08:00:00.000Z',
    };

    function createController() {
        const authService = {
            register: vi.fn(),
            login: vi.fn(),
        } as unknown as AuthService;

        const sessionService = {
            create: vi.fn(),
            destroy: vi.fn(),
        } as unknown as SessionService;

        const currentUserService = {
            getUser: vi.fn(),
        } as unknown as CurrentUserService;

        const gameRunService = {
            completeRun: vi.fn(),
        } as unknown as GameRunService;

        const controller = new AuthController(
            authService,
            sessionService,
            currentUserService,
            gameRunService,
        );

        const req = {
            body: {},
            session: {},
        } as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        } as unknown as Response;

        const next = vi.fn() as unknown as NextFunction;

        return {
            controller,
            authService,
            sessionService,
            currentUserService,
            gameRunService,
            req,
            res,
            next
        };
    }

    describe('register', () => {
        it('registers the user and creates an authenticated session', async () => {
            const {
                controller,
                authService,
                sessionService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
                password: 'password123',
            };

            vi.mocked(authService.register)
                .mockResolvedValue(user);

            vi.mocked(sessionService.create)
                .mockResolvedValue();

            await controller.register(req, res, next);

            expect(authService.register)
                .toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'password123',
                });

            expect(sessionService.create)
                .toHaveBeenCalledWith(req, user.id);

            expect(res.status)
                .toHaveBeenCalledWith(201);

            expect(res.json)
                .toHaveBeenCalledWith({
                    user: {
                        id: user.id,
                        username: user.username,
                        createdAt: user.createdAt,
                    },
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        it('passes registration errors to next', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
                password: 'password123',
            };

            const error = new Error('Registration failed.');

            vi.mocked(authService.register)
                .mockRejectedValue(error);

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(error);

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when username is missing', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                password: 'password123',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when password is missing', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when username is not a string', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 123,
                password: 'password123',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when password is not a string', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
                password: 123,
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when username is empty', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: '',
                password: 'password123',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when username contains only whitespace', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: '   ',
                password: 'password123',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when username contains invalid characters', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'test user!',
                password: 'password123',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects registration when username is longer than 20 characters', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'thisusernameiswaytoolong',
                password: 'password123',
            };

            await controller.register(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.register)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('trims the username before registering without modifying the password', async () => {
            const {
                controller,
                authService,
                sessionService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: '  testuser  ',
                password: ' password123 ',
            };

            vi.mocked(authService.register)
                .mockResolvedValue(user);

            vi.mocked(sessionService.create)
                .mockResolvedValue();

            await controller.register(req, res, next);

            expect(authService.register)
                .toHaveBeenCalledWith({
                    username: 'testuser',
                    password: ' password123 ',
                });

            expect(next)
                .not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('logs in the user and creates an authenticated session', async () => {
            const {
                controller,
                authService,
                sessionService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
                password: 'password123',
            };

            vi.mocked(authService.login)
                .mockResolvedValue(user);

            vi.mocked(sessionService.create)
                .mockResolvedValue();

            await controller.login(req, res, next);

            expect(authService.login)
                .toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'password123',
                });

            expect(sessionService.create)
                .toHaveBeenCalledWith(req, user.id);

            expect(res.status)
                .toHaveBeenCalledWith(200);

            expect(res.json)
                .toHaveBeenCalledWith({
                    user: {
                        id: user.id,
                        username: user.username,
                        createdAt: user.createdAt,
                    },
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        it('passes login errors to next', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
                password: 'wrong-password',
            };

            const error = new Error('Invalid username or password.');

            vi.mocked(authService.login)
                .mockRejectedValue(error);

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(error);

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects login when username is missing', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                password: 'password123',
            };

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.login)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects login when password is missing', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
            };

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.login)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects login when username is not a string', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 123,
                password: 'password123',
            };

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.login)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects login when password is not a string', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: 'testuser',
                password: 123,
            };

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.login)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects login when username is empty', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: '',
                password: 'password123',
            };

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.login)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('rejects login when username contains only whitespace', async () => {
            const {
                controller,
                authService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: '   ',
                password: 'password123',
            };

            await controller.login(req, res, next);

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 400,
                    }),
                );

            expect(authService.login)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        it('trims the username before logging in without modifying the password', async () => {
            const {
                controller,
                authService,
                sessionService,
                req,
                res,
                next,
            } = createController();

            req.body = {
                username: '  testuser  ',
                password: ' password123 ',
            };

            vi.mocked(authService.login)
                .mockResolvedValue(user);

            vi.mocked(sessionService.create)
                .mockResolvedValue();

            await controller.login(req, res, next);

            expect(authService.login)
                .toHaveBeenCalledWith({
                    username: 'testuser',
                    password: ' password123 ',
                });

            expect(next)
                .not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('completes the active game run before destroying the session', async () => {
            const {
                controller,
                sessionService,
                gameRunService,
                req,
                res,
                next,
            } = createController();

            req.session.userId = 10;
            req.session.runId = 1;

            vi.mocked(gameRunService.completeRun)
                .mockReturnValue({
                    id: 1,
                    userId: 10,
                    selectedHeroId: 2,
                    status: 'completed',
                    startedAt: '2026-09-20T08:00:00.000Z',
                    completedAt: '2026-09-20T08:30:00.000Z',
                });

            vi.mocked(sessionService.destroy)
                .mockResolvedValue();

            await controller.logout(req, res, next);

            expect(gameRunService.completeRun)
                .toHaveBeenCalledWith(10, 1);

            expect(sessionService.destroy)
                .toHaveBeenCalledWith(req.session);

            const completeRunMock = vi.mocked(gameRunService.completeRun);
            const destroyMock = vi.mocked(sessionService.destroy);

            const completeRunCallOrder = completeRunMock.mock.invocationCallOrder[0]!;

            const destroyCallOrder = destroyMock.mock.invocationCallOrder[0]!;

            expect(completeRunCallOrder).toBeLessThan(destroyCallOrder);

            expect(res.status)
                .toHaveBeenCalledWith(204);

            expect(res.send)
                .toHaveBeenCalled();

            expect(next)
                .not.toHaveBeenCalled();
        });

        it('destroys the session without completing a run when no run is active', async () => {
            const {
                controller,
                sessionService,
                gameRunService,
                req,
                res,
                next,
            } = createController();

            req.session.userId = 10;

            vi.mocked(sessionService.destroy)
                .mockResolvedValue();

            await controller.logout(req, res, next);

            expect(gameRunService.completeRun)
                .not.toHaveBeenCalled();

            expect(sessionService.destroy)
                .toHaveBeenCalledWith(req.session);

            expect(res.status)
                .toHaveBeenCalledWith(204);

            expect(res.send)
                .toHaveBeenCalled();

            expect(next)
                .not.toHaveBeenCalled();
        });

        it('destroys the session without completing a run when no user is authenticated', async () => {
            const {
                controller,
                sessionService,
                gameRunService,
                req,
                res,
                next,
            } = createController();

            vi.mocked(sessionService.destroy)
                .mockResolvedValue();

            await controller.logout(req, res, next);

            expect(gameRunService.completeRun)
                .not.toHaveBeenCalled();

            expect(sessionService.destroy)
                .toHaveBeenCalledWith(req.session);

            expect(res.status)
                .toHaveBeenCalledWith(204);

            expect(res.send)
                .toHaveBeenCalled();

            expect(next)
                .not.toHaveBeenCalled();
        });

        it('passes the error to next and does not destroy the session when completing the run fails', async () => {
            const {
                controller,
                sessionService,
                gameRunService,
                req,
                res,
                next,
            } = createController();

            req.session.userId = 10;
            req.session.runId = 1;

            const error = new Error('Game run is not active.');

            vi.mocked(gameRunService.completeRun)
                .mockImplementation(() => {
                    throw error;
                });

            await controller.logout(req, res, next);

            expect(gameRunService.completeRun)
                .toHaveBeenCalledWith(10, 1);

            expect(sessionService.destroy)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();

            expect(next)
                .toHaveBeenCalledWith(error);
        });

        it('passes the error to next when session destruction fails', async () => {
            const {
                controller,
                sessionService,
                gameRunService,
                req,
                res,
                next,
            } = createController();

            req.session.userId = 10;
            req.session.runId = 1;

            vi.mocked(gameRunService.completeRun)
                .mockReturnValue({
                    id: 1,
                    userId: 10,
                    selectedHeroId: 2,
                    status: 'completed',
                    startedAt: '2026-09-20T08:00:00.000Z',
                    completedAt: '2026-09-20T08:30:00.000Z',
                });

            const error = new Error('Session destruction failed.');

            vi.mocked(sessionService.destroy)
                .mockRejectedValue(error);

            await controller.logout(req, res, next);

            expect(gameRunService.completeRun)
                .toHaveBeenCalledWith(10, 1);

            expect(sessionService.destroy)
                .toHaveBeenCalledWith(req.session);

            expect(res.status)
                .not.toHaveBeenCalled();

            expect(next)
                .toHaveBeenCalledWith(error);
        });
    });

    describe('me', () => {
        it('returns the authenticated user', async () => {
            const {
                controller,
                currentUserService,
                req,
                res,
                next,
            } = createController();

            req.session.userId = 10;

            vi.mocked(currentUserService.getUser)
                .mockReturnValue(user);

            await controller.me(req, res, next);

            expect(currentUserService.getUser)
                .toHaveBeenCalledWith(10);

            expect(res.status)
                .toHaveBeenCalledWith(200);

            expect(res.json)
                .toHaveBeenCalledWith({
                    user: {
                        id: user.id,
                        username: user.username,
                        createdAt: user.createdAt,
                    },
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        it('rejects the request when no user is authenticated', async () => {
            const {
                controller,
                currentUserService,
                res,
                next,
            } = createController();

            const req = {
                body: {},
                session: {},
            } as Request;

            await controller.me(req, res, next);

            expect(currentUserService.getUser)
                .not.toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 401,
                    }),
                );
        });

        it('destroys the session when the authenticated user no longer exists', async () => {
            const {
                controller,
                currentUserService,
                sessionService,
                req,
                res,
                next,
            } = createController();

            req.session.userId = 10;

            vi.mocked(currentUserService.getUser)
                .mockReturnValue(null);

            vi.mocked(sessionService.destroy)
                .mockResolvedValue();

            await controller.me(req, res, next);

            expect(currentUserService.getUser)
                .toHaveBeenCalledWith(10);

            expect(sessionService.destroy)
                .toHaveBeenCalledWith(req.session);

            expect(res.status)
                .not.toHaveBeenCalled();

            expect(res.json)
                .not.toHaveBeenCalled();

            expect(next)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        statusCode: 401,
                    }),
                );
        });
    });
});