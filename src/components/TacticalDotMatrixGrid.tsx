import React from 'react';

interface TacticalDotMatrixGridProps {
  className?: string;
}

export const TacticalDotMatrixGrid: React.FC<TacticalDotMatrixGridProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-3xl select-none z-0 ${className}`}
    >
      {/* 1. Tactical Blueprint Coordinate HUD Border & Technical Ticks */}
      <div className="absolute inset-0 border border-[#6b5e10]/15 dark:border-[#eedc82]/20 rounded-3xl" />
      
      {/* Precision Corner HUD Bracket Accents */}
      {/* Top Left */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#6b5e10]/40 dark:border-[#eedc82]/60 rounded-tl-sm pointer-events-none" />
      {/* Top Right */}
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#6b5e10]/40 dark:border-[#eedc82]/60 rounded-tr-sm pointer-events-none" />
      {/* Bottom Left */}
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#6b5e10]/40 dark:border-[#eedc82]/60 rounded-bl-sm pointer-events-none" />
      {/* Bottom Right */}
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#6b5e10]/40 dark:border-[#eedc82]/60 rounded-br-sm pointer-events-none" />

      {/* Military Cadence / Spec Coordinate Badges */}
      <div className="absolute top-2.5 left-8 flex items-center gap-2 opacity-50 dark:opacity-60 text-[9px] font-mono tracking-widest text-[#6b5e10] dark:text-[#eedc82]">
        <span>BNCC-SYS//GRID.886</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">RAJSHAHI SECTOR</span>
      </div>

      <div className="absolute top-2.5 right-8 flex items-center gap-2 opacity-50 dark:opacity-60 text-[9px] font-mono tracking-widest text-[#6b5e10] dark:text-[#eedc82]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
        <span className="font-bold">LIVE TELEMETRY</span>
      </div>

      {/* Bottom Technical Scale */}
      <div className="absolute bottom-2.5 left-8 flex items-center gap-3 opacity-40 dark:opacity-50 text-[8px] font-mono text-[#6b5e10] dark:text-[#eedc82]">
        <span>SCALE: 1:25,000</span>
        <div className="w-12 h-1 border-b border-t border-current flex">
          <div className="w-1/2 bg-current opacity-60 h-full" />
        </div>
        <span>COORD: 24°22'N 88°36'E</span>
      </div>

      {/* 2. SVG Pattern: Dual-Layer Tactical Dot Matrix + Blueprint Cadence Grid */}
      <svg
        className="absolute inset-0 w-full h-full text-[#6b5e10] dark:text-[#eedc82] transition-opacity duration-500"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Base Tactical Dot Pattern (6px dot spacing) */}
          <pattern
            id="tactical-dot-matrix"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            {/* Fine Dot */}
            <circle cx="12" cy="12" r="1.1" fill="currentColor" className="opacity-20 dark:opacity-25" />
            <circle cx="0" cy="0" r="0.75" fill="currentColor" className="opacity-12 dark:opacity-15" />
            <circle cx="24" cy="0" r="0.75" fill="currentColor" className="opacity-12 dark:opacity-15" />
            <circle cx="0" cy="24" r="0.75" fill="currentColor" className="opacity-12 dark:opacity-15" />
            <circle cx="24" cy="24" r="0.75" fill="currentColor" className="opacity-12 dark:opacity-15" />
          </pattern>

          {/* Blueprint Engineering Major Grid (120px) */}
          <pattern
            id="tactical-blueprint-grid"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            {/* Major Line Grid */}
            <path
              d="M 96 0 L 0 0 0 96"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="opacity-15 dark:opacity-20"
            />
            
            {/* Minor Subdivision Grid */}
            <path
              d="M 48 0 L 48 96 M 0 48 L 96 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2,4"
              className="opacity-10 dark:opacity-15"
            />

            {/* Tactical Grid Crosshairs Intersection */}
            <path
              d="M 48 44 L 48 52 M 44 48 L 52 48"
              stroke="currentColor"
              strokeWidth="1.2"
              className="opacity-35 dark:opacity-45"
            />
            <path
              d="M 0 0 L 0 5 M 0 0 L 5 0 M 96 0 L 91 0 M 96 96 L 91 96 M 96 96 L 96 91"
              stroke="currentColor"
              strokeWidth="1"
              className="opacity-30 dark:opacity-40"
            />
          </pattern>

          {/* Diagonal Radar Sweeping Gradient */}
          <linearGradient id="blueprint-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.02" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.10" />
          </linearGradient>
        </defs>

        {/* Render Grid Layers */}
        <rect width="100%" height="100%" fill="url(#tactical-dot-matrix)" />
        <rect width="100%" height="100%" fill="url(#tactical-blueprint-grid)" />
        <rect width="100%" height="100%" fill="url(#blueprint-glow-grad)" />

        {/* Central Tactical Target Reticle Overlay */}
        <g transform="translate(60, 60)" className="opacity-25 dark:opacity-35">
          <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4,4" />
          <circle cx="0" cy="0" r="14" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <line x1="-34" y1="0" x2="34" y2="0" stroke="currentColor" strokeWidth="0.8" />
          <line x1="0" y1="-34" x2="0" y2="34" stroke="currentColor" strokeWidth="0.8" />
        </g>
      </svg>

      {/* 3. Blueprint Corner Radial Illuminations */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#eedc82]/15 dark:bg-[#eedc82]/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#1b4332]/15 dark:bg-[#1b4332]/25 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
