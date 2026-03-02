import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as postService from "../services/post.service";
import { usePostStore } from "../store/post.store";
import type { CreatePostPayload } from "../types/post";

// ── Feed ─────────────────────────────────────────────────────────────────────
export const useFeed = () =>
  useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getFeed(pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 30_000, // 30 s — matches backend cache TTL
  });

// ── Single post ───────────────────────────────────────────────────────────────
export const usePost = (id: string) =>
  useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });

// ── Create post ───────────────────────────────────────────────────────────────
export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      postService.createPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post published!");
    },
    onError: () => toast.error("Failed to publish post"),
  });
};

// ── Delete post ───────────────────────────────────────────────────────────────
export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post"),
  });
};

// ── Like toggle (optimistic) ──────────────────────────────────────────────────
export const useToggleLike = (postId: string, currentLiked: boolean, currentCount: number) => {
  const qc = useQueryClient();
  const { setOptimisticLike, clearOptimisticLike } = usePostStore();

  return useMutation({
    mutationFn: () => postService.toggleLike(postId),
    onMutate: () => {
      // Optimistic update
      setOptimisticLike(
        postId,
        !currentLiked,
        currentLiked ? currentCount - 1 : currentCount + 1
      );
    },
    onSuccess: ({ liked, likeCount }) => {
      setOptimisticLike(postId, liked, likeCount);
    },
    onError: () => {
      clearOptimisticLike(postId);
      toast.error("Failed to update like");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

// ── Comments ─────────────────────────────────────────────────────────────────
export const useComments = (postId: string) =>
  useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
    enabled: !!postId,
  });

export const useAddComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => postService.addComment(postId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => toast.error("Failed to add comment"),
  });
};
