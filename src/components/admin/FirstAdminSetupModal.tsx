import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Lock, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface FirstAdminSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FirstAdminSetupModal: React.FC<FirstAdminSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, initializeFirstAdmin } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInitialize = async () => {
    if (!currentUser) return;
    setIsInitializing(true);
    setError(null);
    try {
      const ok = await initializeFirstAdmin();
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Impossible d'initialiser l'administrateur. Un administrateur existe déjà.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-500 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
          Initialisation Administrateur
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
          Cette procédure sécurisée verrouille durablement le rôle d'administrateur principal de la plateforme **hey Teddy,** pour votre compte propriétaire.
        </p>

        {currentUser ? (
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl mb-6 text-left border border-neutral-200 dark:border-neutral-700">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
              Compte connecté
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {currentUser.email || currentUser.displayName}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl text-xs mb-6">
            Veuillez d'abord vous connecter avec votre adresse e-mail propriétaire.
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 text-xs font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-xs font-bold mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Rôle Administrateur activé avec succès !</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInitialize}
          disabled={!currentUser || isInitializing || success}
          className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-40 transition shadow-lg shadow-amber-400/20"
        >
          {isInitializing ? 'Vérification atomique...' : 'Activer et verrouiller l’accès Admin'}
        </motion.button>
      </motion.div>
    </div>
  );
};
