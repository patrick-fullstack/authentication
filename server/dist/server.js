"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./config/db"));
const cors_1 = require("./config/cors");
const security_1 = require("./middleware/security");
const logger_1 = require("./middleware/logger");
const cookies_1 = require("./middleware/cookies");
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Trust proxy for proper IP detection behind Vercel's infrastructure
app.set("trust proxy", 1);
// Configure middleware
(0, logger_1.configureLogging)(app);
(0, security_1.configureSecurity)(app);
(0, cors_1.configureCors)(app);
(0, cookies_1.configureCookies)(app);
// Body parser with request size limit
app.use(express_1.default.json({ limit: "10kb" }));
// Mount routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/posts", postRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
// Default route
app.get("/", (req, res) => {
    res.send("API is running...");
});
// Configure error handlers (must be last)
(0, errorHandler_1.configureErrorHandlers)(app);
// Only start server when running locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
    app.listen(env_1.env.PORT, () => console.log(`Server running on port ${env_1.env.PORT}`));
}
exports.default = app;
