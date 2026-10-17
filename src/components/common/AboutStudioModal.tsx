import React from 'react';
import { X, MessageCircle, ExternalLink, Camera, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { SystemSetting } from '../../types';

interface AboutStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSetting;
}

export const AboutStudioModal: React.FC<AboutStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    "Bonjour BUSSO Studios, j'ai besoin d'informations concernant vos services photo et vos galeries sur Hey Teddy."
  );
  const whatsappUrl = `https://wa.me/2280160609787?text=${whatsappMessage}`;
  const tiktokUrl = settings.tiktokUrl || 'https://www.tiktok.com/@brosansfiltre?_r=1&_t=ZS-9AZ0Gs92mZE';
  const instagramUrl = settings.instagramUrl || 'https://instagram.com/_teddy_flex?srtk=MTV6cmI5MWppaWJ1YQ%3D%3D';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <BrandLogo size="lg" className="items-center mb-2" />
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950">
            {settings.studioName || 'BUSSO Studios'}
          </span>
        </div>

        {/* Bio / Presentation */}
        <div className="space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
          <p>
            Bienvenue dans l'univers de <strong>Teddy & BUSSO Studios</strong>.
            Nous concevons la photographie comme un art vivant : immortaliser l’émotion pure, la grâce des mariages prestigieux,
            l’élégance éditoriale de la mode et la vérité intemporelle des portraits.
          </p>

          <p>
            La plateforme <strong>Hey Teddy</strong> est conçue sur mesure pour offrir à nos clients une expérience de livraison
            inégalée : fichiers originaux préservés sans compression destructive, téléchargements ZIP complets et respect absolu
            de la confidentialité grâce au consentement photo par photo.
          </p>
        </div>

        {/* Primary CTA: WhatsApp Official */}
        <div className="mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-4 px-6 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition text-sm sm:text-base group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Contacter le studio sur WhatsApp</span>
          </a>
          <span className="block text-center text-[11px] text-neutral-400 mt-2">
            Numéro direct : +228 01 60 60 97 87
          </span>
        </div>

        {/* Official Social Media Links */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 text-center">
            Suivre Teddy sur les réseaux officiels
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* TikTok */}
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V8.5a8.28 8.28 0 0 0 4.77 1.5V6.69z" />
              </svg>
              <span>TikTok Officiel</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/10 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs border border-rose-300/30 transition"
            >
              <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
