import React from 'react';

interface TopographicBackgroundProps {
  isDarkMode?: boolean;
}

export const TopographicBackground: React.FC<TopographicBackgroundProps> = ({ isDarkMode = false }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Base Ambient Twilight Glow Orbs */}
      <div className="absolute inset-0 transition-opacity duration-700">
        {/* Top-Right Twilight Golden Amber Glow */}
        <div
          className={`absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-[130px] transition-all duration-700 ${
            isDarkMode
              ? 'bg-[#eedc82]/[0.07] animate-twilight-float-1'
              : 'bg-[#eedc82]/25 animate-twilight-float-1'
          }`}
        />

        {/* Top-Left Tactical Emerald / Forest Glow */}
        <div
          className={`absolute top-20 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-700 ${
            isDarkMode
              ? 'bg-[#1b4332]/25 animate-twilight-float-2'
              : 'bg-[#2d6a4f]/10 animate-twilight-float-2'
          }`}
        />

        {/* Mid-Right BNCC Crimson/Warm Ruby Ambient Hue */}
        <div
          className={`absolute top-[45%] -right-40 w-[480px] h-[480px] rounded-full blur-[140px] transition-all duration-700 ${
            isDarkMode
              ? 'bg-[#800f2f]/12 animate-twilight-pulse'
              : 'bg-[#b02a37]/8 animate-twilight-pulse'
          }`}
        />

        {/* Bottom-Left Deep Twilight Olive/Gold Glow */}
        <div
          className={`absolute -bottom-24 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-700 ${
            isDarkMode
              ? 'bg-[#eedc82]/[0.05] animate-twilight-float-1'
              : 'bg-[#eedc82]/20 animate-twilight-float-1'
          }`}
        />

        {/* Center-Bottom Deep Horizon Mesh */}
        <div
          className={`absolute bottom-10 right-[15%] w-[450px] h-[450px] rounded-full blur-[130px] transition-all duration-700 ${
            isDarkMode
              ? 'bg-[#1b4332]/20 animate-twilight-float-2'
              : 'bg-[#386641]/8 animate-twilight-float-2'
          }`}
        />
      </div>

      {/* 2. Precision Topographic Contour Lines SVG Pattern Layer */}
      <svg
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isDarkMode ? 'opacity-35 text-[#eedc82]' : 'opacity-40 text-[#6b5e10]'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="topographic-contours-pattern"
            width="800"
            height="800"
            patternUnits="userSpaceOnUse"
          >
            {/* Elevation Contour Lines (Major & Minor Isolines) */}
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              {/* Index Contour 1 (Thicker) */}
              <path
                d="M-50,150 C120,100 250,220 400,160 C550,100 680,240 850,180"
                strokeWidth="1.1"
                strokeOpacity={isDarkMode ? "0.22" : "0.18"}
              />
              <path
                d="M-50,170 C130,120 260,240 410,180 C560,120 690,260 850,200"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M-50,190 C140,140 270,260 420,200 C570,140 700,280 850,220"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M-50,210 C150,160 280,280 430,220 C580,160 710,300 850,240"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M-50,230 C160,180 290,300 440,240 C590,180 720,320 850,260"
                strokeWidth="1.1"
                strokeOpacity={isDarkMode ? "0.22" : "0.18"}
              />

              {/* Hill / Peak Elevation Concentric Contours (Tactical Topo Feature) */}
              {/* Feature A: Top-Right Ridge */}
              <path
                d="M620,120 C680,80 760,100 780,160 C800,220 740,280 660,260 C580,240 560,160 620,120 Z"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M640,140 C680,110 740,120 750,170 C760,210 720,250 670,235 C620,220 600,170 640,140 Z"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M660,158 C690,135 725,142 730,175 C735,200 705,225 680,215 C650,205 635,180 660,158 Z"
                strokeWidth="1.1"
                strokeOpacity={isDarkMode ? "0.22" : "0.18"}
              />

              {/* Feature B: Lower-Left Basin & Spur */}
              <path
                d="M50,520 C180,480 240,620 380,590 C500,560 580,680 720,640 C800,620 840,680 880,720"
                strokeWidth="1.1"
                strokeOpacity={isDarkMode ? "0.22" : "0.18"}
              />
              <path
                d="M40,540 C170,500 230,640 370,610 C490,580 570,700 710,660 C790,640 830,700 880,740"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M30,560 C160,520 220,660 360,630 C480,600 560,720 700,680 C780,660 820,720 880,760"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M20,580 C150,540 210,680 350,650 C470,620 550,740 690,700 C770,680 810,740 880,780"
                strokeWidth="0.6"
                strokeOpacity={isDarkMode ? "0.14" : "0.10"}
              />
              <path
                d="M10,600 C140,560 200,700 340,670 C460,640 540,760 680,720 C760,700 800,760 880,800"
                strokeWidth="1.1"
                strokeOpacity={isDarkMode ? "0.22" : "0.18"}
              />

              {/* Feature C: Valley Meander */}
              <path
                d="M-50,380 C120,420 260,320 400,380 C540,440 660,340 850,400"
                strokeWidth="0.6"
                strokeDasharray="4,4"
                strokeOpacity={isDarkMode ? "0.15" : "0.12"}
              />
            </g>

            {/* Tactical Survey Crosshairs / Grid Registration Marks */}
            <g
              stroke="currentColor"
              strokeWidth="0.8"
              strokeOpacity={isDarkMode ? "0.20" : "0.15"}
            >
              <path d="M 200,195 L 200,205 M 195,200 L 205,200" />
              <path d="M 600,195 L 600,205 M 595,200 L 605,200" />
              <path d="M 200,595 L 200,605 M 195,600 L 205,600" />
              <path d="M 600,595 L 600,605 M 595,600 L 605,600" />
            </g>

            {/* Subtle Topographic Elevation Text Tags (Rajshahi Field Area Coordinates) */}
            <text
              x="215"
              y="204"
              fill="currentColor"
              fillOpacity={isDarkMode ? "0.22" : "0.18"}
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.05em"
            >
              + 24.37° N
            </text>
            <text
              x="615"
              y="204"
              fill="currentColor"
              fillOpacity={isDarkMode ? "0.22" : "0.18"}
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.05em"
            >
              + 88.60° E
            </text>
            <text
              x="445"
              y="236"
              fill="currentColor"
              fillOpacity={isDarkMode ? "0.24" : "0.18"}
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="600"
            >
              42m
            </text>
            <text
              x="345"
              y="666"
              fill="currentColor"
              fillOpacity={isDarkMode ? "0.24" : "0.18"}
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="600"
            >
              28m
            </text>
            <text
              x="665"
              y="154"
              fill="currentColor"
              fillOpacity={isDarkMode ? "0.24" : "0.18"}
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="600"
            >
              56m PEAK
            </text>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#topographic-contours-pattern)" />
      </svg>

      {/* 3. Subtle Vignette Edge Mask to keep center reading area pristine */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDarkMode
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(14,13,11,0.6)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(246,243,237,0.5)_100%)]'
        }`}
      />
    </div>
  );
};
