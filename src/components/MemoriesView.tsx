import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MemoryItem } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { MapPin, Calendar, Maximize2, Video, Play } from 'lucide-react';
import { framerFadeUp } from '../utils/motionVariants';

interface MemoriesViewProps {
  onSelectMemory: (memory: MemoryItem) => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({ onSelectMemory }) => {
  const { memories } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = memories.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'video') return item.type === 'video' || !!item.videoUrl;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-10 max-w-[1120px] mx-auto px-4 w-full">
      {/* Header with Framer motion */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider">
            Platoon Visual Archive
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
            Memories & Historic Feats
          </h1>
          <p className="text-sm md:text-base text-[#4a4738] dark:text-[#aca596] max-w-xl">
            Visual documentation of drills, annual camps, humanitarian relief operations, and video memories.
          </p>
        </div>
      </motion.section>

      {/* Categories Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f6f3ed] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#695c4e] dark:text-[#aca596] uppercase mr-2">Category:</span>
          {[
            { id: 'all', label: 'All Media' },
            { id: 'parade', label: 'Parade & Drills' },
            { id: 'training', label: 'Field & Weapon Training' },
            { id: 'relief', label: 'Social & Disaster Relief' },
            { id: 'awards', label: 'Award Ceremonies' },
            { id: 'video', label: 'Videos 🎥' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1c1c18] text-white shadow-xs'
                  : 'bg-[#fcf9f3] dark:bg-[#141311] text-[#4a4738] dark:text-[#cdc6b3] hover:bg-[#ebe8e2] border border-[#cdc6b3]/50 dark:border-[#423e35]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-[#7c7767] font-medium hidden sm:block">
          Showing {filtered.length} gallery items
        </div>
      </div>

      {/* Gallery Grid with Framer Scroll Stagger */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            custom={idx}
            variants={framerFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={() => onSelectMemory(item)}
            className="japandi-card overflow-hidden bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] group cursor-pointer hover:border-[#7c7767] transition-all flex flex-col shadow-xs hover:shadow-md rounded-3xl"
          >
            <div className="aspect-video relative overflow-hidden bg-[#ebe8e2] dark:bg-[#141311]">
              <img
                src={item.imageUrl}
                alt={item.altText || item.title}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-600 ease-out"
                referrerPolicy="no-referrer"
              />

              {/* Video Badge or play overlay */}
              {(item.type === 'video' || item.videoUrl) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#eedc82] text-[#1c1c18] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>
              ) : (
                <div className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-xs rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              )}

              <div className="absolute bottom-3 left-3 bg-[#1c1c18]/80 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-semibold text-[#eedc82] uppercase flex items-center gap-1.5">
                {(item.type === 'video' || item.videoUrl) && <Video className="w-3 h-3" />}
                <span>{item.category}</span>
              </div>
            </div>

            <div className="p-5 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-between text-[11px] text-[#695c4e] dark:text-[#aca596]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#7c7767]" /> {item.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#7c7767]" /> {item.location || 'Rajshahi'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};
