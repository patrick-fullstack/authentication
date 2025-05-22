import express from "express";
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

// Register user
router.post("/register", registerValidation, validate, register);

// Verify registration OTP - update route path
router.post(
  "/verify-registration",
  otpValidation,
  validate,
  verifyRegistrationOtp
);

// Logout
router.post("/logout", protect, logout);

// Login user
router.post("/login", loginValidation, validate, login);

// Verify login OTP (2FA) - update route path
router.post("/verify-login", otpValidation, validate, verifyLoginOtp);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post(
  "/reset-password/:resetToken",
  resetPasswordValidation,
  validate,
  resetPassword
);

// Update profile
router.put("/profile", protect, updateProfile);

// Update password
router.put("/password", protect, updatePassword);

// Get current user
router.get("/me", protect, getMe);

export default router;
