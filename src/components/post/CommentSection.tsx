import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../../store/auth.store";
import { useComments, useAddComment } from "../../hooks/usePosts";

interface Props {
  postId: string;
}

export default function CommentSection({ postId }: Props) {
  const { authUser } = useAuthStore();
  const [text, setText] = useState("");

  const { data, isLoading } = useComments(postId);
  const { mutate: addComment, isPending } = useAddComment(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isPending) return;
    addComment(text.trim(), { onSuccess: () => setText("") });
  };

  const avatar = authUser?.profile;
  const displayName = authUser?.fullName || authUser?.name || "";

  return (
    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
      {/* Comment list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <ul className="mt-3 space-y-3 max-h-60 overflow-y-auto pr-1">
          {data?.comments.length === 0 && (
            <li className="text-center text-xs text-gray-400 py-3">
              No comments yet. Be the first!
            </li>
          )}
          {data?.comments.map((c) => (
            <li key={c._id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                {c.author.profile ? (
                  <img src={c.author.profile} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-300 font-medium">
                    {(c.author.fullName || c.author.name).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {c.author.fullName || c.author.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-300 font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden pr-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            maxLength={500}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || isPending}
            className="p-1.5 text-blue-500 disabled:text-gray-300 dark:disabled:text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
