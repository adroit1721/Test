import React, { useState, useMemo } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Shield, Music, User, ZoomIn, ZoomOut, RotateCcw, Award, Phone, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CadetUserAccount } from '../types';

export interface DisplayCadetNode {
  id?: string;
  rank: string;
  role?: string;
  name: string;
  cadetNo?: string;
  avatarUrl?: string;
  gender?: string;
  isOptional?: boolean;
  isVacant?: boolean;
  department?: string;
  batch?: string;
  bloodGroup?: string;
  status?: string;
  phone?: string;
  collegeId?: string;
  section?: string;
  appointment?: string;
}

interface HierarchyCardProps {
  cadet: DisplayCadetNode | null | undefined;
  defaultRank: string;
  defaultRole?: string;
  isOptional?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClick: (cadet: DisplayCadetNode | null) => void;
}

// =========================================================================
// HIERARCHY CADET CARD COMPONENT
// Styled to match the website's Japandi warm-neutral theme (cream / gold / charcoal)
// Hierarchy order: 1. Nice Picture -> 2. Rank -> 3. Name -> 4. Subtitle/ID
// =========================================================================
const HierarchyCadetCard: React.FC<HierarchyCardProps> = ({
  cadet,
  defaultRank,
  defaultRole,
  isOptional = false,
  size = 'md',
  icon,
  onClick,
}) => {
  const isVacant = !cadet || cadet.isVacant;
  const displayName = !isVacant ? cadet.name : '— Empty —';
  const displayRank = !isVacant ? cadet.rank : defaultRank;
  const displaySubtitle = !isVacant
    ? cadet.cadetNo || cadet.appointment || defaultRole
    : isOptional
    ? 'Optional (Empty)'
    : 'Vacant (Empty)';

  // 1. SMALL CARD (for Cadets inside sections)
  if (size === 'sm') {
    return (
      <div
        onClick={() => {
          if (cadet && !cadet.isVacant) onClick(cadet);
        }}
        title={!isVacant ? `${cadet.rank}: ${cadet.name} (${cadet.cadetNo || ''})` : `${defaultRank} (Unassigned)`}
        className={`w-full p-2 rounded-xl text-center flex flex-col items-center justify-center select-none transition-all duration-200 ${
          !isVacant
            ? 'bg-gradient-to-b from-[#f3eadc] via-[#ede3d2] to-[#e3d5bf] dark:from-[#26231c] dark:via-[#201d17] dark:to-[#1a1813] border border-[#c1b196] dark:border-[#423b2e] shadow-[0_2px_6px_rgba(40,32,15,0.06)] hover:shadow-[0_6px_16px_-3px_rgba(107,94,16,0.22)] hover:border-[#d4c16a] hover:-translate-y-0.5 cursor-pointer group'
            : 'border border-dashed border-[#beaf95] dark:border-[#383329] bg-[#e6dcce]/40 dark:bg-[#161411]/60 text-[#7c7767] dark:text-[#8c8577] cursor-default'
        }`}
      >
        {/* 1. Picture */}
        <div className="relative mb-1.5 shrink-0">
          {!isVacant && cadet?.avatarUrl ? (
            <img
              src={cadet.avatarUrl}
              alt={cadet.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#d8c360] shadow-2xs group-hover:scale-105 transition-transform bg-[#ded2be] dark:bg-[#1a1813]"
            />
          ) : !isVacant ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ebd676]/40 to-[#ebd676]/20 dark:from-[#ebd676]/20 dark:to-[#ebd676]/5 border border-[#d8c360] flex items-center justify-center text-[10px] font-black text-[#504205] dark:text-[#eedc82]">
              {cadet?.bloodGroup || <User className="w-4 h-4" />}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl border border-dashed border-[#beaf95] dark:border-[#444] bg-[#ded2be]/30 dark:bg-white/5 flex items-center justify-center text-[#9c9586]">
              <User className="w-4 h-4 opacity-40" />
            </div>
          )}
        </div>

        {/* 2. Rank */}
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-[#ebd676] via-[#f7e899] to-[#ebd676] text-[#423705] dark:from-[#3a3212] dark:via-[#4d4218] dark:to-[#3a3212] dark:text-[#eedc82] border border-[#cfb84f] dark:border-[#eedc82]/40 shadow-2xs line-clamp-1">
          {displayRank}
        </span>

        {/* 3. Name */}
        <div
          className={`text-[11px] leading-tight font-black line-clamp-1 mt-1 w-full tracking-tight ${
            !isVacant ? 'text-[#1c1c18] dark:text-[#fcfbf7]' : 'text-[#8c8577] dark:text-[#777] italic'
          }`}
        >
          {displayName}
        </div>

        {/* 4. Subtitle / ID */}
        <div className="text-[8px] font-mono font-semibold text-[#5d5242] dark:text-[#b8af9e] truncate mt-0.5 w-full">
          {displaySubtitle}
        </div>
      </div>
    );
  }

  // 2. MEDIUM CARD (Corporals & Lance Corporals)
  if (size === 'md') {
    return (
      <div
        onClick={() => {
          if (cadet && !cadet.isVacant) onClick(cadet);
        }}
        className={`w-full max-w-[210px] p-2.5 rounded-2xl text-center flex flex-col items-center justify-center select-none transition-all duration-200 ${
          !isVacant
            ? 'bg-gradient-to-b from-[#f4ebde] via-[#ede3d1] to-[#e2d4bd] dark:from-[#27231c] dark:via-[#211e17] dark:to-[#1a1813] border border-[#beaf93] dark:border-[#453d30] shadow-[0_3px_10px_rgba(40,32,15,0.08)] hover:shadow-[0_8px_20px_-4px_rgba(107,94,16,0.24)] hover:border-[#d4c16a] hover:-translate-y-0.5 cursor-pointer group'
            : 'border-2 border-dashed border-[#beaf95] dark:border-[#383329] bg-[#e6dcce]/50 dark:bg-[#161411]/60 text-[#7c7767] dark:text-[#8c8577] cursor-default'
        }`}
      >
        {/* Top Metallic Accent Pip */}
        {!isVacant && (
          <div className="w-6 h-0.5 bg-[#cbb34c]/70 dark:bg-[#eedc82]/50 rounded-full mb-1 opacity-80 group-hover:w-10 transition-all duration-200" />
        )}

        {/* 1. Picture */}
        <div className="relative mb-2 shrink-0">
          {!isVacant && cadet?.avatarUrl ? (
            <img
              src={cadet.avatarUrl}
              alt={cadet.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border-2 border-[#d8c360] shadow-xs group-hover:scale-105 transition-transform bg-[#ded2be] dark:bg-[#1a1813]"
            />
          ) : !isVacant ? (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ebd676]/40 to-[#ebd676]/20 dark:from-[#ebd676]/20 dark:to-[#ebd676]/5 border-2 border-[#d8c360] flex items-center justify-center text-xs font-black text-[#504205] dark:text-[#eedc82]">
              {cadet?.bloodGroup || <User className="w-5 h-5" />}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl border border-dashed border-[#beaf95] dark:border-[#444] bg-[#ded2be]/30 dark:bg-white/5 flex items-center justify-center text-[#9c9586]">
              <User className="w-5 h-5 opacity-40" />
            </div>
          )}
        </div>

        {/* 2. Rank */}
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#ebd676] via-[#f7e899] to-[#ebd676] text-[#3d3203] dark:from-[#3a3212] dark:via-[#4d4218] dark:to-[#3a3212] dark:text-[#eedc82] border border-[#cfb84f] dark:border-[#eedc82]/40 shadow-2xs line-clamp-1">
          {displayRank}
        </span>

        {/* 3. Name */}
        <div
          className={`text-xs font-black leading-tight line-clamp-1 mt-1 w-full tracking-tight ${
            !isVacant ? 'text-[#1c1c18] dark:text-[#fcfbf7]' : 'text-[#8c8577] dark:text-[#777] italic'
          }`}
        >
          {displayName}
        </div>

        {/* 4. Subtitle / Designation */}
        <div className="text-[9px] font-mono font-bold text-[#5d5242] dark:text-[#b8af9e] truncate mt-0.5 w-full">
          {displaySubtitle}
        </div>
      </div>
    );
  }

  // 3. LARGE CARD (CUO & Cadet Seargent)
  return (
    <div
      onClick={() => {
        if (cadet && !cadet.isVacant) onClick(cadet);
      }}
      className={`w-full max-w-[240px] p-3 rounded-2xl text-center flex flex-col items-center justify-center select-none transition-all duration-200 ${
        !isVacant
          ? 'bg-gradient-to-b from-[#f5ede0] via-[#ede3d1] to-[#e1d2ba] dark:from-[#29251e] dark:via-[#221f18] dark:to-[#1b1913] border-2 border-[#bfae91] dark:border-[#4a4233] shadow-[0_4px_14px_rgba(40,32,15,0.1)] hover:shadow-[0_12px_28px_-5px_rgba(107,94,16,0.26)] hover:border-[#eedc82] hover:-translate-y-1 cursor-pointer group'
          : isOptional
          ? 'border-2 border-dashed border-[#eedc82]/80 bg-[#eedc82]/10 dark:bg-[#eedc82]/5 text-[#6b5e10] dark:text-[#eedc82] cursor-default'
          : 'border-2 border-dashed border-[#beaf95] dark:border-[#444036] bg-[#e6dcce]/50 dark:bg-[#181714]/60 text-[#7c7767] dark:text-[#8c8577] cursor-default'
      }`}
    >
      {/* Top Command Gold Accent */}
      {!isVacant && (
        <div className="w-10 h-1 bg-gradient-to-r from-transparent via-[#d8c360] to-transparent rounded-full mb-1.5 opacity-80 group-hover:w-16 transition-all duration-300" />
      )}

      {/* 1. Picture */}
      <div className="relative mb-2 shrink-0">
        {!isVacant && cadet?.avatarUrl ? (
          <img
            src={cadet.avatarUrl}
            alt={cadet.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d8c360] shadow-sm group-hover:scale-105 transition-transform bg-[#ded2be] dark:bg-[#1a1813]"
          />
        ) : !isVacant ? (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ebd676]/40 to-[#ebd676]/20 dark:from-[#ebd676]/20 dark:to-[#ebd676]/5 border-2 border-[#d8c360] flex items-center justify-center text-sm font-black text-[#504205] dark:text-[#eedc82]">
            {cadet?.bloodGroup || <User className="w-6 h-6" />}
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#beaf95] dark:border-[#444] bg-[#ded2be]/30 dark:bg-white/5 flex items-center justify-center text-[#9c9586]">
            {icon || <User className="w-6 h-6 opacity-40" />}
          </div>
        )}
      </div>

      {/* 2. Rank */}
      <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-[#e8d474] via-[#f9ea9d] to-[#e8d474] text-[#3d3203] dark:from-[#3d3412] dark:via-[#524619] dark:to-[#3d3412] dark:text-[#eedc82] border border-[#cfb84f] dark:border-[#eedc82]/40 shadow-2xs line-clamp-1">
        {displayRank}
      </span>

      {/* 3. Name */}
      <div
        className={`text-xs sm:text-sm font-black leading-tight line-clamp-1 mt-1.5 w-full tracking-tight ${
          !isVacant ? 'text-[#1c1c18] dark:text-[#fcfbf7]' : 'text-[#8c8577] dark:text-[#777] italic'
        }`}
      >
        {displayName}
      </div>

      {/* 4. Subtitle */}
      <div className="text-[10px] font-mono font-bold text-[#5d5242] dark:text-[#b8af9e] truncate mt-0.5 w-full">
        {displaySubtitle}
      </div>
    </div>
  );
};

export const CadetRankHierarchyTree: React.FC = () => {
  const { cadetUsers } = useAdminData();

  // Active Category: Strictly these 3 tabs as requested
  const [activeTab, setActiveTab] = useState<'Male Platoon' | 'Female Platoon' | 'Band Platoon'>('Male Platoon');

  // Zoom / View scale controls for easy navigation on all device sizes
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [selectedCadet, setSelectedCadet] = useState<DisplayCadetNode | null>(null);

  // Active serving approved cadets from Admin Context (NO hardcoded demo fallbacks)
  const servingCadets = useMemo(() => {
    return cadetUsers.filter((c) => {
      if (!c) return false;
      const type = (c.cadetType || '').toLowerCase();
      const cat = (c.category || c.platoon || '').toLowerCase();
      const status = (c.status || '').toLowerCase();
      if (type.includes('ex') || cat.includes('ex') || status.includes('alumni')) {
        return false;
      }
      if (status.includes('pending') || c.isApproved === false) {
        return false;
      }
      return true;
    });
  }, [cadetUsers]);

  // Rank normalizers to match both official designations & variants entered by admin
  const normalize = (str?: string) => (str || '').toLowerCase().trim();

  const isCUO = (rank?: string) => {
    const r = normalize(rank);
    return r.includes('under officer') || r.includes('cuo');
  };

  const isSergeant = (rank?: string) => {
    const r = normalize(rank);
    if (isCUO(r)) return false;
    return r.includes('seargent') || r.includes('sergeant') || r.includes('sgt');
  };

  const isLanceCorporal = (rank?: string) => {
    const r = normalize(rank);
    return r.includes('lance') || r.includes('lcpl');
  };

  const isCorporal = (rank?: string) => {
    const r = normalize(rank);
    if (isLanceCorporal(r)) return false;
    return r.includes('corporal') || r.includes('cpl');
  };

  const isCadet = (rank?: string) => {
    const r = normalize(rank);
    if (isCUO(r) || isSergeant(r) || isCorporal(r) || isLanceCorporal(r)) {
      return false;
    }
    return true;
  };

  // Compute Active Platoon Hierarchy data dynamically matched strictly from the Cadet Users Database
  const platoonData = useMemo(() => {
    const platoonCadets = servingCadets.filter((c) => {
      const cat = (c.category || c.platoon || '').toLowerCase();
      const sec = (c.section || '').toLowerCase();
      if (activeTab === 'Male Platoon') {
        return (
          (!cat.includes('female') && (cat.includes('male') || c.gender === 'Male')) &&
          !cat.includes('band') &&
          !sec.includes('band')
        );
      }
      if (activeTab === 'Female Platoon') {
        return (
          cat.includes('female') ||
          (c.gender === 'Female' && !cat.includes('band') && !sec.includes('band'))
        );
      }
      if (activeTab === 'Band Platoon') {
        return cat.includes('band') || sec.includes('band');
      }
      return false;
    });

    const assignedIds = new Set<string>();

    // =========================================================================
    // 1. BAND PLATOON HIERARCHY
    // Structure:
    // - 01 Cadet Seargent (Head of Band Platoon)
    // - 02 Corporals
    // - 03 Lance Corporals (working for 3 sections)
    // - 09 Cadets divided into 3 sections (each section 3 cadets under 1 LCPL)
    // =========================================================================
    if (activeTab === 'Band Platoon') {
      // 1. Cadet Seargent (01 Head of Band)
      const sgtCandidate = platoonCadets.find((c) => isSergeant(c.rank) && !assignedIds.has(c.id));
      if (sgtCandidate) assignedIds.add(sgtCandidate.id);
      const sergeant: DisplayCadetNode | null = sgtCandidate
        ? {
            ...sgtCandidate,
            rank: sgtCandidate.rank || 'Cadet Seargent (SGT)',
            role: 'Head of Band Platoon',
          }
        : null;

      // 2. Corporals (02 Band Corporals)
      const cplCandidate1 = platoonCadets.find((c) => isCorporal(c.rank) && !assignedIds.has(c.id));
      if (cplCandidate1) assignedIds.add(cplCandidate1.id);
      const corporal1: DisplayCadetNode | null = cplCandidate1
        ? {
            ...cplCandidate1,
            rank: cplCandidate1.rank || 'Cadet Corporal (CPL)',
            role: 'Band Section Senior NCO',
          }
        : null;

      const cplCandidate2 = platoonCadets.find((c) => isCorporal(c.rank) && !assignedIds.has(c.id));
      if (cplCandidate2) assignedIds.add(cplCandidate2.id);
      const corporal2: DisplayCadetNode | null = cplCandidate2
        ? {
            ...cplCandidate2,
            rank: cplCandidate2.rank || 'Cadet Corporal (CPL)',
            role: 'Band Section Senior NCO',
          }
        : null;

      // 3. 3 Sections: Section 01, Section 02, Section 03
      const bandSectionsConfig = [
        { secCode: '01', title: 'Band Section 01', instrumentType: 'Brass & Bugle' },
        { secCode: '02', title: 'Band Section 02', instrumentType: 'Drum & Percussion' },
        { secCode: '03', title: 'Band Section 03', instrumentType: 'Flute & Instrumental' },
      ];

      // Match LCPLs for each band section
      const bandLCPLs = bandSectionsConfig.map((sec) => {
        const matched =
          platoonCadets.find(
            (c) =>
              isLanceCorporal(c.rank) &&
              !assignedIds.has(c.id) &&
              (c.section === sec.title || (c.section && c.section.includes(sec.secCode)))
          ) || platoonCadets.find((c) => isLanceCorporal(c.rank) && !assignedIds.has(c.id));

        if (matched) assignedIds.add(matched.id);
        return matched
          ? {
              ...matched,
              rank: matched.rank || 'Cadet Lance Corporal (LCPL)',
              role: `${sec.title} Leader`,
            }
          : null;
      });

      // Cadets for Band
      const bandCadetBuckets: DisplayCadetNode[][] = bandSectionsConfig.map(() => []);

      // 1st pass: match specific section
      bandSectionsConfig.forEach((sec, sIdx) => {
        const secCadets = platoonCadets.filter(
          (c) =>
            isCadet(c.rank) &&
            !assignedIds.has(c.id) &&
            (c.section === sec.title || (c.section && c.section.includes(sec.secCode)))
        );
        for (const m of secCadets) {
          assignedIds.add(m.id);
          bandCadetBuckets[sIdx].push({
            ...m,
            rank: m.rank || 'Cadet (CDT)',
            role: `${sec.title} Musician`,
          });
        }
      });

      // 2nd pass: distribute ALL remaining unassigned band cadets
      const remainingBandCadets = platoonCadets.filter((c) => !assignedIds.has(c.id));
      for (const m of remainingBandCadets) {
        assignedIds.add(m.id);
        let minIdx = 0;
        for (let i = 1; i < bandCadetBuckets.length; i++) {
          if (bandCadetBuckets[i].length < bandCadetBuckets[minIdx].length) {
            minIdx = i;
          }
        }
        bandCadetBuckets[minIdx].push({
          ...m,
          rank: m.rank || 'Cadet (CDT)',
          role: m.appointment || `${bandSectionsConfig[minIdx].title} Musician`,
        });
      }

      const sections = bandSectionsConfig.map((sec, idx) => {
        const lcplNode = bandLCPLs[idx];
        const assignedList = bandCadetBuckets[idx];
        const slotCount = Math.max(3, assignedList.length);

        const cadets: (DisplayCadetNode | null)[] = Array.from({ length: slotCount }).map((_, cIdx) => {
          const matched = assignedList[cIdx];
          if (matched) {
            return {
              ...matched,
              role: `${sec.title} Musician ${cIdx + 1}`,
            };
          }
          return null;
        });

        return {
          num: sec.secCode,
          title: sec.title,
          instrumentType: sec.instrumentType,
          lcpl: lcplNode,
          cadets,
        };
      });

      return {
        isBand: true,
        sergeant,
        corporals: [corporal1, corporal2],
        sections,
      };
    }

    // =========================================================================
    // 2. MALE & FEMALE PLATOON HIERARCHY
    // Structure:
    // - Top: Optional CUO (Cadet Under Officer) - filled if present, blank if not
    // - Cadet Seargent (Platoon 2IC)
    // - 3 Sections (Section 01, Section 02, Section 03)
    //   Each Section has:
    //   - 1 Cadet Corporal (Section Commander)
    //   - 1 Cadet Lance Corporal (Section 2IC)
    //   - 8 Cadets (Vertically aligned)
    // =========================================================================

    // CUO Matching (Optional rank)
    const cuoMatch = platoonCadets.find((c) => isCUO(c.rank) && !assignedIds.has(c.id));
    if (cuoMatch) assignedIds.add(cuoMatch.id);
    const cuo: DisplayCadetNode | null = cuoMatch
      ? {
          ...cuoMatch,
          rank: cuoMatch.rank || 'Cadet Under Officer (CUO)',
          role: 'Platoon Cadet Commander',
        }
      : null;

    // Cadet Seargent Matching (Platoon 2IC)
    const sgtMatch = platoonCadets.find((c) => isSergeant(c.rank) && !assignedIds.has(c.id));
    if (sgtMatch) assignedIds.add(sgtMatch.id);
    const sgt: DisplayCadetNode | null = sgtMatch
      ? {
          ...sgtMatch,
          rank: sgtMatch.rank || 'Cadet Seargent (SGT)',
          role: 'Platoon 2IC & Senior Drill Commander',
        }
      : null;

    // 3 Sections Config
    const sectionsConfig = [
      { num: '01', title: 'Section 01' },
      { num: '02', title: 'Section 02' },
      { num: '03', title: 'Section 03' },
    ];

    // For each section, find matching Corporal or first unassigned Corporal
    const sectionCpls = sectionsConfig.map((sec) => {
      const matched =
        platoonCadets.find(
          (c) =>
            isCorporal(c.rank) &&
            !assignedIds.has(c.id) &&
            (c.section === sec.title || (c.section && c.section.includes(sec.num)))
        ) || platoonCadets.find((c) => isCorporal(c.rank) && !assignedIds.has(c.id));

      if (matched) assignedIds.add(matched.id);
      return matched
        ? {
            ...matched,
            rank: matched.rank || 'Cadet Corporal (CPL)',
            role: `${sec.title} Commander`,
          }
        : null;
    });

    // For each section, find matching LCPL or first unassigned LCPL
    const sectionLCPLs = sectionsConfig.map((sec) => {
      const matched =
        platoonCadets.find(
          (c) =>
            isLanceCorporal(c.rank) &&
            !assignedIds.has(c.id) &&
            (c.section === sec.title || (c.section && c.section.includes(sec.num)))
        ) || platoonCadets.find((c) => isLanceCorporal(c.rank) && !assignedIds.has(c.id));

      if (matched) assignedIds.add(matched.id);
      return matched
        ? {
            ...matched,
            rank: matched.rank || 'Cadet Lance Corporal (LCPL)',
            role: `${sec.title} 2IC`,
          }
        : null;
    });

    // Distribute Cadets
    const sectionCadetBuckets: DisplayCadetNode[][] = sectionsConfig.map(() => []);

    // 1st pass: cadets who specifically match section title or section number
    sectionsConfig.forEach((sec, sIdx) => {
      const matchedCadets = platoonCadets.filter(
        (c) =>
          isCadet(c.rank) &&
          !assignedIds.has(c.id) &&
          (c.section === sec.title || (c.section && c.section.includes(sec.num)))
      );
      for (const m of matchedCadets) {
        assignedIds.add(m.id);
        sectionCadetBuckets[sIdx].push({
          ...m,
          rank: m.rank || 'Cadet (CDT)',
          role: `${sec.title} Cadet`,
        });
      }
    });

    // 2nd pass: distribute ALL remaining unassigned cadets into sections
    const remainingCadets = platoonCadets.filter((c) => !assignedIds.has(c.id));
    for (const m of remainingCadets) {
      assignedIds.add(m.id);
      let minIdx = 0;
      for (let i = 1; i < sectionCadetBuckets.length; i++) {
        if (sectionCadetBuckets[i].length < sectionCadetBuckets[minIdx].length) {
          minIdx = i;
        }
      }
      sectionCadetBuckets[minIdx].push({
        ...m,
        rank: m.rank || 'Cadet (CDT)',
        role: m.appointment || `${sectionsConfig[minIdx].title} Cadet`,
      });
    }

    // Up to 8 slots per section (or more if section has more than 8 cadets)
    const sections = sectionsConfig.map((sec, secIdx) => {
      const cpl = sectionCpls[secIdx];
      const lcpl = sectionLCPLs[secIdx];
      const assignedList = sectionCadetBuckets[secIdx];

      const slotCount = Math.max(8, assignedList.length);
      const cadets: (DisplayCadetNode | null)[] = Array.from({ length: slotCount }).map((_, cdtIdx) => {
        const item = assignedList[cdtIdx];
        if (item) {
          return {
            ...item,
            role: `${sec.title} Rifleman ${cdtIdx + 1}`,
          };
        }
        return null;
      });

      return {
        num: sec.num,
        title: sec.title,
        cpl,
        lcpl,
        cadets,
      };
    });

    return {
      isBand: false,
      cuo,
      sgt,
      sections,
    };
  }, [servingCadets, activeTab]);

  const totalServingInPlatoon = useMemo(() => {
    return servingCadets.filter((c) => {
      const cat = (c.category || c.platoon || '').toLowerCase();
      const sec = (c.section || '').toLowerCase();
      if (activeTab === 'Male Platoon') {
        return (
          (!cat.includes('female') && (cat.includes('male') || c.gender === 'Male')) &&
          !cat.includes('band') &&
          !sec.includes('band')
        );
      }
      if (activeTab === 'Female Platoon') {
        return (
          cat.includes('female') ||
          (c.gender === 'Female' && !cat.includes('band') && !sec.includes('band'))
        );
      }
      if (activeTab === 'Band Platoon') {
        return cat.includes('band') || sec.includes('band');
      }
      return false;
    }).length;
  }, [servingCadets, activeTab]);

  return (
    <div className="space-y-6 w-full">
      {/* =========================================================================
          TAB NAVIGATION & CONTROLS
          Strictly 3 tabs as requested: Male Platoon, Female Platoon, Band Platoon
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-2.5 sm:p-3 rounded-2xl border border-[#cdc6b3]/60 dark:border-[#38352d]">
        {/* 3 Platoon Selection Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f6f3ed] dark:bg-[#141311] rounded-xl border border-[#cdc6b3]/50 dark:border-[#38352d] w-full sm:w-auto">
          {(['Male Platoon', 'Female Platoon', 'Band Platoon'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#1c1c18] shadow-xs'
                    : 'text-[#504537] dark:text-[#aca596] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab === 'Band Platoon' ? <Music className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* View Details & Zoom Controls */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] text-[#7c7767] dark:text-[#aca596] hidden md:inline">
            Click any active card to view profile
          </span>
          <div className="flex items-center gap-1 bg-[#f6f3ed] dark:bg-[#141311] p-1 rounded-xl border border-[#cdc6b3]/50 dark:border-[#38352d]">
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10))}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[#494437] dark:text-[#aca596] transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-[#1c1c18] dark:text-[#fcfbf7] min-w-[42px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(1.2, Math.round((prev + 0.1) * 10) / 10))}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[#494437] dark:text-[#aca596] transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(1)}
              title="Reset Zoom"
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[#494437] dark:text-[#aca596] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notice if Platoon currently has 0 registered cadets */}
      {totalServingInPlatoon === 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f6f3ed] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] text-xs text-[#504537] dark:text-[#aca596]">
          <AlertCircle className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
          <span>
            <strong>Cadet Directory is clean & empty:</strong> Slots below are displayed as unassigned. Platoon administrators can register and assign cadets under <em>Admin &gt; Cadet Corner</em> to populate this hierarchy.
          </span>
        </div>
      )}

      {/* =========================================================================
          MAIN HIERARCHY TREE CANVAS
          Tactical command layout for cadets, warm Japandi palette (gold accents, neutral borders)
          ========================================================================= */}
      <div className="relative bg-gradient-to-b from-[#f8f5ee] via-[#f5f0e6] to-[#efe9dc] dark:from-[#1b1915] dark:via-[#161512] dark:to-[#11100e] p-4 sm:p-6 md:p-9 rounded-3xl border border-[#cdc6b3] dark:border-[#3d392f] shadow-xs overflow-hidden">
        {/* Subtle Tactical Blueprint Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.42] dark:opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#b8b09d 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Ambient Top Command Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#eedc82]/10 dark:bg-[#eedc82]/5 blur-2xl pointer-events-none" />

        {/* Tactical Corner Marks */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#b8b09d] dark:border-[#4a4539] pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#b8b09d] dark:border-[#4a4539] pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#b8b09d] dark:border-[#4a4539] pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#b8b09d] dark:border-[#4a4539] pointer-events-none" />

        {/* Watermark Command Indicator */}
        <div className="absolute top-3.5 right-6 hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f4eee3]/80 dark:bg-[#1e1d19]/80 border border-[#cdc6b3]/70 dark:border-[#38352d] text-[9px] font-mono font-bold uppercase tracking-wider text-[#695c4e] dark:text-[#eedc82] backdrop-blur-xs select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6b5e10] dark:bg-[#eedc82] animate-pulse" />
          <span>Cadet Command Hierarchy</span>
        </div>

        {/* Scrollable Canvas container */}
        <div className="overflow-x-auto pb-6 pt-2 select-none scrollbar-thin scrollbar-thumb-[#cdc6b3] dark:scrollbar-thumb-[#444]">
          <div
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 ease-out inline-block min-w-max mx-auto px-4 w-full flex flex-col items-center"
          >
            {/* ===================================================================
               BRANCH A: MALE & FEMALE PLATOONS
               Top CUO -> Cadet Seargent -> 3 Sections (CPL -> LCPL -> 8 Cadets vertically)
               =================================================================== */}
            {!platoonData.isBand ? (
              <div className="flex flex-col items-center">
                {/* 1. TOP LEVEL: CUO (Optional Rank) */}
                <div className="flex flex-col items-center">
                  <HierarchyCadetCard
                    cadet={platoonData.cuo}
                    defaultRank="Cadet Under Officer/CUO"
                    defaultRole="Platoon Cadet Commander"
                    isOptional={true}
                    size="lg"
                    icon={<Shield className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />}
                    onClick={(c) => setSelectedCadet(c)}
                  />

                  {/* Vertical Connector: CUO to Cadet Seargent */}
                  <div className="w-[2px] h-6 bg-[#b8b09d] dark:bg-[#4d483c]" />
                </div>

                {/* 2. SECOND LEVEL: CADET SEARGENT */}
                <div className="flex flex-col items-center">
                  <HierarchyCadetCard
                    cadet={platoonData.sgt}
                    defaultRank="Cadet Seargent"
                    defaultRole="Platoon 2IC"
                    size="lg"
                    icon={<Shield className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />}
                    onClick={(c) => setSelectedCadet(c)}
                  />

                  {/* Vertical Connector: Cadet Seargent to 3-Section Crossbar */}
                  <div className="w-[2px] h-6 bg-[#b8b09d] dark:bg-[#4d483c]" />
                </div>

                {/* 3. THIRD LEVEL: HORIZONTAL DISTRIBUTION BAR & 3 SECTIONS */}
                <div className="relative pt-6">
                  {/* Horizontal Crossbar connecting Section 1 to Section 3 */}
                  <div className="absolute top-0 left-[calc(16.666%+16px)] right-[calc(16.666%+16px)] h-[2px] bg-[#b8b09d] dark:bg-[#4d483c]" />

                  {/* 3 Columns: Section 1, Section 2, Section 3 */}
                  <div className="grid grid-cols-3 gap-6 md:gap-8">
                    {platoonData.sections.map((sec) => (
                      <div key={sec.num} className="flex flex-col items-center w-[250px] sm:w-[270px]">
                        {/* Drop line from horizontal bar */}
                        <div className="w-[2px] h-6 bg-[#b8b09d] dark:bg-[#4d483c] -mt-6" />

                        {/* Section Title Badge */}
                        <div className="mb-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#ece1ce] via-[#e6d8bf] to-[#ece1ce] dark:from-[#26231c] dark:via-[#2b2720] dark:to-[#26231c] border border-[#beaf93] dark:border-[#453d30] text-[11px] font-black text-[#363024] dark:text-[#eedc82] tracking-wider uppercase shadow-2xs">
                          {sec.title}
                        </div>

                        {/* LEVEL A: CADET CORPORAL */}
                        <HierarchyCadetCard
                          cadet={sec.cpl}
                          defaultRank="Cadet Corporal"
                          defaultRole="Section Commander"
                          size="md"
                          onClick={(c) => setSelectedCadet(c)}
                        />

                        {/* Vertical Connector Line: Corporal to Lance Corporal */}
                        <div className="w-[2px] h-5 bg-[#b8b09d] dark:bg-[#4d483c]" />

                        {/* LEVEL B: CADET LANCE CORPORAL */}
                        <HierarchyCadetCard
                          cadet={sec.lcpl}
                          defaultRank="Cadet Lance Corporal"
                          defaultRole="Section 2IC"
                          size="md"
                          onClick={(c) => setSelectedCadet(c)}
                        />

                        {/* Vertical Connector Line: Lance Corporal to Cadets Box */}
                        <div className="w-[2px] h-5 bg-[#b8b09d] dark:bg-[#4d483c]" />

                        {/* LEVEL C: 8 CADETS - VERTICAL ALIGNMENT (2 Columns x 4 Rows for clean fit) */}
                        <div className="w-full p-2.5 rounded-2xl bg-[#e6ddcd]/85 dark:bg-[#181612]/90 border border-[#beaf91] dark:border-[#3c362a] shadow-xs backdrop-blur-xs">
                          <div className="text-[10px] font-black text-[#5d5242] dark:text-[#aca596] uppercase tracking-wider text-center mb-2 pb-1.5 border-b border-[#beaf91]/60 dark:border-[#38352d]">
                            Section Cadets (08)
                          </div>

                          {/* 2-Column Vertical Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {sec.cadets.map((cadet, cdtIdx) => (
                              <HierarchyCadetCard
                                key={cadet?.id ? `sec-${sec.num}-cdt-${cadet.id}-${cdtIdx}` : `sec-${sec.num}-empty-${cdtIdx}`}
                                cadet={cadet}
                                defaultRank="Cadet"
                                defaultRole={`Cadet ${cdtIdx + 1}`}
                                size="sm"
                                onClick={(c) => setSelectedCadet(c)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ===================================================================
                 BRANCH B: BAND PLATOON HIERARCHY
                 Structure:
                 - 01 Cadet Seargent (Head of Band Platoon)
                 - Under him: 02 Corporals (Senior NCOs)
                 - Under them: 03 Lance Corporals (for 3 sections)
                 - Under each Lance Corporal: 03 Cadets in vertical alignment
                 =================================================================== */
              <div className="flex flex-col items-center">
                {/* 1. BAND HEAD: 01 CADET SEARGENT */}
                <div className="flex flex-col items-center">
                  <div className="mb-2 px-3.5 py-0.5 rounded-full bg-[#eedc82]/30 dark:bg-[#eedc82]/15 border border-[#eedc82]/60 text-[10px] font-black text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider">
                    Band Platoon Commander
                  </div>

                  <HierarchyCadetCard
                    cadet={platoonData.sergeant}
                    defaultRank="Cadet Seargent"
                    defaultRole="Head of Band Platoon"
                    size="lg"
                    icon={<Music className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />}
                    onClick={(c) => setSelectedCadet(c)}
                  />

                  {/* Vertical Connector: Seargent to 2 Corporals Crossbar */}
                  <div className="w-[2px] h-6 bg-[#b8b09d] dark:bg-[#4d483c]" />
                </div>

                {/* 2. SECOND LEVEL: 02 CORPORALS */}
                <div className="relative pt-6">
                  {/* Horizontal Crossbar over 2 Corporals */}
                  <div className="absolute top-0 left-[25%] right-[25%] h-[2px] bg-[#b8b09d] dark:bg-[#4d483c]" />

                  <div className="grid grid-cols-2 gap-8 md:gap-14">
                    {platoonData.corporals.map((cpl, idx) => (
                      <div key={cpl?.id ? `band-cpl-${cpl.id}-${idx}` : `band-cpl-empty-${idx}`} className="flex flex-col items-center w-[210px]">
                        {/* Dropper line from crossbar */}
                        <div className="w-[2px] h-6 bg-[#b8b09d] dark:bg-[#4d483c] -mt-6" />

                        <HierarchyCadetCard
                          cadet={cpl}
                          defaultRank="Cadet Corporal"
                          defaultRole={`Band Corporal ${idx + 1}`}
                          size="md"
                          onClick={(c) => setSelectedCadet(c)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical Connector Line: Corporals to 3 Band Sections */}
                <div className="w-[2px] h-7 bg-[#b8b09d] dark:bg-[#4d483c]" />

                {/* 3. THIRD & FOURTH LEVEL: 3 BAND SECTIONS */}
                <div className="relative pt-6">
                  {/* Horizontal Crossbar spanning the 3 Band Sections */}
                  <div className="absolute top-0 left-[calc(16.666%+16px)] right-[calc(16.666%+16px)] h-[2px] bg-[#b8b09d] dark:bg-[#4d483c]" />

                  <div className="grid grid-cols-3 gap-6 md:gap-8">
                    {platoonData.sections.map((sec) => (
                      <div key={sec.num} className="flex flex-col items-center w-[220px] sm:w-[240px]">
                        {/* Dropper line from crossbar */}
                        <div className="w-[2px] h-6 bg-[#b8b09d] dark:bg-[#4d483c] -mt-6" />

                        {/* Section Header */}
                        <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#ece1ce] via-[#e6d8bf] to-[#ece1ce] dark:from-[#26231c] dark:via-[#2b2720] dark:to-[#26231c] border border-[#beaf93] dark:border-[#453d30] text-[10px] font-black text-[#363024] dark:text-[#eedc82] tracking-wider uppercase text-center shadow-2xs">
                          <div>{sec.title}</div>
                          <div className="text-[9px] font-mono text-[#6b5e10] dark:text-[#eedc82]">
                            {sec.instrumentType}
                          </div>
                        </div>

                        {/* LEVEL 3: 01 LANCE CORPORAL (Section Leader) */}
                        <HierarchyCadetCard
                          cadet={sec.lcpl}
                          defaultRank="Cadet Lance Corporal"
                          defaultRole={`${sec.title} Leader`}
                          size="md"
                          onClick={(c) => setSelectedCadet(c)}
                        />

                        {/* Vertical Connector to 3 Cadets */}
                        <div className="w-[2px] h-5 bg-[#b8b09d] dark:bg-[#4d483c]" />

                        {/* LEVEL 4: 03 CADETS - CLEAN VERTICAL ALIGNMENT */}
                        <div className="w-full p-2.5 rounded-2xl bg-[#e6ddcd]/85 dark:bg-[#181612]/90 border border-[#beaf91] dark:border-[#3c362a] shadow-xs backdrop-blur-xs space-y-2">
                          <div className="text-[10px] font-black text-[#5d5242] dark:text-[#aca596] uppercase tracking-wider text-center pb-1 border-b border-[#beaf91]/60 dark:border-[#38352d]">
                            Section Cadets (03)
                          </div>

                          <div className="space-y-2">
                            {sec.cadets.map((cadet, cIdx) => (
                              <HierarchyCadetCard
                                key={cadet?.id ? `band-${sec.num}-cdt-${cadet.id}-${cIdx}` : `band-${sec.num}-empty-${cIdx}`}
                                cadet={cadet}
                                defaultRank="Cadet"
                                defaultRole={`Instrumentalist ${cIdx + 1}`}
                                size="sm"
                                onClick={(c) => setSelectedCadet(c)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CADET DETAIL MODAL (Displays Full Profile Details)
          Styled strictly with website's warm palette
          ========================================================================= */}
      <AnimatePresence>
        {selectedCadet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-gradient-to-b from-[#f6eee1] to-[#e6d8c1] dark:from-[#26231c] dark:to-[#1b1913] border-2 border-[#bfae91] dark:border-[#453d30] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              {/* Header with Photo, Rank and Close button */}
              <div className="flex items-start gap-4">
                {selectedCadet.avatarUrl ? (
                  <img
                    src={selectedCadet.avatarUrl}
                    alt={selectedCadet.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d8c360] shadow-md shrink-0 bg-[#ded2be] dark:bg-[#1a1813]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ebd676]/40 to-[#ebd676]/20 border-2 border-[#d8c360] flex items-center justify-center text-[#504205] dark:text-[#eedc82] font-black text-lg shrink-0">
                    {selectedCadet.bloodGroup || <User className="w-8 h-8" />}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-[#ebd676] via-[#f7e899] to-[#ebd676] text-[#3d3203] dark:from-[#3a3212] dark:via-[#4d4218] dark:to-[#3a3212] dark:text-[#eedc82] border border-[#cfb84f] dark:border-[#eedc82]/40 shadow-2xs uppercase tracking-wider">
                    {selectedCadet.rank}
                  </span>
                  <h4 className="text-lg font-black text-[#1c1c18] dark:text-[#fcfbf7] mt-1.5 truncate tracking-tight">
                    {selectedCadet.name}
                  </h4>
                  <p className="text-xs text-[#5d5242] dark:text-[#b8af9e] font-mono font-bold">
                    {selectedCadet.cadetNo || 'Serving Platoon Member'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCadet(null)}
                  className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#695c4e] hover:text-[#1c1c18] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Details List */}
              <div className="bg-[#ede3d1]/85 dark:bg-[#191713] p-4 rounded-2xl space-y-2.5 text-xs border border-[#beaf91] dark:border-[#38352d]">
                <div className="flex justify-between items-center pb-2 border-b border-[#beaf91]/50 dark:border-[#2b2822]">
                  <span className="text-[#5d5242] dark:text-[#aca596] flex items-center gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5 text-[#504205] dark:text-[#eedc82]" />
                    Appointment / Role:
                  </span>
                  <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] text-right">
                    {selectedCadet.role || selectedCadet.appointment || selectedCadet.rank}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#7c7767] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                    Platoon Wing:
                  </span>
                  <span className="font-bold text-[#6b5e10] dark:text-[#eedc82]">{activeTab}</span>
                </div>

                {selectedCadet.section && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#7c7767]">Assigned Section:</span>
                    <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{selectedCadet.section}</span>
                  </div>
                )}

                {selectedCadet.collegeId && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#7c7767]">College Roll / ID:</span>
                    <span className="font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{selectedCadet.collegeId}</span>
                  </div>
                )}

                {selectedCadet.department && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#7c7767]">Department:</span>
                    <span className="font-medium text-[#1c1c18] dark:text-[#fcfbf7]">{selectedCadet.department}</span>
                  </div>
                )}

                {selectedCadet.batch && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#7c7767]">Cadet Batch:</span>
                    <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{selectedCadet.batch}</span>
                  </div>
                )}

                {selectedCadet.bloodGroup && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#7c7767]">Blood Group:</span>
                    <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold">
                      {selectedCadet.bloodGroup}
                    </span>
                  </div>
                )}

                {selectedCadet.phone && (
                  <div className="flex justify-between items-center pt-2 border-t border-[#cdc6b3]/40 dark:border-[#2b2822]">
                    <span className="text-[#7c7767] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                      Emergency Contact:
                    </span>
                    <span className="font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{selectedCadet.phone}</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCadet(null)}
                  className="px-5 py-2 rounded-xl bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#1c1c18] font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
