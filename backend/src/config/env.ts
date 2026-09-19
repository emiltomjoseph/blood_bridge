import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from monorepo root .env or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/bloodbridge?schema=public'),
  DIRECT_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/bloodbridge?schema=public'),
  SUPABASE_URL: z.string().optional().default('https://placeholder.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default('placeholder-key'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Variables Configuration:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment variables. Backend server initialization aborted.');
}

export const env = _env.data;
