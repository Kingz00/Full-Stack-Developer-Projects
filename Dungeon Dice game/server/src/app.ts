import express from 'express';
import { sessionMiddleware } from './config/session.js';

const app = express();

app.use(express.json());

app.use(sessionMiddleware)

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
    });
});

export default app;