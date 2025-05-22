import mongoose, { Document } from "mongoose";

export interface IBlacklistedToken extends Document {
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const blacklistedTokenSchema = new mongoose.Schema<IBlacklistedToken>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - MongoDB will automatically remove documents when expiresAt is reached
  },
});

export default mongoose.model<IBlacklistedToken>(
  "BlacklistedToken",
  blacklistedTokenSchema
);
