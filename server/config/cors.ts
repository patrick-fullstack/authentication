import cors from "cors";
import { env } from "./env";

// Parse allowed origins from environment variables
const getAllowedOrigins = () => [env.CLIENT_URL].filter(Boolean);

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 200,
};


export const configureCors = (app: any) => {
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
};

export default corsOptions;
