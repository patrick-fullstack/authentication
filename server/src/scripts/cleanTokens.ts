import mongoose from "mongoose";
import { env } from "../config/env";
import BlackListedToken from "../models/BlackListedToken";

// Connect to MongoDB
mongoose
  .connect(env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Find and remove all expired tokens
    const result = await BlackListedToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    console.log(`Cleaned up ${result.deletedCount} expired tokens`);

    // Close the connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
