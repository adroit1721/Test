import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { FooterConfig } from '../../../types';
import {
  Sliders,
  CheckCircle2,
  Save,
  Globe,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  Share2,
  FileText,
} from 'lucide-react';

export const FooterTab: React.FC = () => {
  const { footerConfig, updateFooterConfig } = useAdminData();
  const [form, setForm] = useState<FooterConfig>(footerConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Footer Configuration & Social Links
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Customize the global webpage footer text, battalion affiliation details, emergency hotlines, and social media channels.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
          </span>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-5 shadow-2xs max-w-3xl"
      >
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <FileText className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Footer Narrative & Identity Text</span>
          </h3>

          <div className="text-xs">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
              Platoon Overview / About Bio (Footer Left Column)
            </label>
            <textarea
              rows={3}
              required
              value={form.aboutText}
              onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Platoon Slogan / Sub-motto
              </label>
              <input
                type="text"
                required
                value={form.mottoText}
                onChange={(e) => setForm({ ...form, mottoText: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Emergency Duty Phone / Hotline
              </label>
              <input
                type="text"
                required
                value={form.emergencyPhone}
                onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
              Copyright Notice Text
            </label>
            <input
              type="text"
              required
              value={form.copyrightText}
              onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4 pt-3">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <Share2 className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Social Media & Channel Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Page / Group URL</span>
              </label>
              <input
                type="text"
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="text"
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-sky-700" />
                <span>LinkedIn Organization URL</span>
              </label>
              <input
                type="text"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="text"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="japandi-btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Footer Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
