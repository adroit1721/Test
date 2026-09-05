import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { NoticeItem, BlogItem } from '../../../types';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  FileText,
  FileDown,
  Pin,
  PenTool,
  UploadCloud,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const NoticesBlogsTab: React.FC = () => {
  const { notices, addNotice, updateNotice, deleteNotice, blogs, addBlog, updateBlog, deleteBlog } = useAdminData();

  // Active subtab: 'notices' | 'blogs'
  const [activeSubtab, setActiveSubtab] = useState<'notices' | 'blogs'>('notices');

  // Notice modal state
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [noticeForm, setNoticeForm] = useState<Omit<NoticeItem, 'id'>>({
    title: '',
    circularNo: '',
    date: '',
    category: 'Camp',
    priority: 'normal',
    author: 'Md. Abdul Matin, PUO & Platoon Commander',
    summary: '',
    details: '',
    pdfUrl: '',
    isPinned: false,
  });

  // Blog modal state
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogForm, setBlogForm] = useState<{
    title: string;
    author: string;
    authorRole: string;
    date: string;
    readTime: string;
    category: BlogItem['category'];
    summary: string;
    contentRaw: string;
    imageUrl: string;
  }>({
    title: '',
    author: '',
    authorRole: '',
    date: '',
    readTime: '4 min read',
    category: 'Leadership',
    summary: '',
    contentRaw: '',
    imageUrl: '',
  });

  // Notice Handlers
  const handleStartAddNotice = () => {
    setNoticeForm({
      title: 'Instructions for Annual Regiment Winter Camp 2026',
      circularNo: `NGDC/BNCC/2026/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: 'Camp',
      priority: 'high',
      author: 'Md. Abdul Matin, PUO & Platoon Commander',
      summary: 'Mandatory briefing and medical clearance circular for all selected squad cadets.',
      details: 'All cadets must report to Platoon HQ with valid medical certificate, parental consent slip, and standard kit inspection checklist.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isPinned: true,
    });
    setEditingNotice(null);
    setIsAddingNotice(true);
  };

  const handleStartEditNotice = (n: NoticeItem) => {
    setEditingNotice(n);
    setNoticeForm({
      title: n.title,
      circularNo: n.circularNo,
      date: n.date,
      category: n.category,
      priority: n.priority || 'normal',
      author: n.author,
      summary: n.summary,
      details: n.details,
      pdfUrl: n.pdfUrl || '',
      isPinned: n.isPinned || false,
    });
    setIsAddingNotice(false);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      updateNotice(editingNotice.id, noticeForm);
      setEditingNotice(null);
    } else {
      addNotice(noticeForm);
      setIsAddingNotice(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNoticeForm((prev) => ({ ...prev, pdfUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Blog Handlers
  const handleStartAddBlog = () => {
    setBlogForm({
      title: 'Cadet Leadership Under Pressure: Lessons from Night Field Drills',
      author: 'Cadet Under Officer Hasan Mahmud',
      authorRole: 'Platoon Senior Cadet',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: '5 min read',
      category: 'Leadership',
      summary: 'Reflecting on tactical navigation, platoon morale, and swift decision-making in the field.',
      contentRaw: `When the whistle sounds at 0300 hours, discipline transforms from a theory into muscle memory.\n\nEvery cadet learns that leading is not about shouting orders—it is about placing the wellbeing of your squad files before your own fatigue.`,
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    });
    setEditingBlog(null);
    setIsAddingBlog(true);
  };

  const handleStartEditBlog = (b: BlogItem) => {
    setEditingBlog(b);
    setBlogForm({
      title: b.title,
      author: b.author,
      authorRole: b.authorRole,
      date: b.date,
      readTime: b.readTime,
      category: b.category,
      summary: b.summary,
      contentRaw: b.content.join('\n\n'),
      imageUrl: b.imageUrl || '',
    });
    setIsAddingBlog(false);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const blogData: Omit<BlogItem, 'id'> = {
      title: blogForm.title,
      author: blogForm.author,
      authorRole: blogForm.authorRole,
      date: blogForm.date,
      readTime: blogForm.readTime,
      category: blogForm.category,
      summary: blogForm.summary,
      content: blogForm.contentRaw.split('\n\n').filter(Boolean),
      imageUrl: blogForm.imageUrl,
      likes: editingBlog ? editingBlog.likes : 0,
    };

    if (editingBlog) {
      updateBlog(editingBlog.id, blogData);
      setEditingBlog(null);
    } else {
      addBlog(blogData);
      setIsAddingBlog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Notice & Blogs Management
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Publish official PDF notices and circulars, or author inspiring cadet blog articles and field memoirs.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center bg-[#f0eee8] dark:bg-[#141311] p-1 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
          <button
            onClick={() => setActiveSubtab('notices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'notices'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            PDF Notices ({notices.length})
          </button>
          <button
            onClick={() => setActiveSubtab('blogs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'blogs'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            Write Blogs ({blogs.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PDF NOTICES */}
      {activeSubtab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <FileDown className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Official Circulars & PDF Notices</span>
            </h3>
            <button
              onClick={handleStartAddNotice}
              className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish PDF Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-5 rounded-2xl shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] px-2 py-0.5 rounded-full">
                        {n.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#7c7767]">
                        {n.circularNo}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7] mt-1.5">
                      {n.title}
                    </h4>
                    <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-0.5">
                      {n.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.pdfUrl && (
                      <a
                        href={n.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                        title="Preview PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                        <span>PDF</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleStartEditNotice(n)}
                      className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete circular "${n.title}"?`)) {
                          deleteNotice(n.id);
                        }
                      }}
                      className="p-1 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#cdc6b3]/30 dark:border-[#333] flex items-center justify-between text-[11px] text-[#7c7767]">
                  <span>Issued by: {n.author}</span>
                  <span>Date: {n.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: WRITE BLOGS */}
      {activeSubtab === 'blogs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Cadet Memoirs & Blogs</span>
            </h3>
            <button
              onClick={handleStartAddBlog}
              className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Blog</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase">
                    <span className="bg-[#eedc82]/30 px-2 py-0.5 rounded-full">{b.category}</span>
                    <span className="text-[#7c7767]">{b.readTime}</span>
                  </div>

                  <h4 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] mt-2">
                    {b.title}
                  </h4>
                  <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-1 line-clamp-2">
                    {b.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#cdc6b3]/30 dark:border-[#333] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">{b.author}</span>
                    <span className="text-[10px] text-[#7c7767]">{b.authorRole} • {b.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEditBlog(b)}
                      className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete blog "${b.title}"?`)) {
                          deleteBlog(b.id);
                        }
                      }}
                      className="p-1 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {(isAddingNotice || editingNotice) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                {editingNotice ? 'Edit Notice' : 'Publish PDF Notice'}
              </h4>
              <button
                onClick={() => {
                  setIsAddingNotice(false);
                  setEditingNotice(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Circular Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule of Annual Inspection 2026"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Circular / Memo No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="NGDC/BNCC/2026/04"
                    value={noticeForm.circularNo}
                    onChange={(e) => setNoticeForm({ ...noticeForm, circularNo: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Category
                  </label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  >
                    <option value="Camp">Camp</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Uniform">Uniform & Kit</option>
                    <option value="Exam">Certificate Exam</option>
                    <option value="Competition">Competition</option>
                    <option value="Social">Social Work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Summary / Overview
                </label>
                <input
                  type="text"
                  required
                  placeholder="Short 1-sentence synopsis..."
                  value={noticeForm.summary}
                  onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Detailed Circular Text
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Full circular orders, timings, reporting instructions..."
                  value={noticeForm.details}
                  onChange={(e) => setNoticeForm({ ...noticeForm, details: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  PDF File Link or Upload
                </label>
                <input
                  type="text"
                  placeholder="https://... (or attach PDF file below)"
                  value={noticeForm.pdfUrl}
                  onChange={(e) => setNoticeForm({ ...noticeForm, pdfUrl: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
                <div className="mt-1.5">
                  <label className="japandi-btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1 cursor-pointer">
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload PDF Document</span>
                    <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeForm.isPinned}
                    onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                    className="rounded text-[#6b5e10]"
                  />
                  <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">Pin to Top</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeForm.priority === 'high'}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.checked ? 'high' : 'normal' })}
                    className="rounded text-[#6b5e10]"
                  />
                  <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">Mark High Priority</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNotice(false);
                    setEditingNotice(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {(isAddingBlog || editingBlog) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                {editingBlog ? 'Edit Blog Article' : 'Write Cadet Blog Article'}
              </h4>
              <button
                onClick={() => {
                  setIsAddingBlog(false);
                  setEditingBlog(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My First Night Navigation Exercise"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cadet Sumaiya Akter"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Author Role / Rank
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cadet Sergeant, Batch 23"
                    value={blogForm.authorRole}
                    onChange={(e) => setBlogForm({ ...blogForm, authorRole: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Topic Category
                  </label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  >
                    <option value="Leadership">Leadership</option>
                    <option value="Camp Experience">Camp Experience</option>
                    <option value="Cadet Life">Cadet Life</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Exam Preparation">Exam Preparation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Read Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 min read"
                    value={blogForm.readTime}
                    onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="Key highlight or hook sentence..."
                  value={blogForm.summary}
                  onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Article Body (Separate paragraphs with double Enter)
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Write the full memoir or article text here..."
                  value={blogForm.contentRaw}
                  onChange={(e) => setBlogForm({ ...blogForm, contentRaw: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Cover Photo URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={blogForm.imageUrl}
                  onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBlog(false);
                    setEditingBlog(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
