import React, { useEffect, useState } from 'react';
import { Post } from '../../types';
import { subscribeToFeedPosts } from '../../services/dataService';
import { Heart, Maximize2, X, Download, MessageCircle, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface PhotosViewProps {
  onRequireAuth: () => void;
}

export const PhotosView: React.FC<PhotosViewProps> = ({ onRequireAuth }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'admin' | 'clients' | 'videos'>('all');
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    post: Post;
    type: 'photo' | 'video';
  } | null>(null);

  useEffect(() => {
    const unsub = subscribeToFeedPosts((fetched) => {
      setPosts(fetched);
    }, currentUser?.uid);
    return () => unsub();
  }, [currentUser]);

  // Flatten media items from posts
  const mediaItems = posts.flatMap((post) =>
    post.mediaUrls.map((url) => ({
      url,
      post,
      type: post.mediaType === 'video' ? ('video' as const) : ('photo' as const),
    }))
  );

  const filteredItems = mediaItems.filter((item) => {
    if (filter === 'admin') return item.post.isAuthorAdmin;
    if (filter === 'clients') return !item.post.isAuthorAdmin;
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
            Galerie Publique
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Explorez l'ensemble des photographies et créations visuelles partagées
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'admin', label: 'Signées Teddy' },
            { id: 'clients', label: 'Clients' },
            { id: 'videos', label: 'Vidéos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Masonry / Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-400">Aucun média dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={`${item.post.id}-${index}`}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedMedia(item)}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer shadow-sm"
            >
              {item.type === 'video' ? (
                <div className="relative w-full h-full bg-black">
                  <video src={item.url} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.post.caption || 'Photographie'}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Hover overlay with details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-400 flex items-center justify-center text-[10px] font-black text-neutral-950">
                    {item.post.isAuthorAdmin ? 'hT' : item.post.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold truncate">
                    {item.post.isAuthorAdmin ? 'Teddy (Admin)' : item.post.authorName}
                  </span>
                </div>
                {item.post.caption && (
                  <p className="text-[11px] text-neutral-200 line-clamp-2">
                    {item.post.caption}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" /> {item.post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> {item.post.commentsCount}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="rounded-3xl overflow-hidden max-h-[75vh] bg-black shadow-2xl">
                {selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="max-h-[75vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt=""
                    className="max-h-[75vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              {/* Lightbox Footer Bar */}
              <div className="w-full mt-4 flex items-center justify-between text-white px-2">
                <div>
                  <h4 className="text-sm font-bold">
                    {selectedMedia.post.isAuthorAdmin ? 'Admin @ hey Teddy,' : selectedMedia.post.authorName}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {selectedMedia.post.caption || 'Photographie haute définition'}
                  </p>
                </div>
                <a
                  href={selectedMedia.url}
                  download="hey_Teddy_Photo.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
