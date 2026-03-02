import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

import CreatePost from "../../components/post/CreatePost";
import PostCard from "../../components/post/PostCard";
import { useFeed } from "../../hooks/usePosts";
import { useAuthStore } from "../../store/auth.store";
import { usePostStore } from "../../store/post.store";

export default function FeedPage() {
  const { authUser } = useAuthStore();
  const { newPosts, clearNewPosts } = usePostStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    refetch,
  } = useFeed();

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Create post — only shown when logged in */}
        {authUser && <CreatePost />}

        {/* Real-time new posts banner */}
        {newPosts.length > 0 && (
          <button
            onClick={() => {
              clearNewPosts();
              refetch();
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {newPosts.length} new {newPosts.length === 1 ? "post" : "posts"} —
            tap to refresh
          </button>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-12 space-y-3">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Couldn't load posts.
            </p>
            <button
              onClick={() => refetch()}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && allPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              No posts yet. Share something!
            </p>
          </div>
        )}

        {/* Posts */}
        {allPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="py-1" />

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}

        {/* End of feed */}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
            You're all caught up ✓
          </p>
        )}
      </div>
    </div>
  );
}
