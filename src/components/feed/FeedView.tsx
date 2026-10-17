import React, { useEffect, useState } from 'react';
import { HeroSection } from './HeroSection';
import { PostCard } from './PostCard';
import { CommentsModal } from './CommentsModal';
import { Post, SystemSetting } from '../../types';
import { subscribeToFeedPosts, seedPostsIfEmpty } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Camera } from 'lucide-react';

interface FeedViewProps {
  settings: SystemSetting;
  onExplorePhotos: () => void;
  onOpenPrivateGalleryModal: () => void;
  onRequireAuth: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  settings,
  onExplorePhotos,
  onOpenPrivateGalleryModal,
  onRequireAuth,
}) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    seedPostsIfEmpty();
    const unsubscribe = subscribeToFeedPosts((fetchedPosts) => {
      setPosts(fetchedPosts);
      setIsLoading(false);
    }, currentUser?.uid);

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="w-full pb-28">
      {/* Immersive Cover & Brand Hero */}
      <HeroSection
        settings={settings}
        onExplorePhotos={onExplorePhotos}
        onOpenPrivateGalleryModal={onOpenPrivateGalleryModal}
      />

      {/* Main Feed Container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Feed Section Title */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Le Fil</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Les derniers instants saisis par Teddy et les clients du studio
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>En direct</span>
          </div>
        </div>

        {/* Posts Stream */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-full h-96 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
              Aucune publication pour le moment
            </h3>
            <p className="text-xs text-neutral-400">
              Soyez le premier à partager une photo ou vidéo avec la communauté hey Teddy, !
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenComments={(p) => setActiveCommentsPost(p)}
                onRequireAuth={onRequireAuth}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comments Drawer / Modal */}
      {activeCommentsPost && (
        <CommentsModal
          post={activeCommentsPost}
          onClose={() => setActiveCommentsPost(null)}
          onRequireAuth={onRequireAuth}
        />
      )}
    </div>
  );
};
