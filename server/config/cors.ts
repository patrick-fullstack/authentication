import cors from "cors";
import { env } from "./env";

// CORS configuration
const corsOptions = {
  origin:
    env.NODE_ENV === "development"
      ? ["http://localhost:3000"]
      : [
          "http://localhost:3000",
          "https://authentication-client-mu.vercel.app",
          "https://authentication-client.vercel.app",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

export const configureCors = (app: any) => {
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
};

export default corsOptions;
