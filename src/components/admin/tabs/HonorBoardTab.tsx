import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { HonorEntryItem, HonorCategoryKey } from '../../../types';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  X,
  Shield,
  Star,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const HonorBoardTab: React.FC = () => {
  const { honorEntries, addHonorEntry, updateHonorEntry, deleteHonorEntry } = useAdminData();

  // Active Category: 'commanders' | 'bnccos' | 'seniors'
  const [activeCategory, setActiveCategory] = useState<HonorCategoryKey>('commanders');

  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HonorEntryItem | null>(null);

  const [form, setForm] = useState<Omit<HonorEntryItem, 'id'>>({
    category: 'commanders',
    sl: 1,
    name: '',
    designation: '',
    tenure: '',
    remarks: '',
    badge: '',
  });

  const categoryEntries = honorEntries
    .filter((e) => e.category === activeCategory)
    .sort((a, b) => a.sl - b.sl);

  const handleStartAdd = () => {
    const nextSL = categoryEntries.length + 1;
    let defaultDesignation = '';
    if (activeCategory === 'commanders') defaultDesignation = 'Professor Under Officer (PUO)';
    if (activeCategory === 'bnccos') defaultDesignation = 'Havildar / Battalion Drill Instructor (BNCCO)';
    if (activeCategory === 'seniors') defaultDesignation = 'Cadet Under Officer (CUO)';

    setForm({
      category: activeCategory,
      sl: nextSL,
      name: '',
      designation: defaultDesignation,
      tenure: '01/01/2024 to 31/12/2024',
      remarks: '',
      badge: '',
    });
    setEditingEntry(null);
    setIsAdding(true);
  };

  const handleStartEdit = (entry: HonorEntryItem) => {
    setEditingEntry(entry);
    setForm({
      category: entry.category,
      sl: entry.sl,
      name: entry.name,
      designation: entry.designation,
      tenure: entry.tenure,
      remarks: entry.remarks || '',
      badge: entry.badge || '',
    });
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      updateHonorEntry(editingEntry.id, form);
      setEditingEntry(null);
    } else {
      addHonorEntry(form);
      setIsAdding(false);
    }
  };

  const CATEGORY_TABS: { key: HonorCategoryKey; label: string; icon: React.ElementType }[] = [
    { key: 'commanders', label: 'a. List Of Platoon Commanders', icon: Shield },
    { key: 'bnccos', label: "b. List of BNCCO's", icon: Star },
    { key: 'seniors', label: 'c. List of Platoon Senior Cadets', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Honor Board (3 Categories Tab View)
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Maintain the official Platoon roll with SL, Name, Designation, and Tenure (dd/mm/yyyy to dd/mm/yyyy) across 3 distinct military categories.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Honor Record</span>
        </button>
      </div>

      {/* 3 Categories Tab Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-[#f0eee8] dark:bg-[#141311] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
        {CATEGORY_TABS.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const count = honorEntries.filter((e) => e.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs'
                  : 'text-[#695c4e] dark:text-[#aca596] hover:bg-[#e6e2d8] dark:hover:bg-[#1f1d19]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{cat.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                  isActive
                    ? 'bg-[#1c1c18] text-[#eedc82]'
                    : 'bg-[#cdc6b3]/40 dark:bg-[#2a2822] text-[#555042] dark:text-[#cdc6b3]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabular Layout for Selected Category */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f6f3ed] dark:bg-[#161512] border-b border-[#cdc6b3]/50 dark:border-[#423e35] text-[#555042] dark:text-[#aca596] font-bold">
                <th className="py-3 px-4 w-16 text-center">SL</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Tenure (dd/mm/yyyy to dd/mm/yyyy)</th>
                <th className="py-3 px-4">Remarks / Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cdc6b3]/30 dark:divide-[#333]">
              {categoryEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#7c7767]">
                    No records found in this category. Click &quot;Add Honor Record&quot; to insert the first entry.
                  </td>
                </tr>
              ) : (
                categoryEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-[#f6f3ed]/60 dark:hover:bg-[#23211c]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">
                      {entry.sl}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {entry.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#555042] dark:text-[#cdc6b3]">
                      {entry.designation}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {entry.tenure}
                    </td>
                    <td className="py-3.5 px-4 text-[#695c4e] dark:text-[#aca596]">
                      {entry.badge && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] px-2 py-0.5 rounded-full mr-2">
                          {entry.badge}
                        </span>
                      )}
                      <span className="text-[11px] line-clamp-1">{entry.remarks}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${entry.name}" from honor board?`)) {
                              deleteHonorEntry(entry.id);
                            }
                          }}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(isAdding || editingEntry) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                {editingEntry ? 'Edit Honor Record' : 'Add New Honor Board Entry'}
              </h4>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingEntry(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Honor Board Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                >
                  <option value="commanders">a. List Of Platoon Commanders</option>
                  <option value="bnccos">b. List of BNCCO&apos;s</option>
                  <option value="seniors">c. List of Platoon Senior Cadets</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Serial No. (SL)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.sl}
                    onChange={(e) => setForm({ ...form, sl: Number(e.target.value) })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono text-center font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Honor Officer / Cadet Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Abdul Matin"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor Under Officer (PUO) & Platoon Commander"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Tenure (Format: dd/mm/yyyy to dd/mm/yyyy)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01/01/2018 to Present (or 01/01/2020 to 31/12/2022)"
                  value={form.tenure}
                  onChange={(e) => setForm({ ...form, tenure: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Current Commander"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Notable Achievement (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Platoon 2023"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingEntry(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
