import type { User } from "./auth";

export interface Post {
  _id: string;
  author: Pick<User, "_id" | "name" | "fullName" | "profile">;
  content: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  likes: string[];           // array of userId strings
  visibility: "public" | "friends";
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: Pick<User, "_id" | "name" | "fullName" | "profile">;
  content: string;
  likeCount: number;
  likes: string[];
  parentComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface CommentResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreatePostPayload {
  content?: string;
  images?: string[];        // base64 strings — backend uploads to Cloudinary
  visibility?: "public" | "friends";
}
