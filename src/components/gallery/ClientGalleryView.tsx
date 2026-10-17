import React, { useEffect, useState } from 'react';
import {
  Gallery,
  GalleryItem,
  ItemConsentStatus,
} from '../../types';
import {
  getGalleryByIdOrToken,
  subscribeToGalleryItems,
  updateGalleryConsent,
  updateItemConsent,
  revokeItemConsent,
  downloadGalleryAsZip,
  assignGalleryToClient,
} from '../../services/dataService';
import {
  Download,
  ShieldCheck,
  Globe,
  Lock,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ArrowLeft,
  X,
  Play,
  UserCheck,
  LogIn,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';

interface ClientGalleryViewProps {
  galleryIdentifier: string;
  onBackToHome: () => void;
  whatsappNumber?: string;
  onRequireAuth?: () => void;
}

export const ClientGalleryView: React.FC<ClientGalleryViewProps> = ({
  galleryIdentifier,
  onBackToHome,
  whatsappNumber = '2280160609787',
  onRequireAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [accessError, setAccessError] = useState('');

  // ZIP download state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Zoom lightbox
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const fetched = await getGalleryByIdOrToken(galleryIdentifier);
      if (fetched) {
        setGallery(fetched);
        // If no access code, grant immediately
        if (!fetched.accessCode) {
          setIsAccessGranted(true);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [galleryIdentifier]);

  // Subscribe to items once gallery loaded
  useEffect(() => {
    if (!gallery) return;
    const unsub = subscribeToGalleryItems(gallery.id, (galleryItems) => {
      setItems(galleryItems);
    });
    return () => unsub();
  }, [gallery]);

  // Automatically assign gallery to client account when logged in & access granted
  useEffect(() => {
    if (gallery && currentUser && isAccessGranted) {
      if (!gallery.assignedClientUids?.includes(currentUser.uid)) {
        assignGalleryToClient(gallery.id, currentUser.uid);
      }
    }
  }, [gallery, currentUser, isAccessGranted]);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gallery) return;
    if (gallery.accessCode && accessCodeInput.trim() === gallery.accessCode) {
      setIsAccessGranted(true);
      setAccessError('');
      if (currentUser) {
        assignGalleryToClient(gallery.id, currentUser.uid);
      }
    } else {
      setAccessError('Code d’accès incorrect. Vérifiez votre message WhatsApp.');
    }
  };

  // Photo-by-photo consent toggle
  const handleToggleItemConsent = async (item: GalleryItem) => {
    if (!gallery) return;
    const isCurrentlyAuthorized = item.consentStatus === 'client_authorized' || item.consentStatus === 'admin_published';

    try {
      if (isCurrentlyAuthorized) {
        // Revoke consent
        await revokeItemConsent(gallery.id, item);
        setToastMessage('Consentement révoqué. Cette photo reste strictement privée.');
      } else {
        // Authorize photo
        await updateItemConsent(
          gallery.id,
          item.id,
          'client_authorized',
          userProfile?.displayName || gallery.clientName,
          gallery.title
        );
        setToastMessage('Photo autorisée ! Teddy examinera ce cliché pour le proposer sur le fil public.');
      }
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Item consent error:', err);
    }
  };

  const handleDownloadZip = async () => {
    if (!gallery || items.length === 0 || isZipping) return;
    setIsZipping(true);
    setZipProgress(10);
    try {
      await downloadGalleryAsZip(gallery, items, (percent) => {
        setZipProgress(percent);
      });
      setTimeout(() => {
        setIsZipping(false);
        setZipProgress(0);
      }, 1000);
    } catch (err) {
      console.error('ZIP download error:', err);
      setIsZipping(false);
    }
  };

  const cleanPhone = (whatsappNumber || '2280160609787').replace(/[^0-9]/g, '');
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour Teddy & BUSSO Studios ! Je consulte ma galerie privée "${gallery?.title || ''}".`
  )}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-amber-300">
            Chargement de votre galerie privée Hey Teddy...
          </p>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <div className="max-w-md w-full bg-neutral-900 rounded-3xl p-8 border border-neutral-800 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Galerie introuvable</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Ce lien est peut-être expiré ou incomplet. Veuillez contacter BUSSO Studios pour recevoir un nouveau lien.
          </p>
          <button
            onClick={onBackToHome}
            className="px-6 py-2.5 rounded-full font-bold bg-amber-400 text-neutral-950 text-xs hover:bg-amber-300"
          >
            Retourner à l’accueil
          </button>
        </div>
      </div>
    );
  }

  // Code protection screen if locked
  if (!isAccessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-neutral-900 rounded-3xl p-8 border border-neutral-800 text-center shadow-2xl"
        >
          <BrandLogo size="lg" className="items-center mb-6" />

          <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-black mb-1">{gallery.title}</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Séance privée réservée à {gallery.clientName}. Entrez le code secret reçu de BUSSO Studios pour déverrouiller vos clichés.
          </p>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input
              type="password"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Code d’accès secret"
              className="w-full text-center tracking-widest text-lg font-bold py-3.5 rounded-2xl bg-neutral-800 border-none text-white focus:ring-2 focus:ring-amber-400"
              autoFocus
            />

            {accessError && (
              <p className="text-xs text-rose-400 font-semibold">{accessError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20"
            >
              Déverrouiller ma galerie
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-amber-400"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Demander mon code à Teddy (+228 01 60 60 97 87)</span>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-28">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Accueil"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BrandLogo size="sm" onClick={onBackToHome} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Studio</span>
          </a>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadZip}
            disabled={isZipping || items.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 transition shadow-lg shadow-amber-400/20"
          >
            <Download className="w-4 h-4" />
            <span>
              {isZipping ? `Téléchargement ${zipProgress}%` : `Tout télécharger (ZIP)`}
            </span>
          </motion.button>
        </div>
      </header>

      {/* Banner / Connect Prompt if Client is Not Logged In */}
      {!currentUser && (
        <div className="bg-amber-400/10 border-b border-amber-400/20 px-4 py-2.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <span>Connectez-vous pour retrouver automatiquement cette séance dans votre espace <strong>Studio</strong> !</span>
          <button
            onClick={onRequireAuth}
            className="px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-bold hover:bg-amber-300 transition"
          >
            Se connecter
          </button>
        </div>
      )}

      {/* Hero Banner of the Gallery */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] overflow-hidden flex items-end">
        <img
          src={gallery.coverUrl}
          alt={gallery.title}
          className="absolute inset-0 w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pb-8 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950 shadow">
                BUSSO Studios • Privé
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-neutral-200 border border-white/20">
                {gallery.qualityMode === 'high' ? '💎 Haute Définition Originale' : '🔒 Aperçu Filigrané'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
              {gallery.title}
            </h1>
            <p className="text-sm text-neutral-300 font-medium">
              Séance réalisée avec soin pour <span className="font-bold text-white">{gallery.clientName}</span>
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {items.length}
            </span>
            <span className="text-xs text-neutral-400 block">médias livrés</span>
          </div>
        </div>
      </div>

      {/* PHOTO-BY-PHOTO CONSENT EXPLANATION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8">
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base sm:text-lg text-white">
                Contrôle de publication photo par photo
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Sur <strong>Hey Teddy</strong>, vous êtes maître absolu de votre image. Chaque cliché dispose de son propre interrupteur d'autorisation ci-dessous.
                Lorsque vous autorisez une photo, Teddy reçoit une notification pour l'examiner et éventuellement la mettre en valeur sur le fil d'actualité public.
                Vous pouvez révoquer votre autorisation à tout moment !
              </p>
            </div>
          </div>
        </div>

        {/* Toast Feedback */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3.5 rounded-2xl bg-amber-400 text-neutral-950 font-bold text-xs text-center shadow-lg"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photos & Videos Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Clichés & Vidéos de votre séance
          </h2>
          <span className="text-xs text-neutral-400">
            Téléchargement direct de l'original haute définition
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900 rounded-3xl border border-neutral-800 p-8">
            <p className="text-sm text-neutral-400">
              Teddy est en train d'importer vos médias. Revenez d'ici quelques instants !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const isAuthorized = item.consentStatus === 'client_authorized' || item.consentStatus === 'admin_published';
              const isPublished = item.consentStatus === 'admin_published';

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-md"
                >
                  {/* Media Preview */}
                  <div
                    onClick={() => setActivePhoto(item)}
                    className="relative aspect-[4/5] overflow-hidden bg-black cursor-pointer group"
                  >
                    {item.mediaType === 'video' ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-black">
                        <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                        <div className="w-12 h-12 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-xl">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt={item.title || `Photo ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <div className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition">
                        <Eye className="w-5 h-5" />
                      </div>
                      <a
                        href={item.originalUrl}
                        download={`Original_${index + 1}_BUSSO_Studios.jpg`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-full bg-amber-400 text-neutral-950 font-bold hover:bg-amber-300 transition"
                        title="Télécharger l'original"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                  {/* Card Actions & Photo-by-Photo Consent */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-300">
                        Cliché #{index + 1}
                      </span>
                      <a
                        href={item.originalUrl}
                        download={`Original_${index + 1}_BUSSO_Studios.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger original</span>
                      </a>
                    </div>

                    {/* Consent Toggle Button */}
                    <button
                      onClick={() => handleToggleItemConsent(item)}
                      className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                        isPublished
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                          : isAuthorized
                          ? 'bg-amber-950/60 text-amber-300 border-amber-400/40'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white border-neutral-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-left truncate mr-2">
                        {isPublished ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>Publiée sur le fil public ✨</span>
                          </>
                        ) : isAuthorized ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>Autorisée (En examen)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                            <span>Privée (Non autorisée)</span>
                          </>
                        )}
                      </span>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isAuthorized ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        {isAuthorized ? 'Révoquer' : 'Autoriser'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for Individual Media */}
      <AnimatePresence>
        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="rounded-3xl overflow-hidden max-h-[75vh] bg-neutral-950 shadow-2xl">
                {activePhoto.mediaType === 'video' ? (
                  <video
                    src={activePhoto.originalUrl || activePhoto.previewUrl}
                    controls
                    autoPlay
                    className="max-h-[75vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={activePhoto.originalUrl || activePhoto.previewUrl}
                    alt=""
                    className="max-h-[75vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              <div className="w-full mt-4 flex items-center justify-between text-white px-2">
                <div>
                  <h4 className="text-sm font-bold">{gallery.title}</h4>
                  <p className="text-xs text-neutral-400">
                    Fichier Original Haute Définition • BUSSO Studios
                  </p>
                </div>
                <a
                  href={activePhoto.originalUrl}
                  download="Original_BUSSO_Studios.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'original</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
