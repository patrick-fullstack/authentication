"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Configure auth rate limiter
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
// Register user - with rate limiting
router.post("/register", authLimiter, validation_1.registerValidation, validation_1.validate, authController_1.register);
// Verify registration OTP
router.post("/verify-registration", authLimiter, validation_1.otpValidation, validation_1.validate, authController_1.verifyRegistrationOtp);
// Logout
router.post("/logout", auth_1.protect, authController_1.logout);
// Login user - with rate limiting
router.post("/login", authLimiter, validation_1.loginValidation, validation_1.validate, authController_1.login);
// Verify login OTP (2FA)
router.post("/verify-login", authLimiter, validation_1.otpValidation, validation_1.validate, authController_1.verifyLoginOtp);
// Forgot password - with rate limiting
router.post("/forgot-password", authLimiter, authController_1.forgotPassword);
// Reset password
router.post("/reset-password/:resetToken", validation_1.validate, authController_1.resetPassword);
// Update profile
router.put("/profile", auth_1.protect, authController_1.updateProfile);
// Update password
router.put("/password", auth_1.protect, authController_1.updatePassword);
// Get current user
router.get("/me", auth_1.protect, authController_1.getMe);
exports.default = router;
