import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Trash2, Globe, Users } from "lucide-react";
import { useState } from "react";

import { useToggleLike, useDeletePost } from "../../hooks/usePosts";
import { useAuthStore } from "../../store/auth.store";
import { usePostStore } from "../../store/post.store";
import type { Post } from "../../types/post";

import CommentSection from "./CommentSection";

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const { authUser } = useAuthStore();
  const { optimisticLikes } = usePostStore();
  const [showComments, setShowComments] = useState(false);

  // Resolve optimistic or server state
  const optimistic = optimisticLikes[post._id];
  const liked = optimistic
    ? optimistic.liked
    : post.likes.includes(authUser?._id ?? "");
  const likeCount = optimistic ? optimistic.likeCount : post.likeCount;

  const { mutate: toggleLike, isPending: likePending } = useToggleLike(
    post._id,
    liked,
    likeCount,
  );
  const { mutate: deletePost, isPending: deletePending } = useDeletePost();

  const isOwner = authUser?._id === post.author._id;
  const avatar = post.author.profile;
  const displayName = post.author.fullName || post.author.name;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-medium text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>·</span>
              {post.visibility === "public" ? (
                <Globe className="w-3 h-3" />
              ) : (
                <Users className="w-3 h-3" />
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => deletePost(post._id)}
            disabled={deletePending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            aria-label="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 py-2 text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Images */}
      {post.images.length > 0 && (
        <div
          className={`grid gap-1 px-4 ${
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {post.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-full rounded-lg object-cover max-h-80"
            />
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 dark:border-gray-700 mt-2">
        <button
          onClick={() => toggleLike()}
          disabled={likePending}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            liked
              ? "text-red-500"
              : "text-gray-500 dark:text-gray-400 hover:text-red-400"
          } disabled:opacity-60`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection postId={post._id} />}
    </article>
  );
}
