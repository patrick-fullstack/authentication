import { create } from "zustand";
import postService from "@/services/postService";
import { Post, Comment, User } from "@/types/post";
import { AxiosError } from "axios";
import { postToast } from "@/utils/toast";

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };

  // Actions
  fetchPosts: (page?: number, limit?: number) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (title: string, content: string) => Promise<boolean>;
  updatePost: (id: string, title: string, content: string) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  likePost: (id: string) => Promise<boolean>;
  addComment: (postId: string, text: string) => Promise<Comment | null>;
  deleteComment: (postId: string, commentId: string) => Promise<boolean>;
  clearCurrentPost: () => void;

  // Editor management actions
  addEditor: (postId: string, email: string) => Promise<User[] | null>;
  removeEditor: (postId: string, editorId: string) => Promise<boolean>;
  fetchEditors: (postId: string) => Promise<User[] | null>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },

  // Fetch all posts with pagination
  fetchPosts: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.getPosts(page, limit);

      if (response.success) {
        set({
          posts: response.data.posts,
          pagination: response.data.pagination,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch posts";
      set({ error: errorMessage });
      postToast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch a single post by ID
  fetchPost: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.getPost(id);

      if (response.success) {
        set({ currentPost: response.data.post });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch post";
      set({ error: errorMessage });
      postToast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new post
  createPost: async (title: string, content: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.createPost(title, content);

      if (response.success) {
        // Add the new post to the beginning of the posts array
        const newPosts = [response.data.post, ...get().posts];
        set({ posts: newPosts });
        postToast.success("Post created successfully");
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to create post";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update an existing post
  updatePost: async (id: string, title: string, content: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.updatePost(id, title, content);

      if (response.success) {
        // Update the post in both the posts array and currentPost if it's the same post
        const updatedPosts = get().posts.map((post) =>
          post._id === id ? response.data.post : post
        );

        set({
          posts: updatedPosts,
          currentPost:
            get().currentPost?._id === id
              ? response.data.post
              : get().currentPost,
        });

        postToast.success("Post updated successfully");
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update post";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a post
  deletePost: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.deletePost(id);

      if (response.success) {
        // Remove the post from the posts array
        const filteredPosts = get().posts.filter((post) => post._id !== id);
        set({
          posts: filteredPosts,
          currentPost: get().currentPost?._id === id ? null : get().currentPost,
        });

        postToast.success("Post deleted successfully");
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to delete post";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Like or unlike a post
  likePost: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.likePost(id);

      if (response.success) {
        // Update the likes in both the posts array and currentPost if it's the same post
        const { posts, currentPost } = get();

        const updatedPosts = posts.map((post) => {
          if (post._id === id) {
            return {
              ...post,
              likes: response.data.isLiked
                ? [...post.likes, "temp-id"] // We don't know the actual user ID here, server will handle it
                : post.likes.filter((_, i) => i !== post.likes.length - 1),
            };
          }
          return post;
        });

        let updatedCurrentPost = currentPost;
        if (currentPost && currentPost._id === id) {
          updatedCurrentPost = {
            ...currentPost,
            likes: response.data.isLiked
              ? [...currentPost.likes, "temp-id"]
              : currentPost.likes.filter(
                  (_, i) => i !== currentPost.likes.length - 1
                ),
          };
        }

        set({
          posts: updatedPosts,
          currentPost: updatedCurrentPost,
        });

        postToast.success(response.message);
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to like post";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, text: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.addComment(postId, text);

      if (response.success) {
        const { posts, currentPost } = get();
        const newComment = response.data.comment;

        // Update comments in posts array
        const updatedPosts = posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment],
            };
          }
          return post;
        });

        // Update comments in currentPost if it's the same post
        let updatedCurrentPost = currentPost;
        if (currentPost && currentPost._id === postId) {
          updatedCurrentPost = {
            ...currentPost,
            comments: [...currentPost.comments, newComment],
          };
        }

        set({
          posts: updatedPosts,
          currentPost: updatedCurrentPost,
        });

        postToast.success("Comment added successfully");
        return newComment;
      }
      return null;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to add comment";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a comment from a post
  deleteComment: async (postId: string, commentId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.deleteComment(postId, commentId);

      if (response.success) {
        const { posts, currentPost } = get();

        // Update comments in posts array
        const updatedPosts = posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment._id !== commentId
              ),
            };
          }
          return post;
        });

        // Update comments in currentPost if it's the same post
        let updatedCurrentPost = currentPost;
        if (currentPost && currentPost._id === postId) {
          updatedCurrentPost = {
            ...currentPost,
            comments: currentPost.comments.filter(
              (comment) => comment._id !== commentId
            ),
          };
        }

        set({
          posts: updatedPosts,
          currentPost: updatedCurrentPost,
        });

        postToast.success("Comment deleted successfully");
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to delete comment";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Add an editor to a post
  addEditor: async (postId: string, email: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.addEditor(postId, email);

      if (response.success) {
        // Update editors in currentPost
        const currentPost = get().currentPost;
        if (currentPost && currentPost._id === postId) {
          set({
            currentPost: {
              ...currentPost,
              editors: response.data.editors,
            },
          });
        }

        // Update editors in posts array
        const updatedPosts = get().posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              editors: response.data.editors,
            };
          }
          return post;
        });

        set({ posts: updatedPosts });
        postToast.success("Editor added successfully");
        return response.data.editors;
      }
      return null;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to add editor";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove an editor from a post
  removeEditor: async (postId: string, editorId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.removeEditor(postId, editorId);

      if (response.success) {
        // Update editors in currentPost
        const currentPost = get().currentPost;
        if (currentPost && currentPost._id === postId) {
          set({
            currentPost: {
              ...currentPost,
              editors: response.data.editors,
            },
          });
        }

        // Update editors in posts array
        const updatedPosts = get().posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              editors: response.data.editors,
            };
          }
          return post;
        });

        set({ posts: updatedPosts });
        postToast.success("Editor removed successfully");
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to remove editor";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch editors for a post
  fetchEditors: async (postId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await postService.getEditors(postId);

      if (response.success) {
        return response.data.editors;
      }
      return null;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch editors";
      set({ error: errorMessage });
      postToast.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear the current post
  clearCurrentPost: () => {
    set({ currentPost: null });
  },
}));
