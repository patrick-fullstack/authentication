"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const mongoose_1 = __importDefault(require("mongoose"));
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Don't exit in serverless environment
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    // Don't exit in serverless environment
});
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Trust proxy for proper IP detection behind Vercel's infrastructure
app.set('trust proxy', 1);
// Request logging
if (env_1.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    // In production, only log errors
    app.use((0, morgan_1.default)("combined", {
        skip: (req, res) => res.statusCode < 400,
    }));
}
// Helmet middleware for basic security headers
app.use((0, helmet_1.default)());
// security headers
app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self';");
    // Strict Transport Security
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
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
const globalLimiter = (0, express_rate_limit_1.default)({
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
const authLimiter = (0, express_rate_limit_1.default)({
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
app.use(express_1.default.json({ limit: "10kb" }));
// Parse cookies
app.use((0, cookie_parser_1.default)());
// Sanitize data against NoSQL injection
app.use((0, express_mongo_sanitize_1.default)());
// Force HTTPS in production
if (env_1.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.header("x-forwarded-proto") !== "https" && req.hostname !== 'localhost') {
            res.redirect(`https://${req.header("host")}${req.url}`);
        }
        else {
            next();
        }
    });
}
// Enable CORS with enhanced security
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://authentication-client-mu.vercel.app',
        'https://authentication-client.vercel.app'
    ],
    credentials: true,
    optionSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
// Secure cookie settings (for when you use cookies for auth)
app.use((req, res, next) => {
    //secureCookie method instead of overriding the existing one
    res.secureCookie = function (name, value, options = {}) {
        const secureOptions = Object.assign({ httpOnly: true, secure: env_1.env.NODE_ENV === "production", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 }, options);
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
            "Access-Control-Allow-Origin": res.getHeader("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": res.getHeader("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": res.getHeader("Access-Control-Allow-Headers"),
            "Access-Control-Allow-Credentials": res.getHeader("Access-Control-Allow-Credentials")
        },
        environment: {
            NODE_ENV: env_1.env.NODE_ENV,
            CLIENT_URL: env_1.env.CLIENT_URL
        },
        request: {
            origin: req.headers.origin,
            referer: req.headers.referer
        }
    });
});
// Debug route to check server status
app.get('/api/system/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check MongoDB connection
        const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
        // Check environment variables (mask sensitive data)
        const envCheck = {
            NODE_ENV: env_1.env.NODE_ENV,
            JWT_SECRET: env_1.env.JWT_SECRET ? 'Set' : 'Not set',
            MONGO_URI: env_1.env.MONGO_URI ? 'Set' : 'Not set',
            EMAIL_CONFIG: env_1.env.EMAIL_HOST && env_1.env.EMAIL_USERNAME ? 'Set' : 'Not set',
        };
        res.json({
            status: 'operational',
            time: new Date().toISOString(),
            environment: env_1.env.NODE_ENV,
            database: dbStatus,
            config: envCheck
        });
    }
    catch (error) {
        // Fix: properly type the error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        res.status(500).json({
            status: 'error',
            message: errorMessage,
            stack: env_1.env.NODE_ENV === 'production' ? null : errorStack
        });
    }
}));
// Mount routes
app.use("/api/auth", authRoutes_1.default);
// Default route
app.get("/", (req, res) => {
    res.send("API is running...");
});
// Error handling for 404 routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found" });
});
// Global error handling with proper types
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).json({
        success: false,
        message: env_1.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
});
// Only start server when running locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(env_1.env.PORT, () => console.log(`Server running on port ${env_1.env.PORT}`));
}
exports.default = app;
