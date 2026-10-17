import React from 'react';
import { Home, Camera, FolderLock, Send, Bell } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
  hasStudioGalleries?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
  hasStudioGalleries = false,
}) => {
  const navItems = [
    { id: 'feed', label: 'Accueil', icon: Home },
    { id: 'photos', label: 'Photos', icon: Camera },
    // Conditionnel : Visible uniquement si le client a au moins une galerie attribuée !
    ...(hasStudioGalleries ? [{ id: 'studio', label: 'Studio', icon: FolderLock }] : []),
    { id: 'messages', label: 'Messages', icon: Send, badge: unreadMessagesCount },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Navigation principale"
        className="pointer-events-auto relative flex items-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl rounded-full p-1.5 sm:p-2"
      >
        {/* Nav Items */}
        <div className="flex items-center gap-1 sm:gap-2 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 select-none ${
                  isActive
                    ? 'text-neutral-950 dark:text-neutral-950 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {/* Elastic Liquid Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="liquid-pill"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                      mass: 0.8,
                      bounce: 0.35,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full shadow-md z-[-1]"
                  />
                )}

                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative flex items-center justify-center"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-black bg-rose-500 text-white rounded-full shadow">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </motion.div>

                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
