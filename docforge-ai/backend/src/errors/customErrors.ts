export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: any;

  constructor(message: string, statusCode: number, errorCode: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Access token is invalid or expired.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource could not be found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class ExportError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'EXPORT_ERROR', details);
  }
}

export class AIProviderError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, 'AI_PROVIDER_ERROR', details);
  }
}

export class StorageError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'STORAGE_ERROR', details);
  }
}
