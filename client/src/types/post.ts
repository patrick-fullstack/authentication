export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface PostResponse {
  success: boolean;
  data: {
    post: Post;
  };
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    likes: number;
    isLiked: boolean;
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: {
    comment: Comment;
  };
}
