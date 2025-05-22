import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyRegistrationOtp,
  login,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  updateProfile,
  updatePassword,
} from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  otpValidation,
  validate,
} from "../middleware/validation";
import { protect } from "../middleware/auth";

const router = express.Router();

// Configure auth rate limiter
const authLimiter = rateLimit({
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
router.post("/register", authLimiter, registerValidation, validate, register);

// Verify registration OTP
router.post(
  "/verify-registration",
  authLimiter,
  otpValidation,
  validate,
  verifyRegistrationOtp
);

// Logout
router.post("/logout", protect, logout);

// Login user - with rate limiting
router.post("/login", authLimiter, loginValidation, validate, login);

// Verify login OTP (2FA)
router.post(
  "/verify-login",
  authLimiter,
  otpValidation,
  validate,
  verifyLoginOtp
);

// Forgot password - with rate limiting
router.post("/forgot-password", authLimiter, forgotPassword);

// Reset password
router.post("/reset-password/:resetToken", validate, resetPassword);

// Update profile
router.put("/profile", protect, updateProfile);

// Update password
router.put("/password", protect, updatePassword);

// Get current user
router.get("/me", protect, getMe);

export default router;
