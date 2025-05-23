import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { env } from "../config/env";
import BlackListedToken from "../models/BlackListedToken";
import { IUser } from "../models/User";

// Extend the Express Request interface
export interface AuthRequest extends Request {
  user: IUser & { id: string };
  token?: string;
}

interface JwtPayload {
  id: string;
}

// Protect routes
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
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
    const isBlacklisted = await BlackListedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token is no longer valid. Please login again.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Find user by ID
    const user = await User.findById(decoded.id);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user to request - use type assertion here
    (req as AuthRequest).user = user as IUser & { id: string };

    // Store the token for potential blacklisting in logout
    (req as AuthRequest).token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};
