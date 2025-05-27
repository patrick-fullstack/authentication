"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureErrorHandlers = exports.globalErrorHandler = exports.notFoundHandler = void 0;
const env_1 = require("../config/env");
// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found" });
};
exports.notFoundHandler = notFoundHandler;
// Global error handler
const globalErrorHandler = (err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: env_1.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
// Configure error handlers
const configureErrorHandlers = (app) => {
    // Error handling for 404 routes - must be after all routes
    app.use(exports.notFoundHandler);
    // Global error handling
    app.use(exports.globalErrorHandler);
};
exports.configureErrorHandlers = configureErrorHandlers;
