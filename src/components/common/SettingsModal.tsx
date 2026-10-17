import React from 'react';
import { X, Sun, Moon, ShieldCheck, User, MessageCircle, LogOut, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { BrandLogo } from './BrandLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFirstAdminSetup: () => void;
  onNavigateToAdmin: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenFirstAdminSetup,
  onNavigateToAdmin,
}) => {
  const { currentUser, userProfile, isAdmin, isAdminInitialized, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">
              Paramètres
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Apparence de l'application
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition ${
                  theme === 'light'
                    ? 'border-amber-400 bg-amber-50/50 text-neutral-950 font-extrabold shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Thème Clair</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition ${
                  theme === 'dark'
                    ? 'border-amber-400 bg-amber-950/30 text-white font-extrabold shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>Thème Sombre</span>
              </button>
            </div>
          </div>

          {/* Admin Role & Initialization Section */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Administration & Studio
            </span>

            {isAdmin ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vous êtes connecté en tant qu'Administrateur Officiel</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToAdmin();
                  }}
                  className="w-full py-2.5 rounded-xl font-bold bg-amber-400 text-neutral-950 text-xs hover:bg-amber-300 transition shadow"
                >
                  Ouvrir le Tableau de bord Admin
                </button>
              </div>
            ) : !isAdminInitialized ? (
              <div className="space-y-2">
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  L'administrateur principal n'a pas encore été configuré.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenFirstAdminSetup();
                  }}
                  className="w-full py-2.5 rounded-xl font-bold bg-amber-400 text-neutral-950 text-xs hover:bg-amber-300 transition shadow"
                >
                  Activer le premier Administrateur
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
                <span>Plateforme sécurisée par Teddy</span>
              </div>
            )}
          </div>

          {/* Account status */}
          {currentUser && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Compte actif
              </label>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                    {userProfile?.displayName || currentUser.displayName}
                  </span>
                  <span className="text-[11px] text-neutral-400 block truncate">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Platform info */}
          <div className="pt-2 text-center text-[11px] text-neutral-400 space-y-1">
            <BrandLogo size="sm" className="items-center mb-1" />
            <p>Version 2.0 • Plateforme Photographique & Galeries Privées</p>
            <p>Conçu pour l'émotion visuelle & la livraison haute définition.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
