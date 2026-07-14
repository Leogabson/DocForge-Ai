import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../config/logger.js';

export function requestTracker(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  // Set Request ID on response header
  res.setHeader('x-request-id', requestId);
  req.headers['x-request-id'] = requestId;

  logger.info({
    message: `Incoming Request: ${req.method} ${req.originalUrl}`,
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    logger.info({
      message: `Completed Request: ${req.method} ${req.originalUrl} - ${res.statusCode}`,
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
}
