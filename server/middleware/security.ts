import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "../config/env";

// Configure global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Configure stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Force HTTPS in production
export const forceHttps = (req: Request, res: Response, next: NextFunction) => {
  if (
    env.NODE_ENV === "production" &&
    req.header("x-forwarded-proto") !== "https" &&
    req.hostname !== "localhost"
  ) {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
};

// Apply security middleware
export const configureSecurity = (app: any) => {
  // Helmet middleware for basic security headers
  app.use(helmet());

  // Apply global rate limiter
  app.use(globalLimiter);

  // Sanitize data against NoSQL injection
  app.use(mongoSanitize());

  // Force HTTPS in production
  app.use(forceHttps);
};
