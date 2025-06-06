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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const env_1 = require("../config/env");
const BlackListedToken_1 = __importDefault(require("../models/BlackListedToken"));
// Protect routes
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // Get token from header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
    try {
        // Check if token is blacklisted
        const isBlacklisted = yield BlackListedToken_1.default.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Token is no longer valid. Please login again.",
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Find user by ID
        const user = yield User_1.default.findById(decoded.id);
        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        // Add user to request - use type assertion here
        req.user = user;
        // Store the token for potential blacklisting in logout
        req.token = token;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
});
exports.protect = protect;
