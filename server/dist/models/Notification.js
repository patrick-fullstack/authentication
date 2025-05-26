"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var NotificationType;
(function (NotificationType) {
    NotificationType["LIKE"] = "like";
    NotificationType["COMMENT"] = "comment";
    NotificationType["EDITOR_ADDED"] = "editor_added";
    NotificationType["POST_MENTION"] = "post_mention";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
const notificationSchema = new mongoose_1.default.Schema({
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Post",
    },
    comment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Notification", notificationSchema);
