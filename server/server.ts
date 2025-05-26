import express from "express";
import { env } from "./config/env";
import connectDB from "./config/db";
import { configureCors } from "./config/cors";
import { configureSecurity } from "./middleware/security";
import { configureLogging } from "./middleware/logger";
import { configureCookies } from "./middleware/cookies";
import { configureErrorHandlers } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import notificationRoutes from "./routes/notificationRoutes";

// Connect to database
connectDB();

const app = express();

// Trust proxy for proper IP detection behind Vercel's infrastructure
app.set("trust proxy", 1);

// Configure middleware
configureLogging(app);
configureSecurity(app);
configureCors(app);
configureCookies(app);

// Body parser with request size limit
app.use(express.json({ limit: "10kb" }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Configure error handlers (must be last)
configureErrorHandlers(app);

// Only start server when running locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
}

export default app;
