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
// All routes require authentication
// Get all posts
router.get("/", auth_1.protect, postController_1.getPosts);
// Get a single post
router.get("/:id", auth_1.protect, postController_1.getPost);
// Create a post
router.post("/", auth_1.protect, validation_1.postValidation, validation_1.validate, postController_1.createPost);
// Update a post
router.put("/:id", auth_1.protect, validation_1.postUpdateValidation, validation_1.validate, postController_1.updatePost);
// Delete a post
router.delete("/:id", auth_1.protect, postController_1.deletePost);
// Like/unlike a post
router.put("/:id/like", auth_1.protect, postController_1.likePost);
// Comment routes
// Add a comment to a post
router.post("/:id/comments", auth_1.protect, validation_1.commentValidation, validation_1.validate, postController_1.addComment);
// Delete a comment
router.delete("/:postId/comments/:commentId", auth_1.protect, postController_1.deleteComment);
exports.default = router;
