import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
} from "../controllers/postController";
import { protect } from "../middleware/auth";
import {
  postValidation,
  postUpdateValidation,
  commentValidation,
  validate,
} from "../middleware/validation";

const router = express.Router();

// All routes require authentication
// Get all posts
router.get("/", protect, getPosts);

// Get a single post
router.get("/:id", protect, getPost);

// Create a post
router.post("/", protect, postValidation, validate, createPost);

// Update a post
router.put("/:id", protect, postUpdateValidation, validate, updatePost);

// Delete a post
router.delete("/:id", protect, deletePost);

// Like/unlike a post
router.put("/:id/like", protect, likePost);

// Comment routes
// Add a comment to a post
router.post("/:id/comments", protect, commentValidation, validate, addComment);

// Delete a comment
router.delete("/:postId/comments/:commentId", protect, deleteComment);

export default router;
