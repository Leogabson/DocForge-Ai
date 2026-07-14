import type { Request, Response, NextFunction } from 'express';
import { AppError } from './customErrors.js';
import { logger } from '../config/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] || 'unknown';

  // Handle standard AppError (custom domain exceptions)
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

  // Handle direct Zod validation errors
  if (err && (err.name === 'ZodError' || err.constructor?.name === 'ZodError')) {
    const issues = err.issues?.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })) || [];

    logger.warn({
      message: 'ZodValidationError: Request validation failed',
      requestId,
      statusCode: 400,
      details: issues,
      url: req.originalUrl,
      method: req.method,
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: issues,
      },
    });
    return;
  }

  // Handle standard Express or HTTP library errors (e.g. malformed JSON body)
  const isHttpError = err && (typeof err.statusCode === 'number' || typeof err.status === 'number');
  if (isHttpError) {
    const statusCode = err.statusCode || err.status;
    const errorMessage = err.message || 'HTTP request processing error';

    logger.warn({
      message: `HTTPError [${statusCode}]: ${errorMessage}`,
      requestId,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });

    res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'BAD_REQUEST',
        message: errorMessage,
        details: err.details || null,
      },
    });
    return;
  }

  // Unhandled internal server error (extract message and stack safely)
  const errorMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
  const errorStack = err instanceof Error ? err.stack : undefined;

  logger.error({
    message: `Unhandled Error: ${errorMessage}`,
    requestId,
    stack: errorStack,
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
