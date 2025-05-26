import express from "express";
import { protect } from "../middleware/auth";
import * as notificationController from "../controllers/notificationController";
import { validate } from "../middleware/validation";
import { body } from "express-validator";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET user notifications
router.get("/", notificationController.getNotifications);

// Mark notifications as read (all or specific IDs)
router.put(
  "/read",
  [
    body("notificationIds")
      .optional()
      .isArray()
      .withMessage("notificationIds must be an array of notification IDs"),
  ],
  validate,
  notificationController.markAsRead
);

// DELETE a notification
router.delete("/:id", notificationController.deleteNotification);

export default router;
