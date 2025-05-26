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
exports.NotificationType = exports.deleteNotification = exports.markNotificationsAsRead = exports.getNotificationsForUser = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const createNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ recipientId, senderId, type, postId, commentId, message, }) {
    try {
        // Don't create notification if sending to self
        if (recipientId === senderId) {
            return null;
        }
        const notification = yield Notification_1.default.create({
            recipient: recipientId,
            sender: senderId,
            type,
            post: postId,
            comment: commentId,
            message,
            read: false,
        });
        return notification;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
});
exports.createNotification = createNotification;
const getNotificationsForUser = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit;
        const [notifications, unreadCount, total] = yield Promise.all([
            Notification_1.default.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("sender", "name")
                .populate("post", "title"),
            Notification_1.default.countDocuments({ recipient: userId, read: false }),
            Notification_1.default.countDocuments({ recipient: userId }),
        ]);
        return { notifications, unreadCount, total };
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
});
exports.getNotificationsForUser = getNotificationsForUser;
const markNotificationsAsRead = (userId, notificationIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = { recipient: userId };
        // If specific IDs are provided, update only those
        if (notificationIds && notificationIds.length > 0) {
            query._id = { $in: notificationIds };
        }
        yield Notification_1.default.updateMany(query, { read: true });
        return true;
    }
    catch (error) {
        console.error("Error marking notifications as read:", error);
        return false;
    }
});
exports.markNotificationsAsRead = markNotificationsAsRead;
const deleteNotification = (notificationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Notification_1.default.deleteOne({
            _id: notificationId,
            recipient: userId,
        });
        return result.deletedCount > 0;
    }
    catch (error) {
        console.error("Error deleting notification:", error);
        return false;
    }
});
exports.deleteNotification = deleteNotification;
// Re-export NotificationType to make it available to importers
var Notification_2 = require("../models/Notification");
Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function () { return Notification_2.NotificationType; } });
