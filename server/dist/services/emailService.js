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
exports.sendPasswordResetEmail = exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("../config/env");
dotenv_1.default.config();
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: env_1.env.EMAIL_USERNAME,
            pass: env_1.env.EMAIL_APP_PASSWORD,
        },
    });
    const mailOptions = {
        from: `"Auth App" <${env_1.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };
    yield transporter.sendMail(mailOptions);
});
const sendOtpEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield sendEmail({
        email,
        subject: 'Your OTP Code for Authentication',
        message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Authentication Code</h2>
        <p>Your one-time password (OTP) for authentication is:</p>
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    });
});
exports.sendOtpEmail = sendOtpEmail;
const sendPasswordResetEmail = (email, resetUrl) => __awaiter(void 0, void 0, void 0, function* () {
    yield sendEmail({
        email,
        subject: 'Password Reset Instructions',
        message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p>You requested to reset your password. Please click the link below to set a new password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </p>
        <p>This link is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.default = sendEmail;
