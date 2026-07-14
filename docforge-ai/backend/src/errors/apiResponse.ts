import type { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: any;
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  message = 'Operation successful.',
  data,
  meta,
}: ApiResponseOptions<T>): void {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? {},
    meta: meta ?? {},
  });
}
