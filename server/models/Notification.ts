import mongoose, { Document } from "mongoose";
import { IUser } from "./User";

export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  EDITOR_ADDED = "editor_added",
  POST_MENTION = "post_mention",
  SYSTEM = "system",
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId | IUser;
  sender: mongoose.Types.ObjectId | IUser;
  type: NotificationType;
  read: boolean;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
