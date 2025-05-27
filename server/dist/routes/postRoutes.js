"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Base routes
router.get("/", auth_1.protect, postController_1.getPosts);
router.post("/", auth_1.protect, validation_1.postValidation, validation_1.validate, postController_1.createPost);
router.get("/:id", auth_1.protect, postController_1.getPost);
router.put("/:id", auth_1.protect, validation_1.postUpdateValidation, validation_1.validate, postController_1.updatePost);
router.delete("/:id", auth_1.protect, postController_1.deletePost);
// User-specific posts - Add these two routes
router.get("/user/me", auth_1.protect, postController_1.getUserPosts); // Get authenticated user's posts
router.get("/user/:userId", auth_1.protect, postController_1.getUserPosts); // Get specific user's posts
// Like/unlike
router.put("/:id/like", auth_1.protect, postController_1.likePost);
// Comments
router.post("/:id/comments", auth_1.protect, validation_1.commentValidation, validation_1.validate, postController_1.addComment);
router.delete("/:id/comments/:commentId", auth_1.protect, postController_1.deleteComment);
// Editor management
router.post("/:id/editors", auth_1.protect, validation_1.editorValidation, validation_1.validate, postController_1.addEditor);
router.delete("/:id/editors/:editorId", auth_1.protect, postController_1.removeEditor);
router.get("/:id/editors", auth_1.protect, postController_1.getEditors);
exports.default = router;
