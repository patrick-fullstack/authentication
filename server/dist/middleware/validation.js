"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.otpValidation = exports.resetPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required").trim().escape(),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please include a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*\d)/)
        .withMessage("Password must include at least one number")
        .matches(/^(?=.*[a-z])/)
        .withMessage("Password must include at least one lowercase letter")
        .matches(/^(?=.*[A-Z])/)
        .withMessage("Password must include at least one uppercase letter")
        .matches(/^(?=.*[!@#$%^&*])/)
        .withMessage("Password must include at least one special character (!@#$%^&*)"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please include a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*\d)/)
        .withMessage("Password must include at least one number")
        .matches(/^(?=.*[a-z])/)
        .withMessage("Password must include at least one lowercase letter")
        .matches(/^(?=.*[A-Z])/)
        .withMessage("Password must include at least one uppercase letter")
        .matches(/^(?=.*[!@#$%^&*])/)
        .withMessage("Password must include at least one special character (!@#$%^&*)"),
];
exports.otpValidation = [
    (0, express_validator_1.body)("userId").notEmpty().withMessage("User ID is required"),
    (0, express_validator_1.body)("otp")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isNumeric()
        .withMessage("OTP must contain only numbers"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    next();
};
exports.validate = validate;
