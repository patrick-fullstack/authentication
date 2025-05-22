"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables
dotenv_1.default.config();
// Define schema for environment variables
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .default("5000"),
    MONGO_URI: zod_1.z.string(),
    JWT_SECRET: zod_1.z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_EXPIRE: zod_1.z.string().default("30d"),
    EMAIL_HOST: zod_1.z.string(),
    EMAIL_PORT: zod_1.z.string().transform((val) => parseInt(val, 10)),
    EMAIL_USERNAME: zod_1.z.string(),
    EMAIL_APP_PASSWORD: zod_1.z.string(),
    EMAIL_FROM: zod_1.z.string(),
    CLIENT_URL: zod_1.z.string(),
});
// Declare the env variable at the top level
let env;
// Validate environment variables
try {
    exports.env = env = envSchema.parse({
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
}
catch (error) {
    console.error("Environment validation failed:", error);
    process.exit(1);
}
