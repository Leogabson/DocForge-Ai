import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createHealthRouter } from './app/routes/index.js';
import { createDocumentRouter } from './app/routes/documentRoutes.js';
import { createAuthRouter } from './modules/auth/authRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api', createHealthRouter());
app.use('/api', createAuthRouter());
app.use('/api', createDocumentRouter());

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
