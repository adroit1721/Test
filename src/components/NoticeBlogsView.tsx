import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NoticeItem, BlogItem } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { Megaphone, FileText, Search, Tag, Calendar, User, Clock, ArrowRight, Bell, Heart, Download } from 'lucide-react';
import { framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

interface NoticeBlogsViewProps {
  onSelectNotice: (notice: NoticeItem) => void;
  onSelectBlog: (blog: BlogItem) => void;
}

export const NoticeBlogsView: React.FC<NoticeBlogsViewProps> = ({
  onSelectNotice,
  onSelectBlog,
}) => {
  const { notices, blogs } = useAdminData();
  const [activeSubTab, setActiveSubTab] = useState<'notices' | 'blogs'>('notices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const noticeCategories = ['All', 'Camp', 'Recruitment', 'Uniform', 'Competition', 'Social', 'Exam'];
  const blogCategories = ['All', 'Camp Experience', 'Discipline', 'Cadet Life', 'Leadership', 'Exam Preparation'];

  // Filtered notices from live admin context
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.circularNo && n.circularNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered blogs from live admin context
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <motion.span variants={framerPopItemVariants} className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider mb-3">
          Circulars & Publications
        </motion.span>
        <motion.h1 variants={framerPopItemVariants} className="text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
          Notices & Cadet Blogs
        </motion.h1>
        <motion.p variants={framerPopItemVariants} className="text-base text-[#4a4738] dark:text-[#aca596] max-w-xl mx-auto mt-2">
          Stay updated with official battalion circulars, parade orders, camp announcements, and reflective articles written by cadets and officers.
        </motion.p>

        {/* Subtab Toggle Buttons */}
        <motion.div variants={framerPopItemVariants} className="flex justify-center mt-8">
          <div className="inline-flex p-1.5 bg-[#ebe8e2] dark:bg-[#141311] rounded-full border border-[#cdc6b3]/60 dark:border-[#423e35] gap-2">
            <button
              id="subtab-notices"
              onClick={() => {
                setActiveSubTab('notices');
                setSelectedCategory('All');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === 'notices'
                  ? 'bg-[#1c1c18] text-white shadow-xs'
                  : 'text-[#4a4738] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#eedc82]" />
              <span>Official Notices ({notices.length})</span>
            </button>
            <button
              id="subtab-blogs"
              onClick={() => {
                setActiveSubTab('blogs');
                setSelectedCategory('All');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === 'blogs'
                  ? 'bg-[#1c1c18] text-white shadow-xs'
                  : 'text-[#4a4738] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#eedc82]" />
              <span>Cadet Blogs ({blogs.length})</span>
            </button>
          </div>
        </motion.div>
      </motion.section>

      {/* Search & Category Filter Bar */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#f6f3ed] dark:bg-[#1e1d19] p-4 md:p-6 rounded-3xl border border-[#cdc6b3]/40 dark:border-[#423e35]"
      >
        {/* Search */}
        <motion.div variants={framerPopItemVariants} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7c7767] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${activeSubTab}...`}
            className="w-full bg-[#fcf9f3] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] focus:border-[#1c1c18] dark:focus:border-[#eedc82] pl-11 pr-4 py-2.5 rounded-full text-xs md:text-sm outline-none transition-all text-[#1c1c18] dark:text-[#fcfbf7]"
          />
        </motion.div>

        {/* Category Pills */}
        <motion.div variants={framerPopItemVariants} className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide">
          {(activeSubTab === 'notices' ? noticeCategories : blogCategories).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#eedc82] text-[#1c1c18] border border-[#6b5e10]/40 font-bold'
                  : 'bg-[#fcf9f3] dark:bg-[#141311] text-[#4a4738] dark:text-[#cdc6b3] hover:bg-[#ebe8e2] border border-[#cdc6b3]/50 dark:border-[#423e35]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </motion.section>

      {/* Content Render: Notices View */}
      {activeSubTab === 'notices' && (
        <motion.section
          variants={framerSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewportConfig}
          className="space-y-4"
        >
          {filteredNotices.length === 0 ? (
            <motion.div variants={framerPopItemVariants} className="p-12 text-center bg-[#f6f3ed] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/40 dark:border-[#423e35] space-y-2">
              <Bell className="w-8 h-8 mx-auto text-[#7c7767]" />
              <h3 className="font-bold text-lg text-[#1c1c18] dark:text-[#fcfbf7]">No notices found</h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">Try adjusting your search criteria or category filter.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredNotices.map((notice) => (
                <motion.div
                  key={notice.id}
                  variants={framerPopItemVariants}
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectNotice(notice)}
                  className="japandi-card p-6 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-4 cursor-pointer hover:border-[#7c7767] hover:shadow-xs transition-all flex flex-col justify-between group rounded-2xl"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#695c4e] dark:text-[#aca596] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#7c7767]" />
                        {notice.date}
                      </span>
                      <span className="text-[11px] font-bold bg-[#f0eee8] dark:bg-[#25231c] border border-[#cdc6b3]/50 dark:border-[#423e35] text-[#6b5e10] dark:text-[#eedc82] px-2.5 py-0.5 rounded-full">
                        {notice.category}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors leading-snug">
                      {notice.title}
                    </h3>

                    <p className="text-xs md:text-sm text-[#4a4738] dark:text-[#aca596] line-clamp-2 leading-relaxed">
                      {notice.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-between text-xs text-[#695c4e] dark:text-[#aca596]">
                    <span className="font-mono text-[11px] text-[#7c7767]">{notice.circularNo}</span>
                    <span className="font-semibold text-[#6b5e10] dark:text-[#eedc82] group-hover:underline flex items-center gap-1">
                      Read Circular <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Content Render: Blogs View */}
      {activeSubTab === 'blogs' && (
        <motion.section
          variants={framerSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewportConfig}
          className="space-y-4"
        >
          {filteredBlogs.length === 0 ? (
            <motion.div variants={framerPopItemVariants} className="p-12 text-center bg-[#f6f3ed] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/40 dark:border-[#423e35] space-y-2">
              <FileText className="w-8 h-8 mx-auto text-[#7c7767]" />
              <h3 className="font-bold text-lg text-[#1c1c18] dark:text-[#fcfbf7]">No articles found</h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">Try searching for other topics like camp, discipline, or leadership.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBlogs.map((blog) => (
                <motion.article
                  key={blog.id}
                  variants={framerPopItemVariants}
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectBlog(blog)}
                  className="japandi-card p-6 md:p-8 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-4 cursor-pointer hover:border-[#7c7767] hover:shadow-xs transition-all flex flex-col justify-between group rounded-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#695c4e] dark:text-[#aca596]">
                      <span className="font-semibold bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82] px-2.5 py-0.5 rounded-full text-[11px]">
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-[#7c7767]" /> {blog.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors leading-snug">
                      {blog.title}
                    </h3>

                    <p className="text-xs md:text-sm text-[#4a4738] dark:text-[#aca596] line-clamp-3 leading-relaxed">
                      {blog.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#25231c] border border-[#cdc6b3] dark:border-[#423e35] flex items-center justify-center font-bold text-xs text-[#6b5e10] dark:text-[#eedc82]">
                        {blog.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] leading-none">{blog.author}</p>
                        <p className="text-[10px] text-[#7c7767]">{blog.authorRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{blog.likes}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
};
