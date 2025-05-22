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

// Connect to database
connectDB();

const app = express();

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
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Enable CORS with enhanced security
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600, // Cache preflight requests for 10 minutes
  })
);

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

// Mount routes
app.use("/api/auth", authRoutes);

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

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
