import mongoose from 'mongoose';
import { env } from './env';

// Track the connection status
let isConnected = false;

const connectDB = async (): Promise<void> => {
  try {
    // If already connected, return
    if (isConnected) {
      console.log('MongoDB is already connected');
      return;
    }

    // Connection options for serverless environments
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

  }
};

export default connectDB;