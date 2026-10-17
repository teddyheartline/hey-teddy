import React, { useState } from 'react';
import {
  UserProfile,
  Post,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings,
  Grid,
  Image,
  Video,
  UserPlus,
  Check,
  Edit3,
  StickyNote,
  X,
  Camera,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileViewProps {
  profileUser?: UserProfile;
  userPosts: Post[];
  onOpenSettings: () => void;
  onRequireAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUser,
  userPosts,
  onOpenSettings,
  onRequireAuth,
}) => {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState(userProfile?.displayName || '');
  const [editUsername, setEditUsername] = useState(userProfile?.username || '');
  const [editBio, setEditBio] = useState(userProfile?.bio || '');
  const [editNotes, setEditNotes] = useState(userProfile?.notes || '');
  const [editPhotoURL, setEditPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  // Follow & Friend simulation
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriendRequested, setIsFriendRequested] = useState(false);

  // Target profile: passed in or active user
  const targetUser = profileUser || userProfile;
  const isOwnProfile = currentUser && targetUser && currentUser.uid === targetUser.uid;

  if (!targetUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
          Profil introuvable
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Veuillez vous connecter pour accéder à votre profil hey Teddy,
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-2.5 rounded-full font-bold bg-amber-400 text-neutral-950 text-xs shadow hover:bg-amber-300"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setEditDisplayName(targetUser.displayName || '');
    setEditUsername(targetUser.username || '');
    setEditBio(targetUser.bio || '');
    setEditNotes(targetUser.notes || '');
    setEditPhotoURL(targetUser.photoURL || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: editDisplayName.trim(),
        username: editUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_.]/g, ''),
        bio: editBio.trim(),
        notes: editNotes.trim(),
        photoURL: editPhotoURL.trim(),
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPosts = userPosts.filter((p) => {
    if (activeTab === 'photos') return p.mediaType === 'photo' || p.mediaType === 'gallery';
    if (activeTab === 'videos') return p.mediaType === 'video';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-28">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Large Circular Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-amber-400/80 shadow-md bg-neutral-200 dark:bg-neutral-800">
              <img
                src={targetUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt={targetUser.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {isOwnProfile && (
              <button
                onClick={handleOpenEdit}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-amber-400 text-neutral-950 shadow-md hover:bg-amber-300 transition"
                title="Changer la photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Info & Stats */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                    {targetUser.displayName}
                  </h1>
                  {targetUser.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950">
                      Photographe Officiel
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 font-medium">
                  @{targetUser.username}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={handleOpenEdit}
                      className="px-4 py-2 rounded-full font-bold text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier le profil</span>
                    </button>
                    <button
                      onClick={onOpenSettings}
                      className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition"
                      title="Paramètres"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={logout}
                      className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 transition"
                      title="Déconnexion"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-5 py-2 rounded-full font-bold text-xs transition ${
                        isFollowing
                          ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                          : 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                      }`}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFriendRequested(!isFriendRequested)}
                      className="px-4 py-2 rounded-full font-bold text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 transition flex items-center gap-1.5"
                    >
                      {isFriendRequested ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Demande envoyée</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Ajouter en ami</span>
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center sm:justify-start gap-6 py-3 border-y border-neutral-100 dark:border-neutral-800 my-4 text-center sm:text-left">
              <div>
                <span className="font-black text-base sm:text-lg text-neutral-900 dark:text-white">
                  {targetUser.postsCount || userPosts.length}
                </span>
                <span className="text-xs text-neutral-400 block sm:inline sm:ml-1.5">
                  publications
                </span>
              </div>
              <div>
                <span className="font-black text-base sm:text-lg text-neutral-900 dark:text-white">
                  {targetUser.followersCount + (isFollowing ? 1 : 0)}
                </span>
                <span className="text-xs text-neutral-400 block sm:inline sm:ml-1.5">
                  abonnés
                </span>
              </div>
              <div>
                <span className="font-black text-base sm:text-lg text-neutral-900 dark:text-white">
                  {targetUser.followingCount}
                </span>
                <span className="text-xs text-neutral-400 block sm:inline sm:ml-1.5">
                  abonnements
                </span>
              </div>
            </div>

            {/* Bio */}
            {targetUser.bio && (
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                {targetUser.bio}
              </p>
            )}

            {/* Notes Section (Thought bubble) */}
            {targetUser.notes ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs font-medium text-amber-900 dark:text-amber-200">
                <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Note : "{targetUser.notes}"</span>
              </div>
            ) : isOwnProfile ? (
              <button
                onClick={handleOpenEdit}
                className="text-xs text-amber-500 font-semibold hover:underline flex items-center gap-1"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Ajouter une note de profil (humeur ou statut)</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Publications Grid Header with Tabs */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Toutes ({userPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'photos'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'videos'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Vidéos</span>
          </button>
        </div>
      </div>

      {/* Grid of User Publications */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
          <p className="text-xs text-neutral-400">Aucune publication dans cette rubrique.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 group shadow-sm"
            >
              <img
                src={post.mediaUrls[0]}
                alt={post.caption || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-3 text-white text-center">
                <p className="text-xs line-clamp-3 font-medium">{post.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Modifier mon profil
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Nom complet affiché
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Nom d'utilisateur (@pseudo)
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    URL de la photo de profil
                  </label>
                  <input
                    type="url"
                    value={editPhotoURL}
                    onChange={(e) => setEditPhotoURL(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Biographie
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Parlez-nous de vous..."
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Note / Humeur du moment
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="ex: En tournage au soleil couchant 🌅"
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 transition shadow"
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
