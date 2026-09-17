import session from 'express-session';

export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET ?? 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
    },
});