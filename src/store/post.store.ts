/**
 * Post store — handles optimistic like toggles and real-time new posts
 * arriving via Socket.io. React Query owns server-state; this store
 * holds client-side transient state only.
 */
import { create } from "zustand";

import type { Post } from "../types/post";

interface PostStore {
  // Optimistic like state: postId → { liked, likeCount }
  optimisticLikes: Record<string, { liked: boolean; likeCount: number }>;
  setOptimisticLike: (
    postId: string,
    liked: boolean,
    likeCount: number,
  ) => void;
  clearOptimisticLike: (postId: string) => void;

  // Real-time incoming posts (prepended to feed)
  newPosts: Post[];
  addNewPost: (post: Post) => void;
  clearNewPosts: () => void;
}

export const usePostStore = create<PostStore>((set) => ({
  optimisticLikes: {},
  setOptimisticLike: (postId, liked, likeCount) =>
    set((s) => ({
      optimisticLikes: { ...s.optimisticLikes, [postId]: { liked, likeCount } },
    })),
  clearOptimisticLike: (postId) =>
    set((s) => {
      const next = { ...s.optimisticLikes };
      delete next[postId];
      return { optimisticLikes: next };
    }),

  newPosts: [],
  addNewPost: (post) =>
    set((s) => ({ newPosts: [post, ...s.newPosts].slice(0, 10) })),
  clearNewPosts: () => set({ newPosts: [] }),
}));
