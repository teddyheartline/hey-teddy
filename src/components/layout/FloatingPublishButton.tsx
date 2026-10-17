import React, { useState } from 'react';
import { Plus, X, Image, Video, Images, UploadCloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../services/dataService';
import { MediaType } from '../../types';

interface FloatingPublishButtonProps {
  onPostCreated?: () => void;
  onRequireAuth?: () => void;
}

export const FloatingPublishButton: React.FC<FloatingPublishButtonProps> = ({
  onPostCreated,
  onRequireAuth,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'choose' | 'details' | 'uploading' | 'success'>('choose');
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [mediaUrlsInput, setMediaUrlsInput] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [uploadProgress, setUploadProgress] = useState(0);

  const samplePresets: Record<MediaType, string[]> = {
    photo: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=85',
    ],
    video: [
      'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-pictures-of-a-model-41589-large.mp4',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
    ],
  };

  const handleOpen = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setStep('choose');
    setCaption('');
    setMediaUrlsInput('');
    setIsOpen(true);
  };

  const handleSelectType = (type: MediaType) => {
    setMediaType(type);
    setMediaUrlsInput(samplePresets[type][0]);
    setStep('details');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrlsInput(event.target.result as string);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    const urls = mediaUrlsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (urls.length === 0) return;

    setStep('uploading');
    setUploadProgress(25);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 25;
        });
      }, 150);

      await createPost({
        authorId: currentUser.uid,
        authorName: isAdmin ? 'Admin' : userProfile.displayName,
        authorPhotoURL: isAdmin ? '' : userProfile.photoURL,
        isAuthorAdmin: isAdmin,
        mediaType,
        mediaUrls: urls,
        caption,
        visibility,
      });

      clearInterval(interval);
      setUploadProgress(100);
      setStep('success');

      setTimeout(() => {
        setIsOpen(false);
        if (onPostCreated) onPostCreated();
      }, 1200);
    } catch (err) {
      console.error('Failed to create post:', err);
      setStep('details');
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-neutral-950 shadow-xl shadow-amber-400/30 flex items-center justify-center border-2 border-white dark:border-neutral-900 focus:outline-none"
        title="Publier un contenu"
        aria-label="Publier"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Choose Type */}
              {step === 'choose' && (
                <div className="text-center py-4">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
                    Que veux-tu publier ?
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                    Partagez votre regard artistique avec la communauté hey Teddy,
                  </p>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <button
                      onClick={() => handleSelectType('photo')}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border-2 border-transparent hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-neutral-800 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <Image className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        Photo
                      </span>
                      <span className="text-xs text-neutral-400 mt-0.5">Cliché unique</span>
                    </button>

                    <button
                      onClick={() => handleSelectType('video')}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border-2 border-transparent hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-neutral-800 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <Video className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        Vidéo
                      </span>
                      <span className="text-xs text-neutral-400 mt-0.5">Teaser ou reel</span>
                    </button>

                    <button
                      onClick={() => handleSelectType('gallery')}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border-2 border-transparent hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-neutral-800 transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <Images className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        Galerie
                      </span>
                      <span className="text-xs text-neutral-400 mt-0.5">Carrousel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Form Details */}
              {step === 'details' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setStep('choose')}
                      className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    >
                      ← Changer de type
                    </button>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Publication {mediaType}
                    </span>
                  </div>

                  {/* Media input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Fichier ou URL du média
                    </label>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl cursor-pointer hover:border-amber-400 dark:hover:border-amber-400 bg-neutral-50/50 dark:bg-neutral-800/30 transition text-sm text-neutral-600 dark:text-neutral-300">
                        <UploadCloud className="w-4 h-4 text-amber-500" />
                        <span>Choisir une photo locale</span>
                        <input
                          type="file"
                          accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>

                      <textarea
                        rows={2}
                        value={mediaUrlsInput}
                        onChange={(e) => setMediaUrlsInput(e.target.value)}
                        placeholder="Ou collez une ou plusieurs URL directes (une par ligne)..."
                        className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-400 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Preview if available */}
                  {mediaUrlsInput.startsWith('http') || mediaUrlsInput.startsWith('data:image') ? (
                    <div className="h-32 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={mediaUrlsInput.split('\n')[0]}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  {/* Caption */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Légende
                    </label>
                    <textarea
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Décrivez votre émotion, les réglages, le lieu..."
                      className="w-full text-sm p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-400 dark:text-white"
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Visibilité
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="w-full text-sm p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-400 dark:text-white"
                    >
                      <option value="public">🌍 Public (Visible dans le fil d'actualité)</option>
                      <option value="followers">👥 Abonnés uniquement</option>
                      <option value="private">🔒 Privé</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!mediaUrlsInput.trim()}
                      className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 shadow-md hover:bg-amber-300 disabled:opacity-50 transition"
                    >
                      Publier maintenant
                    </motion.button>
                  </div>
                </form>
              )}

              {/* Step 3: Uploading Progress */}
              {step === 'uploading' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center animate-spin">
                    <UploadCloud className="w-8 h-8 text-amber-500" />
                  </div>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Publication en cours...
                  </h4>
                  <div className="w-48 mx-auto h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400">{uploadProgress}% terminé</p>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-xl font-black text-neutral-900 dark:text-white">
                    Publié avec succès !
                  </h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Votre publication brille désormais sur hey Teddy,
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
