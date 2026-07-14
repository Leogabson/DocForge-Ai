import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';
import { ValidationError } from '../errors/customErrors.js';

export function validateRequest(schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const issues = error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(new ValidationError('Request validation failed.', issues));
      } else {
        next(error);
      }
    }
  };
}
