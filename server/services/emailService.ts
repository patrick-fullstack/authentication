import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { env } from '../config/env';

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Auth App" <${env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  await sendEmail({
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
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<void> => {
  await sendEmail({
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
};

export default sendEmail;