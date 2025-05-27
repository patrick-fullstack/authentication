import api from "./api";
import {
  PostsResponse,
  PostResponse,
  LikeResponse,
  CommentResponse,
  EditorsResponse,
} from "@/types/post";

const postService = {
  // Get all posts with pagination
  getPosts: async (page = 1, limit = 10): Promise<PostsResponse> => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get a single post by ID
  getPost: async (id: string): Promise<PostResponse> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Get posts by user ID
  getUserPosts: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PostsResponse> => {
    const endpoint =
      userId === "me" ? `/posts/user/me` : `/posts/user/${userId}`;
    const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new post
  createPost: async (title: string, content: string): Promise<PostResponse> => {
    const response = await api.post("/posts", { title, content });
    return response.data;
  },

  // Update an existing post
  updatePost: async (
    id: string,
    title: string,
    content: string
  ): Promise<PostResponse> => {
    const response = await api.put(`/posts/${id}`, { title, content });
    return response.data;
  },

  // Delete a post
  deletePost: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Like or unlike a post
  likePost: async (id: string): Promise<LikeResponse> => {
    const response = await api.put(`/posts/${id}/like`);
    return response.data;
  },

  // Add a comment to a post
  addComment: async (
    postId: string,
    text: string
  ): Promise<CommentResponse> => {
    const response = await api.post(`/posts/${postId}/comments`, { text });
    return response.data;
  },

  // Delete a comment from a post
  deleteComment: async (
    postId: string,
    commentId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Add an editor to a post
  addEditor: async (
    postId: string,
    email: string
  ): Promise<EditorsResponse> => {
    const response = await api.post(`/posts/${postId}/editors`, { email });
    return response.data;
  },

  // Remove an editor from a post
  removeEditor: async (
    postId: string,
    editorId: string
  ): Promise<EditorsResponse> => {
    const response = await api.delete(`/posts/${postId}/editors/${editorId}`);
    return response.data;
  },

  // Get editors for a post
  getEditors: async (postId: string): Promise<EditorsResponse> => {
    const response = await api.get(`/posts/${postId}/editors`);
    return response.data;
  },
};

export default postService;
