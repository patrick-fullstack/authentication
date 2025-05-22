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
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const BlackListedToken_1 = __importDefault(require("../models/BlackListedToken"));
// Connect to MongoDB
mongoose_1.default
    .connect(env_1.env.MONGO_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connected to MongoDB");
    // Find and remove all expired tokens
    const result = yield BlackListedToken_1.default.deleteMany({
        expiresAt: { $lt: new Date() },
    });
    console.log(`Cleaned up ${result.deletedCount} expired tokens`);
    // Close the connection
    yield mongoose_1.default.disconnect();
    console.log("Disconnected from MongoDB");
}))
    .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
});
