import mongoose from 'mongoose';
import { env } from './env';

// Important: Configure mongoose to not buffer commands
mongoose.set('bufferCommands', false); // Disable operation buffering

// Track the connection status
let isConnected = false;

const connectDB = async (): Promise<void> => {
  try {
    // If already connected, return
    if (isConnected) {
      console.log('Using existing MongoDB connection');
      return;
    }

    // Connection options optimized for serverless environments
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,  // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,                 // Limit connections in serverless
      minPoolSize: 5,
      writeConcern: {
        w: 'majority',
        j: true
      }
    });

    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    // Set the connection status
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`MongoDB connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    isConnected = false;
  }
};

// Export both the connection function and the connection state
export { isConnected };
export default connectDB;