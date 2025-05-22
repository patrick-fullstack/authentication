import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/emailService";
import { env } from "../config/env";

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    // Create user but not verified yet
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to user
    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message:
        "Registration initiated. Please verify your email with the OTP sent.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Verify OTP after registration
export const verifyRegistrationOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.otpCode !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: "OTP expired" });
      return;
    }

    // Verify the user
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Generate OTP for 2FA
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to user
    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "2FA OTP has been sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Verify OTP after login (2FA)
export const verifyLoginOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.otpCode !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: "OTP expired" });
      return;
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Forgot password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    const resetExpiry = new Date();
    resetExpiry.setMinutes(resetExpiry.getMinutes() + 10);
    user.resetPasswordExpiry = resetExpiry;

    await user.save();

    // Create reset URL
    const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);

      res.status(200).json({
        success: true,
        message: "Password reset link sent to email",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;

      await user.save();

      res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get current logged in user
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    // You can add any server-side logout logic here
    // For example, invalidating refresh tokens, etc.

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = (req as any).user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update user
    user.name = name;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
      return;
    }

    // Find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
