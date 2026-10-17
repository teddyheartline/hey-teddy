import React from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles, KeyRound } from 'lucide-react';
import { SystemSetting } from '../../types';

interface HeroSectionProps {
  settings: SystemSetting;
  onExplorePhotos: () => void;
  onOpenPrivateGalleryModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onExplorePhotos,
  onOpenPrivateGalleryModal,
}) => {
  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-end justify-center overflow-hidden">
      {/* Background Cover Image with subtle parallax feel */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroImageUrl}
          alt="hey Teddy, couverture"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-[1.05] transform scale-105"
        />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Deep Bottom Gradient (fades into black and then into the interface) */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 via-40% to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 text-center flex flex-col items-center">
        {/* Subtitle tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 mb-6 shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Plateforme & Galeries Privées</span>
        </motion.div>

        {/* Official Brand Name Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative inline-block mb-4"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-md">
            hey Teddy<span className="text-amber-400 font-black">,</span>
          </h1>

          {/* Signature Yellow Brush Underline */}
          <div className="relative mx-auto mt-2 w-3/4 max-w-[260px] h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-lg shadow-amber-400/50" />
        </motion.div>

        {/* Subtitle text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-neutral-200 font-medium max-w-2xl drop-shadow mb-8 sm:mb-10 leading-relaxed"
        >
          {settings.heroSubtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExplorePhotos}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm sm:text-base bg-amber-400 text-neutral-950 shadow-xl shadow-amber-400/30 hover:bg-amber-300 flex items-center justify-center gap-2 transition"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Explorer les clichés</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenPrivateGalleryModal}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-lg flex items-center justify-center gap-2 transition"
          >
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            <span>Accéder à ma galerie privée</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
