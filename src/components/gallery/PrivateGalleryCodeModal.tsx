import React, { useState } from 'react';
import { X, KeyRound, ArrowRight, AlertCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from '../common/BrandLogo';

interface PrivateGalleryCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTokenOrCode: (identifier: string) => void;
  whatsappNumber?: string;
}

export const PrivateGalleryCodeModal: React.FC<PrivateGalleryCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmitTokenOrCode,
  whatsappNumber = '33612345678',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      setError('Veuillez saisir votre lien ou code secret.');
      return;
    }

    let clean = inputVal.trim();
    // If user pasted a full URL, extract gallery token
    if (clean.includes('gallery=')) {
      const match = clean.match(/gallery=([^&]+)/);
      if (match) clean = match[1];
    }

    onSubmitTokenOrCode(clean);
    onClose();
  };

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    "Bonjour Teddy ! Je souhaite recevoir le lien d'accès à ma galerie privée."
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-500 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
          Accéder à votre galerie privée
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
          Entrez le code secret ou collez le lien reçu par WhatsApp/SMS de la part de Teddy.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setError('');
            }}
            placeholder="ex: SARAH2026 ou collez votre lien..."
            className="w-full text-center text-sm font-bold py-3.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
            autoFocus
          />

          {error && (
            <p className="text-xs text-rose-500 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
          >
            <span>Ouvrir la séance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-emerald-500 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>Demander mon lien à Teddy sur WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
