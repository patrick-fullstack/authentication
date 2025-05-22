import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Define schema for environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5000"),
  MONGO_URI: z.string(),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRE: z.string().default("30d"),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform((val) => parseInt(val, 10)),
  EMAIL_USERNAME: z.string(),
  EMAIL_APP_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  CLIENT_URL: z.string(),
});

// Declare the env variable at the top level
let env: z.infer<typeof envSchema>;

// Validate environment variables
try {
  env = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    CLIENT_URL: process.env.CLIENT_URL,
  });
} catch (error) {
  console.error("Environment validation failed:", error);
  process.exit(1);
}

// Export the env variable at the top level
export { env };
