"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAsRead = exports.getNotifications = void 0;
const notificationService = __importStar(require("../services/notificationService"));
// Get user notifications
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const userId = authReq.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { notifications, unreadCount, total } = yield notificationService.getNotificationsForUser(userId, page, limit);
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
    }
    catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getNotifications = getNotifications;
// Mark notifications as read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const userId = authReq.user.id;
        const { notificationIds } = req.body;
        const success = yield notificationService.markNotificationsAsRead(userId, notificationIds);
        if (success) {
            res.status(200).json({
                success: true,
                message: "Notifications marked as read",
            });
        }
        else {
            throw new Error("Failed to mark notifications as read");
        }
    }
    catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.markAsRead = markAsRead;
// Delete a notification
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const userId = authReq.user.id;
        const { id } = req.params;
        const success = yield notificationService.deleteNotification(id, userId);
        if (success) {
            res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: "Notification not found or not authorized to delete",
            });
        }
    }
    catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteNotification = deleteNotification;
