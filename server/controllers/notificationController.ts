import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import * as notificationService from "../services/notificationService";
import { NotificationType } from "../models/Notification";

// Get user notifications
export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { notifications, unreadCount, total } =
      await notificationService.getNotificationsForUser(userId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Mark notifications as read
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const { notificationIds } = req.body;

    const success = await notificationService.markNotificationsAsRead(
      userId,
      notificationIds
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: "Notifications marked as read",
      });
    } else {
      throw new Error("Failed to mark notifications as read");
    }
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a notification
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const { id } = req.params;

    const success = await notificationService.deleteNotification(id, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found or not authorized to delete",
      });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
