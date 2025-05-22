"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
// Track the connection status
let isConnected = false;
exports.isConnected = isConnected;
let connectionPromise = null;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    // If already connected, return existing connection
    if (isConnected && mongoose_1.default.connection.readyState === 1) {
        console.log('Using existing MongoDB connection');
        return mongoose_1.default;
    }
    // If connection is in progress, wait for it to complete
    if (connectionPromise) {
        console.log('Connection already in progress, waiting...');
        return connectionPromise;
    }
    try {
        console.log('Creating new MongoDB connection...');
        // Store the connection promise for reuse
        connectionPromise = mongoose_1.default.connect(env_1.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 5
        });
        // Await the connection
        const conn = yield connectionPromise;
        // Set up connection event handlers
        mongoose_1.default.connection.on('connected', () => {
            console.log('MongoDB connection established');
            exports.isConnected = isConnected = true;
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            exports.isConnected = isConnected = false;
            connectionPromise = null;
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            exports.isConnected = isConnected = false;
            connectionPromise = null;
        });
        exports.isConnected = isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        console.error(`MongoDB connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        exports.isConnected = isConnected = false;
        connectionPromise = null;
        throw error; // Re-throw to handle in the caller
    }
});
exports.default = connectDB;
