import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required").trim().escape(),
  body("email")
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must include at least one number")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must include at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must include at least one uppercase letter")
    .matches(/^(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must include at least one special character (!@#$%^&*)"
    ),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const resetPasswordValidation = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must include at least one number")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must include at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must include at least one uppercase letter")
    .matches(/^(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must include at least one special character (!@#$%^&*)"
    ),
];

export const otpValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
};
