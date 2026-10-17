import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Settings, ShieldCheck, User, LogIn, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAboutStudio?: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenSettings,
  onOpenAboutStudio,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <BrandLogo onClick={() => onNavigate('feed')} size="md" showStudioSubtitle />

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* En savoir plus (Studio Info) */}
          {onOpenAboutStudio && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAboutStudio}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="En savoir plus sur BUSSO Studios"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Le Studio</span>
            </motion.button>
          )}

          {/* Admin badge / button */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-400 text-neutral-900 shadow-sm hover:bg-amber-300 transition-colors"
              title="Tableau de bord Administrateur"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Studio</span>
            </motion.button>
          )}

          {/* Theme switcher */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-700" />
            )}
          </motion.button>

          {/* Settings button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenSettings}
            className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Paramètres"
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* Profile / Auth button */}
          {currentUser ? (
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('profile')}
              className="relative cursor-pointer"
              title="Voir mon profil"
            >
              <div className="w-9 h-9 rounded-full ring-2 ring-amber-400/80 p-0.5 overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                <img
                  src={
                    userProfile?.photoURL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={userProfile?.displayName || 'Profil'}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {isAdmin && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white dark:border-neutral-900 rounded-full" />
              )}
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow hover:bg-neutral-800 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Connexion</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
