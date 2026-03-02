import { axiosInstance } from "../lib/axios";
import type {
  Post,
  Comment,
  FeedResponse,
  CommentResponse,
  CreatePostPayload,
} from "../types/post";

// ── Feed ─────────────────────────────────────────────────────────────────────
export const getFeed = async (page = 1, limit = 10): Promise<FeedResponse> => {
  const { data } = await axiosInstance.get<FeedResponse>("/posts/feed", {
    params: { page, limit },
  });
  return data;
};

// ── Post CRUD ─────────────────────────────────────────────────────────────────
export const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  const { data } = await axiosInstance.post<Post>("/posts", payload);
  return data;
};

export const getPost = async (id: string): Promise<Post> => {
  const { data } = await axiosInstance.get<Post>(`/posts/${id}`);
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/posts/${id}`);
};

// ── Likes ─────────────────────────────────────────────────────────────────────
export const toggleLike = async (
  id: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const { data } = await axiosInstance.post<{
    liked: boolean;
    likeCount: number;
  }>(`/posts/${id}/like`);
  return data;
};

// ── Comments ─────────────────────────────────────────────────────────────────
export const getComments = async (
  postId: string,
  page = 1
): Promise<CommentResponse> => {
  const { data } = await axiosInstance.get<CommentResponse>(
    `/posts/${postId}/comments`,
    { params: { page } }
  );
  return data;
};

export const addComment = async (
  postId: string,
  content: string,
  parentComment?: string
): Promise<Comment> => {
  const { data } = await axiosInstance.post<Comment>(
    `/posts/${postId}/comments`,
    { content, parentComment }
  );
  return data;
};
