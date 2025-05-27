"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCors = void 0;
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./env");
// Parse allowed origins from environment variables
const getAllowedOrigins = () => {
    // Start with the primary client URL from environment
    const origins = [env_1.env.CLIENT_URL];
    // Filter out any undefined/empty values
    return origins.filter(Boolean);
};
// CORS configuration
const corsOptions = {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
};
const configureCors = (app) => {
    app.use((0, cors_1.default)(corsOptions));
    app.options("*", (0, cors_1.default)(corsOptions));
};
exports.configureCors = configureCors;
exports.default = corsOptions;
