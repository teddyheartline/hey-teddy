import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Post } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toggleLike, deletePost } from '../../services/dataService';

interface PostCardProps {
  post: Post;
  onOpenComments: (post: Post) => void;
  onRequireAuth: () => void;
  onPostDeleted?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onRequireAuth,
  onPostDeleted,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean>(post.likedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const canDelete = currentUser && (currentUser.uid === post.authorId || isAdmin);

  const handleLike = async () => {
    if (!currentUser || !userProfile) {
      onRequireAuth();
      return;
    }

    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 500);

    // Optimistic update
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const realState = await toggleLike(post, userProfile);
      setIsLiked(realState);
    } catch {
      // Revert on failure
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `hey Teddy, — Publication de ${post.authorName}`,
          text: post.caption,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    try {
      await deletePost(post.id, post.authorId);
      if (onPostDeleted) onPostDeleted();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatPostDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'À l’instant';
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <article className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden mb-6 sm:mb-8">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {post.isAuthorAdmin ? (
              <div className="w-11 h-11 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-black text-xs shadow-sm">
                <span>hT,</span>
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700">
                <img
                  src={
                    post.authorPhotoURL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={post.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                {post.isAuthorAdmin ? 'Admin' : post.authorName}
              </span>
              {post.isAuthorAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950">
                  Officiel
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-1.5 z-20">
              <button
                onClick={() => {
                  handleShare();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copier le lien</span>
              </button>
              {canDelete && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Content */}
      <div className="relative w-full bg-neutral-950 overflow-hidden select-none">
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrls[0]}
            controls
            playsInline
            className="w-full max-h-[650px] object-contain mx-auto"
          />
        ) : (
          <div className="relative w-full max-h-[650px] flex items-center justify-center bg-black">
            <img
              src={post.mediaUrls[activeMediaIndex] || post.mediaUrls[0]}
              alt={post.caption || 'Photo'}
              className="w-full h-auto max-h-[650px] object-contain"
            />

            {/* Carousel navigation if multiple items */}
            {post.mediaUrls.length > 1 && (
              <>
                {activeMediaIndex > 0 && (
                  <button
                    onClick={() => setActiveMediaIndex((prev) => prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {activeMediaIndex < post.mediaUrls.length - 1 && (
                  <button
                    onClick={() => setActiveMediaIndex((prev) => prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {post.mediaUrls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeMediaIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              animate={isLikeAnimating ? { scale: [1, 1.4, 0.9, 1.2, 1] } : {}}
              transition={{ duration: 0.4 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? 'text-rose-500' : 'text-neutral-700 dark:text-neutral-300 hover:text-rose-500'
              }`}
              title="Aimer"
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-bold">{likesCount}</span>
            </motion.button>

            {/* Comment Button */}
            <button
              onClick={() => onOpenComments(post)}
              className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 transition-colors"
              title="Commenter"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-bold">{post.commentsCount || 0}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="text-neutral-700 dark:text-neutral-300 hover:text-amber-500 transition-colors"
              title="Partager"
            >
              {isCopied ? <Check className="w-6 h-6 text-emerald-500" /> : <Share2 className="w-6 h-6" />}
            </button>
          </div>

          {isCopied && (
            <span className="text-xs font-semibold text-emerald-500">
              Lien copié dans le presse-papier !
            </span>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed mb-2">
            <span className="font-extrabold text-neutral-900 dark:text-white mr-2">
              {post.isAuthorAdmin ? 'Admin' : post.authorName}
            </span>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comments preview / trigger */}
        {post.commentsCount > 0 ? (
          <button
            onClick={() => onOpenComments(post)}
            className="text-xs font-medium text-neutral-400 dark:text-neutral-500 hover:underline"
          >
            Voir les {post.commentsCount} commentaire{post.commentsCount > 1 ? 's' : ''}
          </button>
        ) : (
          <button
            onClick={() => onOpenComments(post)}
            className="text-xs font-medium text-neutral-400 dark:text-neutral-500 hover:underline"
          >
            Ajouter un commentaire...
          </button>
        )}
      </div>
    </article>
  );
};
