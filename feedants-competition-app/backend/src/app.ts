import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import competitionRoutes from './routes/competition.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/competitions', competitionRoutes);

// Order matters: 404 first, global error handler last.
app.use(notFoundHandler);
app.use(errorHandler);
