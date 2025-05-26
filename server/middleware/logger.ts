import morgan from "morgan";
import { env } from "../config/env";

// Configure request logging
export const configureLogging = (app: any) => {
  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    // In production, only log errors
    app.use(
      morgan("combined", {
        skip: (req, res) => res.statusCode < 400,
      })
    );
  }
};
