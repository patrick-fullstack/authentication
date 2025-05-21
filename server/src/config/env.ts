import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  MONGO_URI: z.string().min(1, 'MongoDB URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT secret is required'),
  CLIENT_URL: z.string().url('Client URL must be a valid URL'),
  EMAIL_USERNAME: z.string().min(1, 'Email username is required'),
  EMAIL_APP_PASSWORD: z.string().min(1, 'Email app password is required'),
});

// Parse and validate environment variables
const _env = envSchema.safeParse(process.env);

// Handle validation errors
if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

// Export validated environment variables
export const env = _env.data;

// Log environment setup (excluding sensitive data)
console.log(`🌍 Environment: ${env.NODE_ENV}`);
console.log(`🚀 Server will run on port ${env.PORT}`);