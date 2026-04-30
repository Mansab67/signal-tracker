import { logger } from '../utils/logger.js';

export function notFound(req, res, _next) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  logger.error(`${req.method} ${req.originalUrl}:`, err.message);
  if (process.env.NODE_ENV !== 'production') logger.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
  });
}
