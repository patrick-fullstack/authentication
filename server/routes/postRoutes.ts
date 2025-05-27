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
  addEditor,
  removeEditor,
  getEditors,
  getUserPosts,
} from "../controllers/postController";
import { protect } from "../middleware/auth";
import {
  postValidation,
  postUpdateValidation,
  commentValidation,
  validate,
  editorValidation,
} from "../middleware/validation";

const router = express.Router();

// Base routes
router.get("/", protect, getPosts);
router.post("/", protect, postValidation, validate, createPost);

// User-specific posts
router.get("/user/me", protect, getUserPosts); // Get authenticated user's posts
router.get("/user/:userId", protect, getUserPosts); // Get specific user's posts

// Generic ID routes
router.get("/:id", protect, getPost);
router.put("/:id", protect, postUpdateValidation, validate, updatePost);
router.delete("/:id", protect, deletePost);

// Like/unlike
router.put("/:id/like", protect, likePost);

// Comments
router.post("/:id/comments", protect, commentValidation, validate, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

// Editor management
router.post("/:id/editors", protect, editorValidation, validate, addEditor);
router.delete("/:id/editors/:editorId", protect, removeEditor);
router.get("/:id/editors", protect, getEditors);

export default router;
