"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCors = void 0;
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./env");
// Parse allowed origins from environment variables
const getAllowedOrigins = () => [env_1.env.CLIENT_URL].filter(Boolean);
// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = getAllowedOrigins();
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count"],
    optionsSuccessStatus: 200,
};
const configureCors = (app) => {
    app.use((0, cors_1.default)(corsOptions));
    app.options("*", (0, cors_1.default)(corsOptions));
};
exports.configureCors = configureCors;
exports.default = corsOptions;
