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
exports.getEditors = exports.removeEditor = exports.addEditor = exports.deleteComment = exports.addComment = exports.likePost = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const notificationService_1 = require("../services/notificationService");
// Get all posts (with authentication)
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const posts = yield Post_1.default.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "name")
            .populate("editors", "name")
            .lean();
        const total = yield Post_1.default.countDocuments();
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
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getPosts = getPosts;
// Get a single post (with authentication)
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id)
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
    }
    catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getPost = getPost;
// Create a post (authenticated)
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { title, content } = req.body;
        const userId = authReq.user.id;
        const post = yield Post_1.default.create({
            title,
            content,
            author: userId,
        });
        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: { post },
        });
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.createPost = createPost;
// Update a post (authenticated, author only)
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { title, content } = req.body;
        const userId = authReq.user.id;
        const post = yield Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        // Check if user is the author or an editor
        const isAuthor = post.author.toString() === userId;
        const isEditor = post.editors.some((editorId) => editorId.toString() === userId);
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
        yield post.save();
        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: { post },
        });
    }
    catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updatePost = updatePost;
// Delete a post (authenticated, author only)
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const userId = authReq.user.id;
        const post = yield Post_1.default.findById(req.params.id);
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
        yield post.deleteOne();
        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deletePost = deletePost;
// Like/unlike a post (authenticated)
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const userId = authReq.user.id;
        const post = yield Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        // Check if user has already liked the post
        const index = post.likes.findIndex((id) => id.toString() === userId);
        let message;
        if (index === -1) {
            // Like the post
            post.likes.push(new mongoose_1.default.Types.ObjectId(userId));
            message = "Post liked successfully";
            // Create notification for post author if they're not the one liking
            if (post.author.toString() !== userId) {
                yield (0, notificationService_1.createNotification)({
                    recipientId: post.author.toString(),
                    senderId: userId,
                    type: notificationService_1.NotificationType.LIKE,
                    postId: post.id.toString(),
                    message: `Someone liked your post: ${post.title}`,
                });
            }
        }
        else {
            // Unlike the post
            post.likes = post.likes.filter((id) => id.toString() !== userId);
            message = "Post unliked successfully";
        }
        yield post.save();
        res.status(200).json({
            success: true,
            message,
            data: {
                likes: post.likes.length,
                isLiked: index === -1, // Returns true if post was just liked
            },
        });
    }
    catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.likePost = likePost;
// Add a comment to a post (authenticated)
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { text } = req.body;
        const userId = authReq.user.id;
        const post = yield Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        const newComment = {
            _id: new mongoose_1.default.Types.ObjectId(),
            user: new mongoose_1.default.Types.ObjectId(userId),
            text,
            createdAt: new Date(),
        };
        post.comments.push(newComment);
        yield post.save();
        // Create notification for post author if they're not the one commenting
        if (post.author.toString() !== userId) {
            yield (0, notificationService_1.createNotification)({
                recipientId: post.author.toString(),
                senderId: userId,
                type: notificationService_1.NotificationType.COMMENT,
                postId: post.id.toString(),
                commentId: newComment._id.toString(),
                message: `Someone commented on your post: ${post.title}`,
            });
        }
        // Populate user info in the new comment
        const populatedPost = yield Post_1.default.findById(post._id)
            .populate("comments.user", "name")
            .lean();
        const addedComment = populatedPost === null || populatedPost === void 0 ? void 0 : populatedPost.comments[populatedPost.comments.length - 1];
        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: { comment: addedComment },
        });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.addComment = addComment;
// Delete a comment (authenticated, comment author or post author)
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { postId, commentId } = req.params;
        const userId = authReq.user.id;
        const post = yield Post_1.default.findById(postId);
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
        if (comment.user.toString() !== userId &&
            post.author.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to delete this comment",
            });
            return;
        }
        // Remove the comment
        post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
        yield post.save();
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteComment = deleteComment;
const addEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { email } = req.body;
        const postId = req.params.id;
        const userId = authReq.user.id;
        // Find post
        const post = yield Post_1.default.findById(postId);
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
        const userToAdd = yield User_1.default.findOne({ email });
        if (!userToAdd) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // Check if user is already an editor
        if (post.editors.some((editorId) => editorId.toString() === userToAdd._id.toString())) {
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
        yield post.save();
        // Create notification for the added editor
        yield (0, notificationService_1.createNotification)({
            recipientId: userToAdd._id.toString(),
            senderId: userId,
            type: notificationService_1.NotificationType.EDITOR_ADDED,
            postId: post.id.toString(),
            message: `You were added as an editor to: ${post.title}`,
        });
        // Return the updated post with populated editors
        const updatedPost = yield Post_1.default.findById(postId)
            .populate("editors", "name email")
            .lean();
        res.status(200).json({
            success: true,
            message: "Editor added successfully",
            data: {
                editors: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.editors,
            },
        });
    }
    catch (error) {
        console.error("Error adding editor:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.addEditor = addEditor;
// Remove an editor from a post (authenticated, author only)
const removeEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const { editorId } = req.params;
        const postId = req.params.id;
        const userId = authReq.user.id;
        // Find post
        const post = yield Post_1.default.findById(postId);
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
        yield post.save();
        yield (0, notificationService_1.createNotification)({
            recipientId: editorId,
            senderId: userId,
            type: notificationService_1.NotificationType.SYSTEM, // or define a new EDITOR_REMOVED type
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
    }
    catch (error) {
        console.error("Error removing editor:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.removeEditor = removeEditor;
// Get all editors for a post
const getEditors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const post = yield Post_1.default.findById(postId)
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
    }
    catch (error) {
        console.error("Error fetching editors:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getEditors = getEditors;
