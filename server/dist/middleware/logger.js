"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureLogging = void 0;
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
// Configure request logging
const configureLogging = (app) => {
    if (env_1.env.NODE_ENV === "development") {
        app.use((0, morgan_1.default)("dev"));
    }
    else {
        // In production, only log errors
        app.use((0, morgan_1.default)("combined", {
            skip: (req, res) => res.statusCode < 400,
        }));
    }
};
exports.configureLogging = configureLogging;
