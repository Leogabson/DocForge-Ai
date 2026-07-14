import { Router } from 'express';
import { register, login } from './authController.js';

export function createAuthRouter() {
  const router = Router();

  router.post('/auth/register', register);
  router.post('/auth/login', login);

  return router;
}
