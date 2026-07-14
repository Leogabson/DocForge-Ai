import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/index.js';
import { requestTracker } from './middleware/requestTracker.js';
import { securityHeaders, apiRateLimiter, sanitizeInput } from './middleware/securityMiddleware.js';
import { errorHandler } from './errors/errorMiddleware.js';
import { createHealthRouter } from './app/routes/index.js';
import { createDocumentRouter } from './app/routes/documentRoutes.js';
import { createAuthRouter } from './modules/auth/authRouter.js';
import { exportRouter } from './modules/exports/exportRouter.js';

dotenv.config();

const app = express();
const port = config.server.port;

// 1. Inbound Request tracking & observability
app.use(requestTracker);

// 2. Global Security Middlewares
app.use(securityHeaders);
app.use('/api', apiRateLimiter);
app.use(cors());
app.use(express.json());
app.use(sanitizeInput);

// 3. Mount Routers
app.use('/api', createHealthRouter());
app.use('/api', createAuthRouter());
app.use('/api', createDocumentRouter());
app.use('/api', exportRouter);

// 4. Centralized Global Error Handling Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
