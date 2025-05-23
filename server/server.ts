import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import mongoose from "mongoose";
import postRoutes from "./routes/postRoutes";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  // Don't exit in serverless environment
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  // Don't exit in serverless environment
});

// Connect to database
connectDB();

const app = express();

// Trust proxy for proper IP detection behind Vercel's infrastructure
app.set("trust proxy", 1);

// Request logging
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // In production, only log errors
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
    })
  );
}

// Helmet middleware for basic security headers
app.use(helmet());

// security headers
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self';"
  );

  // Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // X-Content-Type-Options
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-Frame-Options
  res.setHeader("X-Frame-Options", "DENY");

  // X-XSS-Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
});

// Configure global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Fix: use a valid option instead of trustProxy
  skipSuccessfulRequests: false, // Optional setting
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Configure stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Fix: use a valid option instead of trustProxy
  skipSuccessfulRequests: false, // Optional setting
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Apply global rate limiter to all requests
app.use(globalLimiter);

// Body parser with request size limit
app.use(express.json({ limit: "10kb" }));

// Parse cookies
app.use(cookieParser());

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Force HTTPS in production
if (env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (
      req.header("x-forwarded-proto") !== "https" &&
      req.hostname !== "localhost"
    ) {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Enable CORS with enhanced security
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://authentication-client-mu.vercel.app",
    "https://authentication-client.vercel.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Secure cookie settings (for when you use cookies for auth)
app.use((req: Request, res: Response, next: NextFunction) => {
  //secureCookie method instead of overriding the existing one
  (res as any).secureCookie = function (
    name: string,
    value: string,
    options: any = {}
  ) {
    const secureOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...options,
    };

    return res.cookie(name, value, secureOptions);
  };

  next();
});

// Debug route to check CORS and server status
app.get("/api/debug-cors", (req, res) => {
  res.json({
    message: "CORS is working correctly",
    timestamp: new Date().toISOString(),
    headers: {
      "Access-Control-Allow-Origin": res.getHeader(
        "Access-Control-Allow-Origin"
      ),
      "Access-Control-Allow-Methods": res.getHeader(
        "Access-Control-Allow-Methods"
      ),
      "Access-Control-Allow-Headers": res.getHeader(
        "Access-Control-Allow-Headers"
      ),
      "Access-Control-Allow-Credentials": res.getHeader(
        "Access-Control-Allow-Credentials"
      ),
    },
    environment: {
      NODE_ENV: env.NODE_ENV,
      CLIENT_URL: env.CLIENT_URL,
    },
    request: {
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
  });
});

// Debug route to check server status
app.get("/api/system/status", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Check environment variables (mask sensitive data)
    const envCheck = {
      NODE_ENV: env.NODE_ENV,
      JWT_SECRET: env.JWT_SECRET ? "Set" : "Not set",
      MONGO_URI: env.MONGO_URI ? "Set" : "Not set",
      EMAIL_CONFIG: env.EMAIL_HOST && env.EMAIL_USERNAME ? "Set" : "Not set",
    };

    res.json({
      status: "operational",
      time: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbStatus,
      config: envCheck,
    });
  } catch (error: unknown) {
    // Fix: properly type the error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    res.status(500).json({
      status: "error",
      message: errorMessage,
      stack: env.NODE_ENV === "production" ? null : errorStack,
    });
  }
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling for 404 routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Define a type for Express errors
interface ExpressError extends Error {
  status?: number;
}

// Global error handling with proper types
app.use(
  (err: ExpressError, req: Request, res: Response, next: NextFunction) => {
    console.error("Server error:", err.stack);
    res.status(500).json({
      success: false,
      message:
        env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
  }
);

// Only start server when running locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
}

export default app;
