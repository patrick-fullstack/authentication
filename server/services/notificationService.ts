import Notification from "../models/Notification";
import { NotificationType } from "../models/Notification";
import mongoose from "mongoose";

interface CreateNotificationOptions {
  recipientId: string;
  senderId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  message: string;
}

export const createNotification = async ({
  recipientId,
  senderId,
  type,
  postId,
  commentId,
  message,
}: CreateNotificationOptions): Promise<any | null> => {
  try {
    // Don't create notification if sending to self
    if (recipientId === senderId) {
      return null;
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      comment: commentId,
      message,
      read: false,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const getNotificationsForUser = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  notifications: any[];
  unreadCount: number;
  total: number;
}> => {
  try {
    const skip = (page - 1) * limit;

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name")
        .populate("post", "title"),

      Notification.countDocuments({ recipient: userId, read: false }),

      Notification.countDocuments({ recipient: userId }),
    ]);

    return { notifications, unreadCount, total };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationsAsRead = async (
  userId: string,
  notificationIds?: string[]
): Promise<boolean> => {
  try {
    const query = { recipient: userId } as any;

    // If specific IDs are provided, update only those
    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    await Notification.updateMany(query, { read: true });
    return true;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
};

export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<boolean> => {
  try {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId,
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

// Re-export NotificationType to make it available to importers
export { NotificationType } from "../models/Notification";
