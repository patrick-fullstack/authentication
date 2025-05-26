import { Request, Response } from "express";
import Post from "../models/Post";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import {
  createNotification,
  NotificationType,
} from "../services/notificationService";

// Get all posts (with authentication)
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    // Add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name")
      .populate("editors", "name")
      .lean();

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a single post (with authentication)
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name")
      .populate("editors", "name email")
      .populate("comments.user", "name")
      .lean();

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create a post (authenticated)
export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { title, content } = req.body;
    const userId = authReq.user.id;

    const post = await Post.create({
      title,
      content,
      author: userId,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update a post (authenticated, author only)
export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { title, content } = req.body;
    const userId = authReq.user.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Check if user is the author or an editor
    const isAuthor = post.author.toString() === userId;
    const isEditor = post.editors.some(
      (editorId) => editorId.toString() === userId
    );

    if (!isAuthor && !isEditor) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
      return;
    }

    // Update post
    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: { post },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a post (authenticated, author only)
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
      return;
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Like/unlike a post (authenticated)
export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Check if user has already liked the post
    const index = post.likes.findIndex((id) => id.toString() === userId);

    let message;

    if (index === -1) {
      // Like the post
      post.likes.push(new mongoose.Types.ObjectId(userId));
      message = "Post liked successfully";
      // Create notification for post author if they're not the one liking
      if (post.author.toString() !== userId) {
        await createNotification({
          recipientId: post.author.toString(),
          senderId: userId,
          type: NotificationType.LIKE,
          postId: post.id.toString(),
          message: `Someone liked your post: ${post.title}`,
        });
      }
    } else {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      message = "Post unliked successfully";
    }

    await post.save();

    res.status(200).json({
      success: true,
      message,
      data: {
        likes: post.likes.length,
        isLiked: index === -1, // Returns true if post was just liked
      },
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add a comment to a post (authenticated)
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { text } = req.body;
    const userId = authReq.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(userId),
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Create notification for post author if they're not the one commenting
    if (post.author.toString() !== userId) {
      await createNotification({
        recipientId: post.author.toString(),
        senderId: userId,
        type: NotificationType.COMMENT,
        postId: post.id.toString(),
        commentId: newComment._id.toString(),
        message: `Someone commented on your post: ${post.title}`,
      });
    }

    // Populate user info in the new comment
    const populatedPost = await Post.findById(post._id)
      .populate("comments.user", "name")
      .lean();

    const addedComment =
      populatedPost?.comments[populatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: { comment: addedComment },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a comment (authenticated, comment author or post author)
export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { postId, commentId } = req.params;
    const userId = authReq.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    // Check if user is the comment author or post author
    if (
      comment.user.toString() !== userId &&
      post.author.toString() !== userId
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
      return;
    }

    // Remove the comment
    post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const addEditor = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { email } = req.body;
    const postId = req.params.id;
    const userId = authReq.user.id;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "Only the post author can add editors",
      });
      return;
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if user is already an editor
    if (
      post.editors.some(
        (editorId) => editorId.toString() === userToAdd._id.toString()
      )
    ) {
      res.status(400).json({
        success: false,
        message: "This user is already an editor for this post",
      });
      return;
    }

    // Check if user is the author (can't be both author and editor)
    if (post.author.toString() === userToAdd._id.toString()) {
      res.status(400).json({
        success: false,
        message: "The author cannot be added as an editor",
      });
      return;
    }

    // Add user to editors
    post.editors.push(userToAdd._id);
    await post.save();

    // Create notification for the added editor
    await createNotification({
      recipientId: userToAdd._id.toString(),
      senderId: userId,
      type: NotificationType.EDITOR_ADDED,
      postId: post.id.toString(),
      message: `You were added as an editor to: ${post.title}`,
    });

    // Return the updated post with populated editors
    const updatedPost = await Post.findById(postId)
      .populate("editors", "name email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Editor added successfully",
      data: {
        editors: updatedPost?.editors,
      },
    });
  } catch (error) {
    console.error("Error adding editor:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Remove an editor from a post (authenticated, author only)
export const removeEditor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { editorId } = req.params;
    const postId = req.params.id;
    const userId = authReq.user.id;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "Only the post author can remove editors",
      });
      return;
    }

    // Check if editor exists
    if (!post.editors.some((id) => id.toString() === editorId)) {
      res.status(404).json({
        success: false,
        message: "Editor not found for this post",
      });
      return;
    }

    // Remove editor
    post.editors = post.editors.filter((id) => id.toString() !== editorId);
    await post.save();
    await createNotification({
      recipientId: editorId,
      senderId: userId,
      type: NotificationType.SYSTEM, // or define a new EDITOR_REMOVED type
      postId: post.id.toString(),
      message: `You have been removed as an editor from: ${post.title}`,
    });

    res.status(200).json({
      success: true,
      message: "Editor removed successfully",
      data: {
        editors: post.editors,
      },
    });
  } catch (error) {
    console.error("Error removing editor:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all editors for a post
export const getEditors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate("editors", "name email")
      .lean();

    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        editors: post.editors,
      },
    });
  } catch (error) {
    console.error("Error fetching editors:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
