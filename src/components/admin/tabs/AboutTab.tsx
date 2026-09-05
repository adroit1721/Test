import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { CloudinaryUploader } from '../../common/CloudinaryUploader';
import {
  FileText,
  MessageSquareQuote,
  Shield,
  Check,
  RotateCcw,
  Save,
  UserCheck,
  Eye,
  Info,
} from 'lucide-react';

export const AboutTab: React.FC = () => {
  const {
    aboutOverview,
    updateAboutOverview,
    resetAboutOverview,
    bncco1Message,
    updateBncco1Message,
    resetBncco1Message,
    bncco2Message,
    updateBncco2Message,
    resetBncco2Message,
    platoonCommanderMessage,
    updatePlatoonCommanderMessage,
    resetPlatoonCommanderMessage,
  } = useAdminData();

  // Active Subtab: 'overview' | 'bncco1' | 'bncco2' | 'commander'
  const [activeSubtab, setActiveSubtab] = useState<'overview' | 'bncco1' | 'bncco2' | 'commander'>('overview');

  // Local form state for Overview
  const [overviewForm, setOverviewForm] = useState(aboutOverview);

  // Local form state for BNCCO 1
  const [bncco1Form, setBncco1Form] = useState(bncco1Message);

  // Local form state for BNCCO 2
  const [bncco2Form, setBncco2Form] = useState(bncco2Message);

  // Local form state for Platoon Commander
  const [commanderForm, setCommanderForm] = useState(platoonCommanderMessage);

  // Status message for save feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Handlers for Overview
  const handleSaveOverview = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutOverview(overviewForm);
    showToast('About Our Platoon overview saved successfully!');
  };

  const handleResetOverview = () => {
    if (confirm('Reset About Our Platoon narrative to factory default?')) {
      resetAboutOverview();
      setOverviewForm(aboutOverview);
      showToast('Overview reset to factory defaults.');
    }
  };

  // Handlers for BNCCO 1
  const handleSaveBncco1 = (e: React.FormEvent) => {
    e.preventDefault();
    updateBncco1Message(bncco1Form);
    showToast('Message from BNCCO 1 saved successfully!');
  };

  const handleResetBncco1 = () => {
    if (confirm('Reset BNCCO 1 message to default?')) {
      resetBncco1Message();
      setBncco1Form(bncco1Message);
      showToast('BNCCO 1 message reset to default.');
    }
  };

  // Handlers for BNCCO 2
  const handleSaveBncco2 = (e: React.FormEvent) => {
    e.preventDefault();
    updateBncco2Message(bncco2Form);
    showToast('Message from BNCCO 2 saved successfully!');
  };

  const handleResetBncco2 = () => {
    if (confirm('Reset BNCCO 2 message to default?')) {
      resetBncco2Message();
      setBncco2Form(bncco2Message);
      showToast('BNCCO 2 message reset to default.');
    }
  };

  // Handlers for Platoon Commander
  const handleSaveCommander = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatoonCommanderMessage(commanderForm);
    showToast('Message from Platoon Commander saved successfully!');
  };

  const handleResetCommander = () => {
    if (confirm('Reset Platoon Commander message to default?')) {
      resetPlatoonCommanderMessage();
      setCommanderForm(platoonCommanderMessage);
      showToast('Platoon Commander message reset to default.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#1c1c18] text-[#eedc82] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#eedc82]/40 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              About Us Configuration
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Manage the "About Our Platoon" overview narrative and the 3 executive messages (2 BNCCOs and Platoon Commander).
          </p>
        </div>

        {/* Subtab Navigation */}
        <div className="flex flex-wrap items-center bg-[#f0eee8] dark:bg-[#141311] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] gap-1">
          <button
            onClick={() => setActiveSubtab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'overview'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>About Our Platoon</span>
          </button>
          <button
            onClick={() => setActiveSubtab('bncco1')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'bncco1'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>BNCCO 1 Message</span>
          </button>
          <button
            onClick={() => setActiveSubtab('bncco2')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'bncco2'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>BNCCO 2 Message</span>
          </button>
          <button
            onClick={() => setActiveSubtab('commander')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'commander'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Platoon Commander</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ABOUT OUR PLATOON OVERVIEW CONTROL */}
      {activeSubtab === 'overview' && (
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>About Our Platoon Narrative & Overview</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Configure the primary introduction, platoon history, regiment, room allocation, and organizational details.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetOverview}
              className="text-xs text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>

          <form onSubmit={handleSaveOverview} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Section Badge Label
                </label>
                <input
                  type="text"
                  required
                  value={overviewForm.badge}
                  onChange={(e) => setOverviewForm({ ...overviewForm, badge: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Main Heading / Title
                </label>
                <input
                  type="text"
                  required
                  value={overviewForm.title}
                  onChange={(e) => setOverviewForm({ ...overviewForm, title: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Subtitle / Battalion Affiliation
              </label>
              <input
                type="text"
                value={overviewForm.subtitle}
                onChange={(e) => setOverviewForm({ ...overviewForm, subtitle: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Establishment Tag
                </label>
                <input
                  type="text"
                  value={overviewForm.established}
                  onChange={(e) => setOverviewForm({ ...overviewForm, established: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Platoon Motto Tag
                </label>
                <input
                  type="text"
                  value={overviewForm.motto}
                  onChange={(e) => setOverviewForm({ ...overviewForm, motto: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                About Our Platoon Historical Narrative (Paragraphs separated by blank line)
              </label>
              <textarea
                rows={9}
                required
                value={overviewForm.content}
                onChange={(e) => setOverviewForm({ ...overviewForm, content: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="japandi-btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Platoon Overview</span>
              </button>
            </div>
          </form>

          {/* Live Preview Box */}
          <div className="p-4 bg-[#f6f3ed]/60 dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6b5e10] dark:text-[#eedc82]">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview (Public About Us Page Top Section)</span>
            </div>
            <div className="p-4 bg-white dark:bg-[#1f1e1a] rounded-xl border border-[#cdc6b3]/30 space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-[#eedc82] text-[#1c1c18] font-bold text-[10px] rounded-full uppercase">
                {overviewForm.badge || 'About Our Platoon'}
              </span>
              <h4 className="font-extrabold text-base text-[#1c1c18] dark:text-[#fcfbf7]">
                {overviewForm.title}
              </h4>
              <p className="text-xs text-[#6b5e10] dark:text-[#eedc82] font-semibold">
                {overviewForm.subtitle}
              </p>
              <div className="space-y-1.5 pt-1 text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed">
                {overviewForm.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BNCCO 1 MESSAGE CONTROL */}
      {activeSubtab === 'bncco1' && (
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Message from BNCCO (Officer 1) Control</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Configure executive message, quote, title, and Cloudinary photograph for BNCC Officer 1.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetBncco1}
              className="text-xs text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>

          <form onSubmit={handleSaveBncco1} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 p-3 bg-[#eedc82]/15 border border-[#cdc6b3]/50 rounded-2xl">
              <input
                type="checkbox"
                id="bncco1Enabled"
                checked={bncco1Form.enabled !== false}
                onChange={(e) => setBncco1Form({ ...bncco1Form, enabled: e.target.checked })}
                className="rounded text-[#6b5e10]"
              />
              <label htmlFor="bncco1Enabled" className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                Display this BNCCO Message on the public About Us page
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Officer Full Name & Military/Academic Title *
                </label>
                <input
                  type="text"
                  required
                  value={bncco1Form.name}
                  onChange={(e) => setBncco1Form({ ...bncco1Form, name: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Official Designation *
                </label>
                <input
                  type="text"
                  required
                  value={bncco1Form.designation}
                  onChange={(e) => setBncco1Form({ ...bncco1Form, designation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-semibold text-[#6b5e10] dark:text-[#eedc82]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Academic Department / Sub-designation
                </label>
                <input
                  type="text"
                  value={bncco1Form.subDesignation}
                  onChange={(e) => setBncco1Form({ ...bncco1Form, subDesignation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Regiment Badge / Unit Tag
                </label>
                <input
                  type="text"
                  value={bncco1Form.badge || ''}
                  onChange={(e) => setBncco1Form({ ...bncco1Form, badge: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Cloudinary Image Uploader for Officer Photo */}
            <div>
              <CloudinaryUploader
                label="BNCCO Officer 1 Photograph (Cloudinary Upload)"
                value={bncco1Form.photoUrl}
                currentImageUrl={bncco1Form.photoUrl}
                folder="officers"
                onChange={(url) => setBncco1Form({ ...bncco1Form, photoUrl: url })}
                onUploadComplete={(url) => setBncco1Form({ ...bncco1Form, photoUrl: url })}
                helpText="Upload officer photo via Cloudinary CDN. Displays on the About Us page message section."
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Officer Quote / Core Thought (Enclosed in quotes)
              </label>
              <textarea
                rows={2}
                value={bncco1Form.quote}
                onChange={(e) => setBncco1Form({ ...bncco1Form, quote: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Full Message Body *
              </label>
              <textarea
                rows={5}
                required
                value={bncco1Form.message}
                onChange={(e) => setBncco1Form({ ...bncco1Form, message: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="japandi-btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save BNCCO 1 Message</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: BNCCO 2 MESSAGE CONTROL */}
      {activeSubtab === 'bncco2' && (
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Message from BNCCO (Officer 2) Control</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Configure executive message, quote, title, and Cloudinary photograph for BNCC Officer 2.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetBncco2}
              className="text-xs text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>

          <form onSubmit={handleSaveBncco2} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 p-3 bg-[#eedc82]/15 border border-[#cdc6b3]/50 rounded-2xl">
              <input
                type="checkbox"
                id="bncco2Enabled"
                checked={bncco2Form.enabled !== false}
                onChange={(e) => setBncco2Form({ ...bncco2Form, enabled: e.target.checked })}
                className="rounded text-[#6b5e10]"
              />
              <label htmlFor="bncco2Enabled" className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                Display this BNCCO Message on the public About Us page
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Officer Full Name & Military/Academic Title *
                </label>
                <input
                  type="text"
                  required
                  value={bncco2Form.name}
                  onChange={(e) => setBncco2Form({ ...bncco2Form, name: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Official Designation *
                </label>
                <input
                  type="text"
                  required
                  value={bncco2Form.designation}
                  onChange={(e) => setBncco2Form({ ...bncco2Form, designation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-semibold text-[#6b5e10] dark:text-[#eedc82]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Academic Department / Sub-designation
                </label>
                <input
                  type="text"
                  value={bncco2Form.subDesignation}
                  onChange={(e) => setBncco2Form({ ...bncco2Form, subDesignation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Regiment Badge / Unit Tag
                </label>
                <input
                  type="text"
                  value={bncco2Form.badge || ''}
                  onChange={(e) => setBncco2Form({ ...bncco2Form, badge: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Cloudinary Image Uploader for Officer Photo */}
            <div>
              <CloudinaryUploader
                label="BNCCO Officer 2 Photograph (Cloudinary Upload)"
                value={bncco2Form.photoUrl}
                currentImageUrl={bncco2Form.photoUrl}
                folder="officers"
                onChange={(url) => setBncco2Form({ ...bncco2Form, photoUrl: url })}
                onUploadComplete={(url) => setBncco2Form({ ...bncco2Form, photoUrl: url })}
                helpText="Upload officer photo via Cloudinary CDN. Displays on the About Us page message section."
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Officer Quote / Core Thought (Enclosed in quotes)
              </label>
              <textarea
                rows={2}
                value={bncco2Form.quote}
                onChange={(e) => setBncco2Form({ ...bncco2Form, quote: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Full Message Body *
              </label>
              <textarea
                rows={5}
                required
                value={bncco2Form.message}
                onChange={(e) => setBncco2Form({ ...bncco2Form, message: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="japandi-btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save BNCCO 2 Message</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 4: PLATOON COMMANDER MESSAGE CONTROL */}
      {activeSubtab === 'commander' && (
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Message from Platoon Commander Control</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Configure the Platoon Commander (PUO) address, quote, rank, and Cloudinary official photograph.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetCommander}
              className="text-xs text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>

          <form onSubmit={handleSaveCommander} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 p-3 bg-[#eedc82]/15 border border-[#cdc6b3]/50 rounded-2xl">
              <input
                type="checkbox"
                id="commanderEnabled"
                checked={commanderForm.enabled !== false}
                onChange={(e) => setCommanderForm({ ...commanderForm, enabled: e.target.checked })}
                className="rounded text-[#6b5e10]"
              />
              <label htmlFor="commanderEnabled" className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                Display Platoon Commander Message on the public About Us page
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Commander Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={commanderForm.name}
                  onChange={(e) => setCommanderForm({ ...commanderForm, name: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Official Designation (PUO / Rank) *
                </label>
                <input
                  type="text"
                  required
                  value={commanderForm.designation}
                  onChange={(e) => setCommanderForm({ ...commanderForm, designation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-semibold text-[#6b5e10] dark:text-[#eedc82]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  College Department / Academic Post
                </label>
                <input
                  type="text"
                  value={commanderForm.subDesignation}
                  onChange={(e) => setCommanderForm({ ...commanderForm, subDesignation: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Badge / Title Label
                </label>
                <input
                  type="text"
                  value={commanderForm.badge || ''}
                  onChange={(e) => setCommanderForm({ ...commanderForm, badge: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Cloudinary Image Uploader for Platoon Commander */}
            <div>
              <CloudinaryUploader
                label="Platoon Commander Photograph (Cloudinary Upload)"
                value={commanderForm.photoUrl}
                currentImageUrl={commanderForm.photoUrl}
                folder="officers"
                onChange={(url) => setCommanderForm({ ...commanderForm, photoUrl: url })}
                onUploadComplete={(url) => setCommanderForm({ ...commanderForm, photoUrl: url })}
                helpText="Upload commander photo via Cloudinary CDN. Replaces the former public-page avatar upload."
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Commander Quote (In quotation marks)
              </label>
              <textarea
                rows={2}
                value={commanderForm.quote}
                onChange={(e) => setCommanderForm({ ...commanderForm, quote: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Full Message Body *
              </label>
              <textarea
                rows={5}
                required
                value={commanderForm.message}
                onChange={(e) => setCommanderForm({ ...commanderForm, message: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="japandi-btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Platoon Commander Message</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
