"use strict";
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
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
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
        if (req.header("x-forwarded-proto") !== "https") {
            res.redirect(`https://${req.header("host")}${req.url}`);
        }
        else {
            next();
        }
    });
}
// Enable CORS with enhanced security
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600, // Cache preflight requests for 10 minutes
}));
// Secure cookie settings (for when you use cookies for auth)
app.use((req, res, next) => {
    //secureCookie method instead of overriding the existing one
    res.secureCookie = function (name, value, options = {}) {
        const secureOptions = Object.assign({ httpOnly: true, secure: env_1.env.NODE_ENV === "production", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 }, options);
        return res.cookie(name, value, secureOptions);
    };
    next();
});
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
app.listen(env_1.env.PORT, () => console.log(`Server running on port ${env_1.env.PORT}`));
exports.default = app;
