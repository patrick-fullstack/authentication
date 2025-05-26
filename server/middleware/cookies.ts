import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { env } from "../config/env";

// Configure secure cookie settings
export const secureCookieMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (res as any).secureCookie = function (
    name: string,
    value: string,
    options: any = {}
  ) {
    const secureOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...options,
    };

    return res.cookie(name, value, secureOptions);
  };

  next();
};

// Configure cookie middleware
export const configureCookies = (app: any) => {
  app.use(cookieParser());
  app.use(secureCookieMiddleware);
};
