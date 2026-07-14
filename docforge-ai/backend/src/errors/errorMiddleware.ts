import type { Request, Response, NextFunction } from 'express';
import { AppError } from './customErrors.js';
import { logger } from '../config/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] || 'unknown';

  if (err instanceof AppError) {
    logger.warn({
      message: `AppError [${err.errorCode}]: ${err.message}`,
      requestId,
      statusCode: err.statusCode,
      details: err.details,
      url: req.originalUrl,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details ?? null,
      },
    });
    return;
  }

  // Unhandled internal server error
  logger.error({
    message: `Unhandled Error: ${err.message}`,
    requestId,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred on the server.',
      details: null,
    },
  });
}
