import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  FolderLock,
  Image,
  Users,
  Settings,
  Plus,
  Share2,
  Download,
  Trash2,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  X,
  UploadCloud,
  Check,
  Eye,
  KeyRound,
  Sparkles,
  Globe,
  Lock,
  Calendar,
  Layers,
  Bot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Gallery,
  GalleryItem,
  Post,
  SystemSetting,
} from '../../types';
import {
  subscribeToGalleries,
  createGallery,
  addGalleryItem,
  getSystemSettings,
  updateSystemSettings,
  subscribeToFeedPosts,
  deletePost,
  publishItemToFeed,
  subscribeToGalleryItems,
} from '../../services/dataService';

interface AdminDashboardProps {
  onBackToFeed: () => void;
  onOpenClientGallery: (galleryId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToFeed,
  onOpenClientGallery,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'galleries' | 'consents' | 'posts' | 'settings'>('overview');

  // Galleries & Posts
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SystemSetting | null>(null);

  // Gallery items for consent moderation
  const [authorizedItems, setAuthorizedItems] = useState<{ item: GalleryItem; gallery: Gallery }[]>([]);

  // Create Gallery Modal state
  const [isCreateGalleryOpen, setIsCreateGalleryOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAccessCode, setNewAccessCode] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newQualityMode, setNewQualityMode] = useState<'high' | 'watermark_preview'>('high');
  const [initialPhotosInput, setInitialPhotosInput] = useState('');
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);

  // Settings form
  const [heroImageInput, setHeroImageInput] = useState('');
  const [heroTitleInput, setHeroTitleInput] = useState('');
  const [heroSubtitleInput, setHeroSubtitleInput] = useState('');
  const [studioNameInput, setStudioNameInput] = useState('');
  const [studioPhoneInput, setStudioPhoneInput] = useState('');
  const [studioWhatsAppInput, setStudioWhatsAppInput] = useState('');
  const [tiktokUrlInput, setTiktokUrlInput] = useState('');
  const [instagramUrlInput, setInstagramUrlInput] = useState('');
  const [tedoraPromptInput, setTedoraPromptInput] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Copied link feedback
  const [copiedGalleryId, setCopiedGalleryId] = useState<string | null>(null);

  useEffect(() => {
    const unsubGalleries = subscribeToGalleries(setGalleries);
    const unsubPosts = subscribeToFeedPosts(setPosts);

    async function fetchSettings() {
      const s = await getSystemSettings();
      setSettings(s);
      setHeroImageInput(s.heroImageUrl);
      setHeroTitleInput(s.heroTitle);
      setHeroSubtitleInput(s.heroSubtitle);
      setStudioNameInput(s.studioName || 'BUSSO Studios');
      setStudioPhoneInput(s.studioPhone || '+228 01 60 60 97 87');
      setStudioWhatsAppInput(s.studioWhatsApp || '2280160609787');
      setTiktokUrlInput(s.tiktokUrl || 'https://www.tiktok.com/@brosansfiltre?_r=1&_t=ZS-9AZ0Gs92mZE');
      setInstagramUrlInput(s.instagramUrl || 'https://instagram.com/_teddy_flex?srtk=MTV6cmI5MWppaWJ1YQ%3D%3D');
      setTedoraPromptInput(s.tedoraSystemPrompt || '');
    }
    fetchSettings();

    return () => {
      unsubGalleries();
      unsubPosts();
    };
  }, []);

  // Listen for authorized items across galleries for moderation
  useEffect(() => {
    if (galleries.length === 0) return;
    const unsubscribers: (() => void)[] = [];

    galleries.forEach((gal) => {
      const unsub = subscribeToGalleryItems(gal.id, (items) => {
        const clientAuthorized = items
          .filter((it) => it.consentStatus === 'client_authorized')
          .map((item) => ({ item, gallery: gal }));

        setAuthorizedItems((prev) => {
          const others = prev.filter((p) => p.gallery.id !== gal.id);
          return [...others, ...clientAuthorized];
        });
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [galleries]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mb-4">
          <FolderLock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
          Accès Réservé
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Seul l'administrateur officiel de BUSSO Studios & Hey Teddy peut accéder à cet espace de gestion.
        </p>
        <button
          onClick={onBackToFeed}
          className="px-6 py-2.5 rounded-full font-bold bg-amber-400 text-neutral-950 text-xs hover:bg-amber-300"
        >
          Retourner au fil public
        </button>
      </div>
    );
  }

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClientName.trim() || isSubmittingGallery) return;

    setIsSubmittingGallery(true);
    try {
      const token = `ht_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      const cover =
        newCoverUrl.trim() ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85';

      const galleryId = await createGallery({
        title: newTitle.trim(),
        clientName: newClientName.trim(),
        clientPhone: newClientPhone.trim(),
        clientEmail: newClientEmail.trim(),
        sessionDate: newSessionDate || new Date().toISOString(),
        description: newDescription.trim(),
        accessCode: newAccessCode.trim() || undefined,
        accessLinkToken: token,
        coverUrl: cover,
        status: 'new',
        clientConsentStatus: 'pending',
        qualityMode: newQualityMode,
      });

      // Add initial photos / videos
      const mediaLines = initialPhotosInput
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const line of mediaLines) {
        const isVideo = line.endsWith('.mp4') || line.includes('video');
        await addGalleryItem(galleryId, {
          previewUrl: line,
          originalUrl: line,
          mediaType: isVideo ? 'video' : 'photo',
        });
      }

      setIsCreateGalleryOpen(false);
      setNewTitle('');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewSessionDate('');
      setNewDescription('');
      setNewAccessCode('');
      setNewCoverUrl('');
      setInitialPhotosInput('');
    } catch (err) {
      console.error('Error creating gallery:', err);
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSystemSettings({
        heroImageUrl: heroImageInput.trim(),
        heroTitle: heroTitleInput.trim(),
        heroSubtitle: heroSubtitleInput.trim(),
        studioName: studioNameInput.trim(),
        studioPhone: studioPhoneInput.trim(),
        studioWhatsApp: studioWhatsAppInput.trim(),
        tiktokUrl: tiktokUrlInput.trim(),
        instagramUrl: instagramUrlInput.trim(),
        tedoraSystemPrompt: tedoraPromptInput.trim(),
      });
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Settings update error:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCopyLink = async (gallery: Gallery) => {
    const link = `${window.location.origin}/?gallery=${gallery.accessLinkToken}`;
    await navigator.clipboard.writeText(link);
    setCopiedGalleryId(gallery.id);
    setTimeout(() => setCopiedGalleryId(null), 2500);
  };

  const generateWhatsAppShareUrl = (gallery: Gallery) => {
    const link = `${window.location.origin}/?gallery=${gallery.accessLinkToken}`;
    const codeMsg = gallery.accessCode ? ` Votre code d’accès secret : *${gallery.accessCode}*` : '';
    const message = `Bonjour ${gallery.clientName} ! C’est Teddy de BUSSO Studios 📸. Votre galerie photo est disponible sur Hey Teddy. Ouvrez le lien pour accéder à vos photos et vidéos : ${link}${codeMsg} Si vous rencontrez une difficulté, contactez le studio au +228 01 60 60 97 87.`;
    const cleanPhone = (gallery.clientPhone || settings?.studioWhatsApp || '2280160609787').replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handlePublishAuthorizedPhoto = async (itemPair: { item: GalleryItem; gallery: Gallery }) => {
    if (!currentUser) return;
    try {
      await publishItemToFeed(
        itemPair.gallery,
        itemPair.item,
        currentUser.uid,
        `Séance exclusive "${itemPair.gallery.title}" • BUSSO Studios ✨ Photographie signée Teddy`
      );
      setAuthorizedItems((prev) => prev.filter((p) => p.item.id !== itemPair.item.id));
    } catch (err) {
      console.error('Failed to publish photo to feed:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                Admin Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-neutral-950">
                BUSSO Studios • Teddy
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Gestion des galeries privées, validation des consentements photo et paramètres Tedora IA
            </p>
          </div>
        </div>

        <button
          onClick={onBackToFeed}
          className="px-5 py-2.5 rounded-full font-bold text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        >
          Voir le fil public
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'overview', label: 'Vue d’ensemble', icon: Sparkles },
          { id: 'galleries', label: `Galeries Clients (${galleries.length})`, icon: FolderLock },
          { id: 'consents', label: `Consentements (${authorizedItems.length})`, icon: Globe, badge: authorizedItems.length },
          { id: 'posts', label: `Publications (${posts.length})`, icon: Image },
          { id: 'settings', label: 'Paramètres du site & Tedora', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex-shrink-0 ${
                isActive
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/80 dark:border-neutral-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Galeries Privées
              </span>
              <p className="text-3xl font-black text-amber-500 mt-2">{galleries.length}</p>
              <span className="text-[11px] text-neutral-400">Séances livrées aux clients</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Publications Fil
              </span>
              <p className="text-3xl font-black text-neutral-900 dark:text-white mt-2">
                {posts.length}
              </p>
              <span className="text-[11px] text-neutral-400">Visibles par la communauté</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Téléchargements
              </span>
              <p className="text-3xl font-black text-emerald-500 mt-2">
                {galleries.reduce((acc, g) => acc + (g.downloadCount || 0), 0)}
              </p>
              <span className="text-[11px] text-neutral-400">Originaux et archives ZIP</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Photos en attente
              </span>
              <p className="text-3xl font-black text-indigo-500 mt-2">
                {authorizedItems.length}
              </p>
              <span className="text-[11px] text-neutral-400">À valider pour mise en ligne</span>
            </div>
          </div>

          {/* Quick Action: Create Gallery Callout */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-400 text-neutral-950">
                Livraison Instantanée BUSSO Studios
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-2">
                Créer une nouvelle galerie privée pour un client
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                Importez les originaux HD, configurez l'accès et générez le lien de partage WhatsApp pré-rempli (+228 01 60 60 97 87).
              </p>
            </div>
            <button
              onClick={() => setIsCreateGalleryOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Créer une galerie</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. GALLERIES TAB */}
      {activeTab === 'galleries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">
              Toutes les Galeries Clients
            </h2>
            <button
              onClick={() => setIsCreateGalleryOpen(true)}
              className="px-4 py-2 rounded-2xl font-bold text-xs bg-amber-400 text-neutral-950 hover:bg-amber-300 transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle galerie</span>
            </button>
          </div>

          {galleries.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
              <p className="text-xs text-neutral-400">Aucune galerie créée pour l'instant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleries.map((gal) => (
                <div
                  key={gal.id}
                  className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
                          <img
                            src={gal.coverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                            {gal.title}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            Client : <span className="font-semibold text-neutral-700 dark:text-neutral-300">{gal.clientName}</span>
                          </p>
                          {gal.clientPhone && (
                            <p className="text-[11px] text-neutral-400">
                              Tel/WA : {gal.clientPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                        {gal.status || 'Disponible'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 py-2 border-y border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 mb-4">
                      <span>📸 {gal.photoCount || 0} photos {gal.videoCount ? `• ${gal.videoCount} vidéos` : ''}</span>
                      <span>⬇️ {gal.downloadCount || 0} téléchargements</span>
                      {gal.accessCode && <span>🔑 {gal.accessCode}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => onOpenClientGallery(gal.accessLinkToken)}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Voir la galerie</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(gal)}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-1.5"
                    >
                      {copiedGalleryId === gal.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Copier le lien</span>
                        </>
                      )}
                    </button>

                    <a
                      href={generateWhatsAppShareUrl(gal)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center gap-1.5 shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Envoyer WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CONSENT MODERATION TAB */}
      {activeTab === 'consents' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">
              Demandes de publication & Consentements Clients
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Les clients ont explicitement autorisé ces clichés. Examinez-les et décidez de leur mise en ligne sur le fil public Hey Teddy.
            </p>
          </div>

          {authorizedItems.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                Aucune photo en attente de validation
              </h3>
              <p className="text-xs text-neutral-400">
                Toutes les autorisations clients ont été traitées ou vos clients préfèrent garder leurs photos privées.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {authorizedItems.map((itemPair) => (
                <div
                  key={itemPair.item.id}
                  className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/5] bg-black">
                    <img
                      src={itemPair.item.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-neutral-950 font-black text-[10px] uppercase shadow">
                      Autorisé par le client
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
                        Galerie : {itemPair.gallery.title}
                      </span>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Client : {itemPair.gallery.clientName}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePublishAuthorizedPhoto(itemPair)}
                      className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs bg-amber-400 text-neutral-950 hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Valider & Publier sur le Fil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Publications du fil d'actualité
          </h2>
          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
                    <img src={p.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white block">
                      Par {p.authorName} {p.isAuthorAdmin ? '(Admin)' : ''}
                    </span>
                    <p className="text-xs text-neutral-400 line-clamp-1">{p.caption}</p>
                    <span className="text-[10px] text-neutral-500">
                      ❤️ {p.likesCount} likes • 💬 {p.commentsCount} commentaires
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (window.confirm('Supprimer cette publication ?')) {
                      await deletePost(p.id, p.authorId);
                    }
                  }}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Supprimer la publication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
            Paramètres du Studio & Configuration Tedora IA
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Personnalisez l'identité de BUSSO Studios, les coordonnées WhatsApp officielles et le comportement de votre assistant Tedora.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Nom du Studio
              </label>
              <input
                type="text"
                value={studioNameInput}
                onChange={(e) => setStudioNameInput(e.target.value)}
                placeholder="BUSSO Studios"
                required
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Numéro WhatsApp Officiel (format international, ex: 2280160609787)
              </label>
              <input
                type="text"
                value={studioWhatsAppInput}
                onChange={(e) => setStudioWhatsAppInput(e.target.value)}
                placeholder="2280160609787"
                required
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Téléphone affiché
              </label>
              <input
                type="text"
                value={studioPhoneInput}
                onChange={(e) => setStudioPhoneInput(e.target.value)}
                placeholder="+228 01 60 60 97 87"
                required
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Lien TikTok Officiel
              </label>
              <input
                type="url"
                value={tiktokUrlInput}
                onChange={(e) => setTiktokUrlInput(e.target.value)}
                placeholder="https://www.tiktok.com/@brosansfiltre..."
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Lien Instagram Officiel
              </label>
              <input
                type="url"
                value={instagramUrlInput}
                onChange={(e) => setInstagramUrlInput(e.target.value)}
                placeholder="https://instagram.com/_teddy_flex..."
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Instructions personnalisées pour Tedora IA (Optionnel)
              </label>
              <textarea
                rows={3}
                value={tedoraPromptInput}
                onChange={(e) => setTedoraPromptInput(e.target.value)}
                placeholder="Instructions pour Tedora concernant vos disponibilités, forfaits mariages..."
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Image de Couverture Hero (Accueil)
              </label>
              <input
                type="url"
                value={heroImageInput}
                onChange={(e) => setHeroImageInput(e.target.value)}
                placeholder="https://..."
                required
                className="w-full text-xs p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {settingsSaveSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold text-center">
                Paramètres enregistrés avec succès !
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 transition shadow-md"
            >
              {isSavingSettings ? 'Enregistrement...' : 'Mettre à jour les paramètres'}
            </button>
          </form>
        </div>
      )}

      {/* Create Gallery Modal */}
      <AnimatePresence>
        {isCreateGalleryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Nouvelle Galerie Privée
                </h3>
                <button
                  onClick={() => setIsCreateGalleryOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGallery} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Titre de la séance (Obligatoire)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="ex: Mariage de Sarah & Julien"
                    required
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                      Nom du Client
                    </label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Sarah Morin"
                      required
                      className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                      Téléphone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+228..."
                      className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Date de la séance (Optionnel)
                  </label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Code Secret de la galerie (Facultatif)
                  </label>
                  <input
                    type="text"
                    value={newAccessCode}
                    onChange={(e) => setNewAccessCode(e.target.value)}
                    placeholder="ex: SARAH2026"
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Qualité de livraison
                  </label>
                  <select
                    value={newQualityMode}
                    onChange={(e) => setNewQualityMode(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="high">💎 Haute Résolution Originale (Téléchargeable)</option>
                    <option value="watermark_preview">🔒 Basse Qualité / Aperçu Filigrané</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Photo de couverture (URL)
                  </label>
                  <input
                    type="url"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Photos et Vidéos (URLs, 1 par ligne)
                  </label>
                  <textarea
                    rows={3}
                    value={initialPhotosInput}
                    onChange={(e) => setInitialPhotosInput(e.target.value)}
                    placeholder="https://images.unsplash.com/...
https://assets.mixkit.co/...mp4"
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingGallery}
                    className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 transition shadow-md"
                  >
                    {isSubmittingGallery ? 'Création en cours...' : 'Créer et générer le lien WhatsApp'}
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
