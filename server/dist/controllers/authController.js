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
exports.updatePassword = exports.updateProfile = exports.logout = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.verifyLoginOtp = exports.login = exports.verifyRegistrationOtp = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = require("../services/emailService");
const env_1 = require("../config/env");
const BlackListedToken_1 = __importDefault(require("../models/BlackListedToken"));
// Generate JWT token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Register user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ success: false, message: "User already exists" });
            return;
        }
        // Create user but not verified yet
        const user = yield User_1.default.create({
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
        yield user.save();
        // Send OTP email
        yield (0, emailService_1.sendOtpEmail)(email, otp);
        res.status(200).json({
            success: true,
            message: "Registration initiated. Please verify your email with the OTP sent.",
            userId: user._id,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.register = register;
// Verify OTP after registration
const verifyRegistrationOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, otp } = req.body;
        const user = yield User_1.default.findById(userId);
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
        yield user.save();
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.verifyRegistrationOtp = verifyRegistrationOtp;
// Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield User_1.default.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid credentials" });
            return;
        }
        // Check if password matches
        const isMatch = yield user.comparePassword(password);
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
        yield user.save();
        // Send OTP email
        yield (0, emailService_1.sendOtpEmail)(email, otp);
        res.status(200).json({
            success: true,
            message: "2FA OTP has been sent to your email",
            userId: user._id,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.login = login;
// Verify OTP after login (2FA)
const verifyLoginOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, otp } = req.body;
        const user = yield User_1.default.findById(userId);
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
        yield user.save();
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.verifyLoginOtp = verifyLoginOtp;
// Forgot password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        // Set expire
        const resetExpiry = new Date();
        resetExpiry.setMinutes(resetExpiry.getMinutes() + 10);
        user.resetPasswordExpiry = resetExpiry;
        yield user.save();
        // Create reset URL
        const resetUrl = `${env_1.env.CLIENT_URL}/reset-password/${resetToken}`;
        try {
            yield (0, emailService_1.sendPasswordResetEmail)(user.email, resetUrl);
            res.status(200).json({
                success: true,
                message: "Password reset link sent to email",
            });
        }
        catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            yield user.save();
            res.status(500).json({
                success: false,
                message: "Email could not be sent",
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get hashed token
        const resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(req.params.resetToken)
            .digest("hex");
        // Debug log to troubleshoot token issues
        console.log("Attempting to reset password with token:", resetPasswordToken);
        const user = yield User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpiry: { $gt: new Date() }, // Use new Date() instead of Date.now()
        });
        if (!user) {
            console.log("Invalid or expired token, no user found");
            res
                .status(400)
                .json({ success: false, message: "Invalid or expired token" });
            return;
        }
        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.resetPassword = resetPassword;
// Get current logged in user
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getMe = getMe;
// Logout user
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from request (assuming it's extracted in auth middleware)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            // Add token to blacklist with expiry time (use same expiry as your JWT)
            yield BlackListedToken_1.default.create({
                token,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days or match your JWT expiry
            });
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.logout = logout;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        // Find user by ID
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Update user
        user.name = name;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.updateProfile = updateProfile;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        // Validate inputs
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: "Current and new password are required",
            });
            return;
        }
        // Find user
        const user = yield User_1.default.findById(userId).select("+password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Check if current password is correct
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
            return;
        }
        // Set new password
        user.password = newPassword;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.updatePassword = updatePassword;
