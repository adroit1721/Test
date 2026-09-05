import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminData } from '../context/AdminDataContext';
import { HonorCategoryKey, HonorEntryItem } from '../types';
import { Award, Shield, Star, Users, Search, Calendar, Trophy } from 'lucide-react';
import { framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

export const HonorBoardView: React.FC = () => {
  const { honorEntries } = useAdminData();
  const [activeCategory, setActiveCategory] = useState<HonorCategoryKey>('commanders');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORY_TABS: { key: HonorCategoryKey; title: string; subtitle: string; icon: React.ElementType }[] = [
    {
      key: 'commanders',
      title: 'List Of Platoon Commanders',
      subtitle: 'PUO Commanding the NGDC-BNCC Platoon',
      icon: Shield,
    },
    {
      key: 'bnccos',
      title: "List of BNCCO's",
      subtitle: 'BNCC Officers Serving the NGDC-BNCC Platoon',
      icon: Star,
    },
    {
      key: 'seniors',
      title: 'List of Platoon Senior Cadets',
      subtitle: 'Cadet Under Officers (CUO) & Cadet Seargents',
      icon: Users,
    },
  ];

  const currentEntries = honorEntries
    .filter((e) => e.category === activeCategory)
    .filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tenure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.remarks && e.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.sl - b.sl);

  return (
    <div className="space-y-10 max-w-[1120px] mx-auto px-4 w-full">
      {/* Header Banner */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs text-center"
      >
        <motion.span
          variants={framerPopItemVariants}
          className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider mb-3"
        >
          Official Roll of Honor
        </motion.span>
        <motion.h1
          variants={framerPopItemVariants}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight"
        >
          Honor Board
        </motion.h1>
        <motion.p
          variants={framerPopItemVariants}
          className="text-xs sm:text-sm md:text-base text-[#695c4e] dark:text-[#aca596] max-w-2xl mx-auto mt-2 leading-relaxed"
        >
          Commemorating the leadership lineage of New Govt. Degree College BNCC Platoon: Platoon Commanders, Battalion Drill Instructors (BNCCOs), and Platoon Senior Cadets across all historical tenures.
        </motion.p>

        {/* Search Input */}
        <motion.div variants={framerPopItemVariants} className="max-w-md mx-auto mt-6 relative">
          <Search className="w-4 h-4 text-[#7c7767] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation, or year..."
            className="w-full bg-[#fcf9f3] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] focus:border-[#1c1c18] dark:focus:border-[#eedc82] pl-11 pr-4 py-2.5 rounded-full text-xs md:text-sm outline-none transition-all shadow-xs text-[#1c1c18] dark:text-[#fcfbf7]"
          />
        </motion.div>
      </motion.section>

      {/* 3 Categories Tab Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#f0eee8] dark:bg-[#141311] p-2 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
        {CATEGORY_TABS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const count = honorEntries.filter((e) => e.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex flex-col text-left p-3.5 rounded-xl transition-all cursor-pointer ${isActive
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs'
                : 'text-[#695c4e] dark:text-[#aca596] hover:bg-[#e6e2d8] dark:hover:bg-[#1f1d19]'
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0 text-[#6b5e10] dark:text-[#1c1c18]" />
                  <span className="font-bold text-xs sm:text-sm">{cat.title}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${isActive
                    ? 'bg-[#1c1c18] text-[#eedc82]'
                    : 'bg-[#cdc6b3]/40 dark:bg-[#2a2822] text-[#555042] dark:text-[#cdc6b3]'
                    }`}
                >
                  {count} Records
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-1 line-clamp-1">{cat.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* 3-Category Roll Table (Public View) */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl overflow-hidden shadow-xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-[#f6f3ed] dark:bg-[#161512] border-b border-[#cdc6b3]/50 dark:border-[#423e35] text-[#555042] dark:text-[#aca596] font-bold uppercase text-[11px] tracking-wider">
                <th className="py-4 px-4 sm:px-6 w-16 text-center">SL.</th>
                <th className="py-4 px-4 sm:px-6">Name</th>
                <th className="py-4 px-4 sm:px-6">Designation</th>
                <th className="py-4 px-4 sm:px-6">Tenure</th>
                <th className="py-4 px-4 sm:px-6">Achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cdc6b3]/30 dark:divide-[#333]">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-[#7c7767]">
                    No honor records found in this category.
                  </td>
                </tr>
              ) : (
                currentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-[#f6f3ed]/70 dark:hover:bg-[#23211c]/70 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6 text-center font-mono font-bold text-[#6b5e10] dark:text-[#eedc82] text-xs sm:text-sm">
                      {String(entry.sl).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {entry.name}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-[#555042] dark:text-[#cdc6b3] font-medium">
                      {entry.designation}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                      <span className="inline-flex items-center gap-1.5 bg-[#f0eee8] dark:bg-[#141311] px-2.5 py-1 rounded-md border border-[#cdc6b3]/40 dark:border-[#423e35]">
                        <Calendar className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                        {entry.tenure}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-[#695c4e] dark:text-[#aca596]">
                      {entry.badge && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#eedc82]/35 text-[#6b5e10] dark:text-[#eedc82] px-2.5 py-0.5 rounded-full mr-2">
                          {entry.badge}
                        </span>
                      )}
                      {entry.remarks && <span>{entry.remarks}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};
