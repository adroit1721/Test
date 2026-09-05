import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { MemoryItem } from '../../../types';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  Video,
  UploadCloud,
  Calendar,
  MapPin,
  Film,
} from 'lucide-react';

export const MemoriesTab: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory } = useAdminData();

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);

  const [form, setForm] = useState<Omit<MemoryItem, 'id'>>({
    title: '',
    description: '',
    category: 'training',
    imageUrl: '',
    altText: '',
    date: '',
    location: '',
    mediaType: 'photo',
    videoUrl: '',
  });

  const handleStartAdd = () => {
    setForm({
      title: 'Annual Battalion Firing Championship',
      description: 'Cadets securing accuracy awards in .22 prone position firing.',
      category: 'training',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      altText: 'Firing championship moment',
      date: '2026',
      location: 'Bogura Cantonment Range',
      mediaType: 'photo',
      videoUrl: '',
    });
    setEditingItem(null);
    setIsAdding(true);
  };

  const handleStartEdit = (item: MemoryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      altText: item.altText,
      date: item.date,
      location: item.location,
      mediaType: item.mediaType || 'photo',
      videoUrl: item.videoUrl || '',
    });
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMemory(editingItem.id, form);
      setEditingItem(null);
    } else {
      addMemory(form);
      setIsAdding(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Film className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Memories & Gallery Management
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Curate photo and video archives capturing ceremonial parades, field camps, and voluntary humanitarian missions.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo / Video</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between group"
          >
            <div className="relative h-44 bg-[#f0eee8] dark:bg-[#141311]">
              <img
                src={mem.imageUrl}
                alt={mem.altText || mem.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#eedc82] bg-[#1c1c18]/80 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  {mem.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span>{mem.mediaType === 'video' ? 'Video' : 'Photo'}</span>
                </span>
                <span className="text-[10px] font-bold uppercase text-[#1c1c18] bg-[#eedc82] px-2 py-0.5 rounded-full">
                  {mem.category}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-grow">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] leading-snug">
                {mem.title}
              </h4>
              {mem.description && (
                <p className="text-xs text-[#695c4e] dark:text-[#aca596] line-clamp-2">
                  {mem.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-[#7c7767] pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {mem.date}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" /> {mem.location}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#f6f3ed] dark:bg-[#161512] border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-end gap-2">
              <button
                onClick={() => handleStartEdit(mem)}
                className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete memory "${mem.title}"?`)) {
                    deleteMemory(mem.id);
                  }
                }}
                className="p-1 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                {editingItem ? 'Edit Memory Item' : 'Add Memory (Photo / Video)'}
              </h4>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Media Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: 'photo' })}
                    className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                      form.mediaType === 'photo'
                        ? 'bg-[#eedc82] text-[#1c1c18] border-[#d5c470]'
                        : 'border-[#cdc6b3] dark:border-[#423e35] text-[#7c7767]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: 'video' })}
                    className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                      form.mediaType === 'video'
                        ? 'bg-[#eedc82] text-[#1c1c18] border-[#d5c470]'
                        : 'border-[#cdc6b3] dark:border-[#423e35] text-[#7c7767]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guard of Honor at Shaheed Minar"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Caption / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional context or memory caption..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  >
                    <option value="training">Training</option>
                    <option value="parade">Parade</option>
                    <option value="relief">Relief & Social</option>
                    <option value="awards">Awards & Honor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dec 2025"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NGDC Parade Ground"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Photo / Thumbnail Image URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or upload below"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
                <div className="mt-1.5">
                  <label className="japandi-btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1 cursor-pointer">
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {form.mediaType === 'video' && (
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Video Stream / YouTube URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Save to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
