import React, { useEffect, useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, Comment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToComments, addComment } from '../../services/dataService';

interface CommentsModalProps {
  post: Post | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  onClose,
  onRequireAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;
    const unsubscribe = subscribeToComments(post.id, setComments);
    return () => unsubscribe();
  }, [post]);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
      onRequireAuth();
      return;
    }
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(post, userProfile, text.trim());
      setText('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-lg h-[80vh] sm:h-[600px] flex flex-col bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                Commentaires ({comments.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Original post caption reminder */}
            {post.caption && (
              <div className="flex gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                  {post.isAuthorAdmin ? (
                    <div className="w-full h-full bg-neutral-950 flex items-center justify-center text-amber-400 font-extrabold text-[10px]">
                      hT,
                    </div>
                  ) : (
                    <img
                      src={post.authorPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <span className="font-bold text-neutral-900 dark:text-white mr-1.5">
                    {post.authorName}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {post.caption}
                  </span>
                </div>
              </div>
            )}

            {comments.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 dark:text-neutral-500">
                <p className="text-sm">Aucun commentaire pour le moment.</p>
                <p className="text-xs mt-1">Soyez le premier à donner votre avis !</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                    <img
                      src={c.authorPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={c.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {formatCommentDate(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {currentUser ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Écrire un commentaire bienveillant..."
                  className="flex-1 text-sm px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-400 dark:text-white"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!text.trim() || isSubmitting}
                  className="p-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold hover:bg-amber-300 disabled:opacity-40 transition"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            ) : (
              <div className="text-center py-2">
                <button
                  onClick={onRequireAuth}
                  className="text-xs font-semibold text-amber-500 hover:underline"
                >
                  Connectez-vous pour rejoindre la discussion
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
