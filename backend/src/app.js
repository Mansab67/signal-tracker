import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import signalRoutes from './routes/signal.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { dbStatus } from './config/db.js';
import { getEvaluatorStatus } from './jobs/cron.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: false,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/', (_req, res) => {
    res.json({ name: 'SignalTracker API', version: '1.0.0', docs: '/health' });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      db: dbStatus(),
      uptime_sec: Math.round(process.uptime()),
      evaluator: getEvaluatorStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/signals', signalRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
