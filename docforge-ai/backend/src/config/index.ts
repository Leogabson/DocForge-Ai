import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3-flash'),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'gcs']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./storage-uploads'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  server: {
    port: parsedEnv.data.PORT,
    nodeEnv: parsedEnv.data.NODE_ENV,
  },
  db: {
    url: parsedEnv.data.DATABASE_URL,
  },
  auth: {
    jwtSecret: parsedEnv.data.JWT_SECRET,
  },
  ai: {
    apiKey: parsedEnv.data.GEMINI_API_KEY,
    model: parsedEnv.data.GEMINI_MODEL,
  },
  storage: {
    provider: parsedEnv.data.STORAGE_PROVIDER,
    localPath: parsedEnv.data.STORAGE_LOCAL_PATH,
  },
};
