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
// Important: Configure mongoose to not buffer commands
mongoose_1.default.set('bufferCommands', false); // Disable operation buffering
// Track the connection status
let isConnected = false;
exports.isConnected = isConnected;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If already connected, return
        if (isConnected) {
            console.log('Using existing MongoDB connection');
            return;
        }
        // Connection options optimized for serverless environments
        const conn = yield mongoose_1.default.connect(env_1.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000, // Increased timeout
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10, // Limit connections in serverless
            minPoolSize: 5,
            writeConcern: {
                w: 'majority',
                j: true
            }
        });
        // Set up connection event handlers
        mongoose_1.default.connection.on('connected', () => {
            exports.isConnected = isConnected = true;
            console.log('MongoDB connection established');
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            exports.isConnected = isConnected = false;
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            exports.isConnected = isConnected = false;
        });
        // Set the connection status
        exports.isConnected = isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`MongoDB connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        exports.isConnected = isConnected = false;
    }
});
exports.default = connectDB;
