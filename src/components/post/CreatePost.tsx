import { useState, useRef, useCallback } from "react";
import { Image, X, Globe, Users, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useCreatePost } from "../../hooks/usePosts";
import type { CreatePostPayload } from "../../types/post";

const MAX_IMAGES = 4;
const MAX_MB = 5;

export default function CreatePost() {
  const { authUser } = useAuthStore();
  const [content, setContent] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "friends">("public");
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: createPost, isPending } = useCreatePost();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - previews.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (file.size > MAX_MB * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onloadend = () =>
          setPreviews((p) => [...p, reader.result as string]);
        reader.readAsDataURL(file);
      });
  }, [previews]);

  const removeImage = (idx: number) =>
    setPreviews((p) => p.filter((_, i) => i !== idx));

  const canSubmit = (content.trim().length > 0 || previews.length > 0) && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload: CreatePostPayload = {
      content: content.trim() || undefined,
      images: previews.length > 0 ? previews : undefined,
      visibility,
    };
    createPost(payload, {
      onSuccess: () => {
        setContent("");
        setPreviews([]);
      },
    });
  };

  const displayName = authUser?.fullName || authUser?.name || "";
  const avatar = authUser?.profile;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      {/* Author row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-medium text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          maxLength={2000}
          className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 leading-relaxed"
        />
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative group w-20 h-20">
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {/* Image upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={previews.length >= MAX_IMAGES}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 disabled:opacity-40 transition-colors"
          >
            <Image className="w-4 h-4" />
            Photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={() => setVisibility((v) => (v === "public" ? "friends" : "public"))}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            {visibility === "public" ? (
              <><Globe className="w-4 h-4" /> Public</>
            ) : (
              <><Users className="w-4 h-4" /> Friends</>
            )}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Post
        </button>
      </div>
    </div>
  );
}
