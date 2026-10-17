import React, { useState } from 'react';
import {
  Gallery,
  SystemSetting,
} from '../../types';
import {
  FolderLock,
  Download,
  Calendar,
  Sparkles,
  Eye,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface StudioViewProps {
  galleries: Gallery[];
  settings: SystemSetting;
  onOpenGallery: (token: string) => void;
  onRequireAuth: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  galleries,
  settings,
  onOpenGallery,
  onRequireAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'available' | 'archived'>('all');

  const filteredGalleries = galleries.filter((g) => {
    if (filter === 'available') return g.status !== 'archived' && g.status !== 'expired';
    if (filter === 'archived') return g.status === 'archived' || g.status === 'expired';
    return true;
  });

  const whatsappLink = `https://wa.me/2280160609787?text=${encodeURIComponent(
    "Bonjour BUSSO Studios ! Je suis connecté sur Hey Teddy et je souhaite vérifier l'accès à mes galeries photos."
  )}`;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950">
            <Sparkles className="w-3 h-3" /> Nouvelle Galerie
          </span>
        );
      case 'updated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white">
            <Clock className="w-3 h-3" /> Mise à jour
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Archivée
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            Accès expiré
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Disponible
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-28">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950">
              Espace Client
            </span>
            <span className="text-xs font-bold text-neutral-500">
              {settings.studioName || 'BUSSO Studios'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mt-1">
            Mon Studio Privé
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Retrouvez toutes vos séances photo et vidéos livrées par Teddy en haute définition originale
          </p>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm self-start sm:self-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Contacter Teddy sur WhatsApp</span>
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Toutes ({galleries.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            filter === 'available'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Disponibles
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            filter === 'archived'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Archives
        </button>
      </div>

      {/* Galleries Cards */}
      {filteredGalleries.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-4">
            <FolderLock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            Aucune galerie disponible
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-6">
            Dès que Teddy vous aura préparé une séance photo privée, elle apparaîtra automatiquement ici.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs bg-amber-400 text-neutral-950 hover:bg-amber-300 transition shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Demander l'accès à Teddy (+228 01 60 60 97 87)</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGalleries.map((gallery) => (
            <motion.div
              key={gallery.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Cover Image */}
              <div
                onClick={() => onOpenGallery(gallery.accessLinkToken)}
                className="relative h-56 sm:h-64 cursor-pointer overflow-hidden bg-neutral-900 group"
              >
                <img
                  src={gallery.coverUrl}
                  alt={gallery.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  {getStatusBadge(gallery.status)}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] text-amber-300 font-bold block mb-1">
                    {gallery.qualityMode === 'high' ? '💎 Haute Résolution Originale' : '🔒 Aperçu Filigrané'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug line-clamp-1">
                    {gallery.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      {gallery.photoCount || 0} photos {gallery.videoCount ? `• ${gallery.videoCount} vidéos` : ''}
                    </span>
                    {gallery.sessionDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(gallery.sessionDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                {gallery.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {gallery.description}
                  </p>
                )}

                {/* Consent Status Indicator */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Consentement de publication :</span>
                  {gallery.clientConsentStatus === 'authorized' ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accord accordé
                    </span>
                  ) : gallery.clientConsentStatus === 'declined' ? (
                    <span className="font-bold text-neutral-400">
                      Strictement privé
                    </span>
                  ) : (
                    <span className="font-bold text-amber-500">
                      À configurer photo par photo
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenGallery(gallery.accessLinkToken)}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-amber-400 text-neutral-950 hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ouvrir la galerie</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/2280160609787?text=${encodeURIComponent(
                      `Bonjour Teddy ! Je consulte ma galerie "${gallery.title}" sur Hey Teddy.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition"
                    title="Échanger sur WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
