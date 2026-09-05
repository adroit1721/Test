import React from 'react';
import { motion } from 'motion/react';
import { ASSETS } from '../data/bnccData';
import { TabType } from '../types';
import { Shield, Sparkles } from 'lucide-react';

interface HeaderProps {
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
}) => {
  return (
    <header className="max-w-[1120px] mx-auto px-3 sm:px-4 w-full pt-2.5 pb-1">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#fcf9f3]/35 dark:bg-[#12110e]/35 backdrop-blur-2xl backdrop-saturate-180 border border-[#cdc6b3]/40 dark:border-white/10 rounded-2xl md:rounded-3xl py-2 px-3 sm:px-6 md:py-3 md:px-7 shadow-[0_4px_24px_0_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300 group"
      >
        {/* Subtle decorative background watermarks with gentle radiance */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 bg-[#eedc82]/15 dark:bg-[#eedc82]/5 rounded-full blur-2xl pointer-events-none animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-28 sm:h-28 bg-[#6b5e10]/10 dark:bg-[#6b5e10]/5 rounded-full blur-2xl pointer-events-none animate-float-reverse" />

        {/* 2 Side Logos with Centered Text */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 md:gap-6 relative z-10 pr-5 sm:pr-0">
          {/* Left Side Logo: New Govt Degree College */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="shrink-0 flex items-center"
          >
            <img
              src={ASSETS.ngdcLogo}
              alt="New Govt. Degree College Logo"
              onClick={onNavigateHome}
              className="h-8 sm:h-11 md:h-13 w-auto object-contain cursor-pointer drop-shadow-xs filter transition-opacity hover:opacity-95"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Centered Text Column with entrance bounce and hover interaction */}
          <motion.div
            onClick={onNavigateHome}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0 text-center cursor-pointer select-none px-1 sm:px-4"
          >
            <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight uppercase leading-none font-sans drop-shadow-2xs">
              NGDC-BNCC
            </h1>

            <p className="text-[7.5px] min-[360px]:text-[8.5px] min-[400px]:text-[9.5px] sm:text-xs md:text-sm font-medium text-[#695c4e] dark:text-[#aca596] tracking-normal mt-0.5 sm:mt-1 flex items-center justify-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
              <span>New Govt. Degree College, Rajshahi BNCC Platoon</span>
            </p>
          </motion.div>

          {/* Right Side Logo: BNCC */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="shrink-0 flex items-center"
          >
            <img
              src={ASSETS.bnccLogo}
              alt="Bangladesh National Cadet Corps Logo"
              onClick={onNavigateHome}
              className="h-8 sm:h-11 md:h-13 w-auto object-contain cursor-pointer drop-shadow-xs filter transition-opacity hover:opacity-95"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
};

