import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { HeroSlide, ExecutiveMessageConfig } from '../../../types';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  X,
  UploadCloud,
  Sliders,
  Sparkles,
  GraduationCap,
  Award,
  RotateCcw,
  Save,
  Shield,
  Check,
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    principalMessage,
    updatePrincipalMessage,
    resetPrincipalMessage,
    vicePrincipalMessage,
    updateVicePrincipalMessage,
    resetVicePrincipalMessage,
  } = useAdminData();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'slider' | 'principal' | 'vicePrincipal'>('slider');

  // Slider State
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [slideFormData, setSlideFormData] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: '',
    badge: '',
    title: '',
    subtitle: '',
    altText: '',
    isActive: true,
  });

  // Principal Form State
  const [principalForm, setPrincipalForm] = useState<ExecutiveMessageConfig>({ ...principalMessage });
  const [principalSavedToast, setPrincipalSavedToast] = useState(false);

  // Vice-Principal Form State
  const [vicePrincipalForm, setVicePrincipalForm] = useState<ExecutiveMessageConfig>({ ...vicePrincipalMessage });
  const [vicePrincipalSavedToast, setVicePrincipalSavedToast] = useState(false);

  // Sync state if context changes externally
  useEffect(() => {
    setPrincipalForm({ ...principalMessage });
  }, [principalMessage]);

  useEffect(() => {
    setVicePrincipalForm({ ...vicePrincipalMessage });
  }, [vicePrincipalMessage]);

  // Slide Handlers
  const handleStartAddSlide = () => {
    setSlideFormData({
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
      badge: 'Discipline & Honor',
      title: 'New Battalion Milestone',
      subtitle: 'Instilling unflinching leadership, teamwork, and military bearing at NGDC Platoon.',
      altText: 'BNCC Cadets in parade uniform',
      isActive: true,
    });
    setIsAddingNew(true);
    setEditingSlide(null);
  };

  const handleStartEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideFormData({
      imageUrl: slide.imageUrl,
      badge: slide.badge,
      title: slide.title,
      subtitle: slide.subtitle,
      altText: slide.altText,
      isActive: slide.isActive !== false,
    });
    setIsAddingNew(false);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateHeroSlide(editingSlide.id, slideFormData);
      setEditingSlide(null);
    } else {
      addHeroSlide(slideFormData);
      setIsAddingNew(false);
    }
  };

  const handleSlideFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSlideFormData((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Principal Image Upload
  const handlePrincipalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPrincipalForm((prev) => ({ ...prev, photoUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Vice Principal Image Upload
  const handleVicePrincipalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVicePrincipalForm((prev) => ({ ...prev, photoUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Principal Message
  const handleSavePrincipal = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrincipalMessage(principalForm);
    setPrincipalSavedToast(true);
    setTimeout(() => setPrincipalSavedToast(false), 3500);
  };

  // Save Vice-Principal Message
  const handleSaveVicePrincipal = (e: React.FormEvent) => {
    e.preventDefault();
    updateVicePrincipalMessage(vicePrincipalForm);
    setVicePrincipalSavedToast(true);
    setTimeout(() => setVicePrincipalSavedToast(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Controls */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#f6f3ed] dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#3a372e]">
        <button
          onClick={() => setActiveSubTab('slider')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'slider'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Hero Image Slider</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#eedc82]/20 text-[#eedc82]">
            {heroSlides?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('principal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'principal'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Message from the Principal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vicePrincipal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'vicePrincipal'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Message from the Vice-Principal</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW A: HERO SLIDER MANAGEMENT
          ========================================================================= */}
      {activeSubTab === 'slider' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <Sliders className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Home Slider Management
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Customize the main carousel hero slides, background photos, badges, headlines, and subtitles.
              </p>
            </div>

            <button
              onClick={handleStartAddSlide}
              className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Slide</span>
            </button>
          </div>

          {/* Slide Modal Editor (Add/Edit) */}
          {(isAddingNew || editingSlide) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
                  <h3 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">
                    {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingSlide(null);
                      setIsAddingNew(false);
                    }}
                    className="text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Badge / Tag Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Knowledge & Discipline"
                      value={slideFormData.badge}
                      onChange={(e) => setSlideFormData({ ...slideFormData, badge: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Main Headline (Title)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangladesh National Cadet Corps"
                      value={slideFormData.title}
                      onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. New Govt. Degree College, Rajshahi BNCC Platoon..."
                      value={slideFormData.subtitle}
                      onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Slide Image URL
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... or upload below"
                      value={slideFormData.imageUrl}
                      onChange={(e) => setSlideFormData({ ...slideFormData, imageUrl: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <label className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer">
                        <UploadCloud className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                        <span>Upload Local Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlideFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-[#7c7767]">Supported: JPG, PNG, WebP</span>
                    </div>
                  </div>

                  {slideFormData.imageUrl && (
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-[#cdc6b3] dark:border-[#423e35]">
                      <img
                        src={slideFormData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2.5 text-white">
                        <span className="text-[11px] font-bold">{slideFormData.title || 'Slide Preview'}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="slideActive"
                      checked={slideFormData.isActive}
                      onChange={(e) => setSlideFormData({ ...slideFormData, isActive: e.target.checked })}
                      className="rounded text-[#6b5e10]"
                    />
                    <label htmlFor="slideActive" className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                      Active in Carousel
                    </label>
                  </div>

                  <div className="pt-3 border-t border-[#cdc6b3]/50 dark:border-[#423e35] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlide(null);
                        setIsAddingNew(false);
                      }}
                      className="japandi-btn-secondary text-xs py-2 px-4 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="japandi-btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
                    >
                      Save Slide
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Slide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(heroSlides || []).map((slide, index) => (
              <div
                key={slide.id}
                className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-[#6b5e10] transition-all"
              >
                <div className="relative h-44 bg-[#f0eee8] dark:bg-[#141311]">
                  <img
                    src={slide.imageUrl}
                    alt={slide.altText || slide.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1c1c18]/80 backdrop-blur-xs text-[#eedc82] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Slide #{index + 1} • {slide.badge}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slide.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {slide.isActive !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-grow">
                  <h3 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] leading-snug">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-[#695c4e] dark:text-[#aca596] line-clamp-2">
                    {slide.subtitle}
                  </p>
                </div>

                <div className="p-3 bg-[#f6f3ed] dark:bg-[#161512] border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-between">
                  <span className="text-[10px] text-[#7c7767] dark:text-[#888] font-mono truncate max-w-[160px]">
                    {slide.id}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEditSlide(slide)}
                      className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this slide?')) {
                          deleteHeroSlide(slide.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Slide"
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

      {/* =========================================================================
          VIEW B: MESSAGE FROM THE PRINCIPAL CONTROLS
          ========================================================================= */}
      {activeSubTab === 'principal' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Message from the Principal Controls
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Configure the Principal's portrait picture, full name, designation, highlighted quote, and speech message shown below the image slider.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset Principal message to factory default values?')) {
                  resetPrincipalMessage();
                }
              }}
              className="japandi-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Reset to Default</span>
            </button>
          </div>

          {principalSavedToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Principal message updated successfully! The home page section is live with the new changes.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form */}
            <form onSubmit={handleSavePrincipal} className="lg:col-span-7 space-y-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Principal's Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor Dr. Shikha Sarkar"
                    value={principalForm.name}
                    onChange={(e) => setPrincipalForm({ ...principalForm, name: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal"
                    value={principalForm.designation}
                    onChange={(e) => setPrincipalForm({ ...principalForm, designation: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Institution / Sub-Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Govt. Degree College, Rajshahi"
                    value={principalForm.subDesignation}
                    onChange={(e) => setPrincipalForm({ ...principalForm, subDesignation: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Honorary Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patron & Leadership"
                    value={principalForm.badge || ''}
                    onChange={(e) => setPrincipalForm({ ...principalForm, badge: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload & URL */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Principal's Photo (Upload local file or specify URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... or upload below"
                    value={principalForm.photoUrl}
                    onChange={(e) => setPrincipalForm({ ...principalForm, photoUrl: e.target.value })}
                    className="flex-1 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono text-[11px]"
                  />
                  <label className="japandi-btn-secondary text-[11px] py-2 px-3.5 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                    <UploadCloud className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*,.jfif"
                      onChange={handlePrincipalPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Highlighted Quote */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Highlighted Quote (Opening Highlight)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter inspiring quote or keynote..."
                  value={principalForm.quote}
                  onChange={(e) => setPrincipalForm({ ...principalForm, quote: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic leading-relaxed"
                />
              </div>

              {/* Full Message Body */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Speech / Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed message from the Principal..."
                  value={principalForm.message}
                  onChange={(e) => setPrincipalForm({ ...principalForm, message: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed resize-y"
                />
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="principalEnabled"
                  checked={principalForm.enabled !== false}
                  onChange={(e) => setPrincipalForm({ ...principalForm, enabled: e.target.checked })}
                  className="rounded text-[#6b5e10]"
                />
                <label htmlFor="principalEnabled" className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                  Display "Message from the Principal" section on Home page
                </label>
              </div>

              <div className="pt-3 border-t border-[#cdc6b3]/50 dark:border-[#423e35] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Principal Message</span>
                </button>
              </div>
            </form>

            {/* Live Visual Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#695c4e] dark:text-[#aca596] px-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  Live Home Page Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82]">
                  {principalForm.enabled !== false ? 'Active On Home' : 'Disabled'}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-[#f6f3ed] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#cdc6b3] dark:border-[#464237] shadow-sm mb-3">
                    <img
                      src={principalForm.photoUrl}
                      alt={principalForm.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {principalForm.name || 'Principal Name'}
                  </h4>
                  <p className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                    {principalForm.designation || 'Principal'}
                  </p>
                  <p className="text-[10px] text-[#7c7767] dark:text-[#aca596] mt-0.5">
                    {principalForm.subDesignation || 'New Govt. Degree College, Rajshahi'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#cdc6b3]/40 dark:border-[#38352d]">
                  <h5 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Message from the Principal
                  </h5>
                  <blockquote className="border-l-3 border-[#eedc82] pl-3 italic text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed">
                    {principalForm.quote}
                  </blockquote>
                  <p className="text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed line-clamp-4">
                    {principalForm.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: MESSAGE FROM THE VICE-PRINCIPAL CONTROLS
          ========================================================================= */}
      {activeSubTab === 'vicePrincipal' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <Award className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Message from the Vice-Principal Controls
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Configure the Vice-Principal's portrait picture, full name, designation, highlighted quote, and speech message shown below the image slider.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset Vice-Principal message to factory default values?')) {
                  resetVicePrincipalMessage();
                }
              }}
              className="japandi-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Reset to Default</span>
            </button>
          </div>

          {vicePrincipalSavedToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Vice-Principal message updated successfully! The home page section is live with the new changes.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form */}
            <form onSubmit={handleSaveVicePrincipal} className="lg:col-span-7 space-y-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Vice-Principal's Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor Md. Motiur Rahman"
                    value={vicePrincipalForm.name}
                    onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, name: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vice-Principal"
                    value={vicePrincipalForm.designation}
                    onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, designation: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Institution / Sub-Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Govt. Degree College, Rajshahi"
                    value={vicePrincipalForm.subDesignation}
                    onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, subDesignation: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Honorary Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vice-Patron & Leadership"
                    value={vicePrincipalForm.badge || ''}
                    onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, badge: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload & URL */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Vice-Principal's Photo (Upload local file or specify URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... or upload below"
                    value={vicePrincipalForm.photoUrl}
                    onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, photoUrl: e.target.value })}
                    className="flex-1 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono text-[11px]"
                  />
                  <label className="japandi-btn-secondary text-[11px] py-2 px-3.5 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                    <UploadCloud className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*,.jfif"
                      onChange={handleVicePrincipalPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Highlighted Quote */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Highlighted Quote (Opening Highlight)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter inspiring quote or keynote..."
                  value={vicePrincipalForm.quote}
                  onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, quote: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic leading-relaxed"
                />
              </div>

              {/* Full Message Body */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Speech / Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed message from the Vice-Principal..."
                  value={vicePrincipalForm.message}
                  onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, message: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed resize-y"
                />
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vicePrincipalEnabled"
                  checked={vicePrincipalForm.enabled !== false}
                  onChange={(e) => setVicePrincipalForm({ ...vicePrincipalForm, enabled: e.target.checked })}
                  className="rounded text-[#6b5e10]"
                />
                <label htmlFor="vicePrincipalEnabled" className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                  Display "Message from the Vice-Principal" section on Home page
                </label>
              </div>

              <div className="pt-3 border-t border-[#cdc6b3]/50 dark:border-[#423e35] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Vice-Principal Message</span>
                </button>
              </div>
            </form>

            {/* Live Visual Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#695c4e] dark:text-[#aca596] px-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  Live Home Page Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82]">
                  {vicePrincipalForm.enabled !== false ? 'Active On Home' : 'Disabled'}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-[#fcf9f3] dark:bg-[#181714] border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#cdc6b3] dark:border-[#464237] shadow-sm mb-3">
                    <img
                      src={vicePrincipalForm.photoUrl}
                      alt={vicePrincipalForm.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {vicePrincipalForm.name || 'Vice-Principal Name'}
                  </h4>
                  <p className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                    {vicePrincipalForm.designation || 'Vice-Principal'}
                  </p>
                  <p className="text-[10px] text-[#7c7767] dark:text-[#aca596] mt-0.5">
                    {vicePrincipalForm.subDesignation || 'New Govt. Degree College, Rajshahi'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#cdc6b3]/40 dark:border-[#38352d]">
                  <h5 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Message from the Vice-Principal
                  </h5>
                  <blockquote className="border-l-3 border-[#eedc82] pl-3 italic text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed">
                    {vicePrincipalForm.quote}
                  </blockquote>
                  <p className="text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed line-clamp-4">
                    {vicePrincipalForm.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

