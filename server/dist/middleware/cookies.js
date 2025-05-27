"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCookies = exports.secureCookieMiddleware = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("../config/env");
// Configure secure cookie settings
const secureCookieMiddleware = (req, res, next) => {
    res.secureCookie = function (name, value, options = {}) {
        const secureOptions = Object.assign({ httpOnly: true, secure: env_1.env.NODE_ENV === "production", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 }, options);
        return res.cookie(name, value, secureOptions);
    };
    next();
};
exports.secureCookieMiddleware = secureCookieMiddleware;
// Configure cookie middleware
const configureCookies = (app) => {
    app.use((0, cookie_parser_1.default)());
    app.use(exports.secureCookieMiddleware);
};
exports.configureCookies = configureCookies;
