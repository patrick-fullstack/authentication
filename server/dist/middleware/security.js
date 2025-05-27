"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSecurity = exports.forceHttps = exports.authLimiter = exports.globalLimiter = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const env_1 = require("../config/env");
// Configure global rate limiter
exports.globalLimiter = (0, express_rate_limit_1.default)({
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
exports.authLimiter = (0, express_rate_limit_1.default)({
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
const forceHttps = (req, res, next) => {
    if (env_1.env.NODE_ENV === "production" &&
        req.header("x-forwarded-proto") !== "https" &&
        req.hostname !== "localhost") {
        res.redirect(`https://${req.header("host")}${req.url}`);
    }
    else {
        next();
    }
};
exports.forceHttps = forceHttps;
// Apply security middleware
const configureSecurity = (app) => {
    // Helmet middleware for basic security headers
    app.use((0, helmet_1.default)());
    // Apply global rate limiter
    app.use(exports.globalLimiter);
    // Sanitize data against NoSQL injection
    app.use((0, express_mongo_sanitize_1.default)());
    // Force HTTPS in production
    app.use(exports.forceHttps);
};
exports.configureSecurity = configureSecurity;
