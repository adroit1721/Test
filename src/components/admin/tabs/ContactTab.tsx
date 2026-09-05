import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { ContactConfig, ContactMessage } from '../../../types';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Inbox,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  MessageSquare,
} from 'lucide-react';

export const ContactTab: React.FC = () => {
  const {
    contactConfig,
    updateContactConfig,
    contactMessages,
    markContactMessageRead,
    deleteContactMessage,
  } = useAdminData();

  // Active subtab: 'inbox' | 'config'
  const [activeSubtab, setActiveSubtab] = useState<'inbox' | 'config'>('inbox');

  const [form, setForm] = useState<ContactConfig>(contactConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const unreadCount = contactMessages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <PhoneCall className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Contact HQ & Messages Inbox
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Update platoon headquarters contact phone numbers, emails, addresses, and review inquiries submitted by visitors.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center bg-[#f0eee8] dark:bg-[#141311] p-1 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
          <button
            onClick={() => setActiveSubtab('inbox')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'inbox'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            <span>Submitted Messages</span>
            <span className="bg-[#1c1c18] text-[#eedc82] px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {contactMessages.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubtab('config')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'config'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            Contact Details & Address
          </button>
        </div>
      </div>

      {/* SUBTAB 1: INBOX */}
      {activeSubtab === 'inbox' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Contact Inquiries ({unreadCount} unread)</span>
            </h3>
          </div>

          {contactMessages.length === 0 ? (
            <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl p-8 text-center text-xs text-[#7c7767]">
              No messages received yet. Inquiries submitted via the Contact page form will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-2xl p-5 shadow-2xs transition-all space-y-2.5 ${
                    msg.isRead
                      ? 'bg-[#fcf9f3] dark:bg-[#1e1d19] border-[#cdc6b3]/40 dark:border-[#423e35]'
                      : 'bg-[#fffefb] dark:bg-[#23211c] border-[#eedc82] dark:border-[#6b5e10] ring-1 ring-[#eedc82]/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/30 dark:border-[#333] pb-2.5">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#6b5e10] dark:bg-[#eedc82]" />
                      )}
                      <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                        {msg.name}
                      </h4>
                      <span className="text-[11px] text-[#7c7767]">&lt;{msg.email}&gt;</span>
                      {msg.phone && (
                        <span className="text-[11px] font-mono text-[#695c4e] dark:text-[#aca596] bg-[#f0eee8] dark:bg-[#141311] px-1.5 py-0.5 rounded">
                          {msg.phone}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#7c7767]">{msg.timestamp}</span>
                  </div>

                  {msg.subject && (
                    <p className="text-xs font-bold text-[#6b5e10] dark:text-[#eedc82]">
                      Subject: {msg.subject}
                    </p>
                  )}

                  <p className="text-xs text-[#555042] dark:text-[#cdc6b3] leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#cdc6b3]/30 dark:border-[#333]">
                    {!msg.isRead && (
                      <button
                        onClick={() => markContactMessageRead(msg.id)}
                        className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Mark as Read</span>
                      </button>
                    )}
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'NGDC BNCC Platoon')}`}
                      className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Reply by Email</span>
                    </a>
                    <button
                      onClick={() => {
                        if (confirm('Delete this message?')) {
                          deleteContactMessage(msg.id);
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
          )}
        </div>
      )}

      {/* SUBTAB 2: CONFIGURATION */}
      {activeSubtab === 'config' && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs max-w-3xl"
        >
          <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
            <h3 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7]">
              Headquarters Address & Hotline Details
            </h3>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Updated!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Platoon Title
              </label>
              <input
                type="text"
                required
                value={form.addressTitle}
                onChange={(e) => setForm({ ...form, addressTitle: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Room & Building Location
              </label>
              <input
                type="text"
                required
                value={form.roomAndBuilding}
                onChange={(e) => setForm({ ...form, roomAndBuilding: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
              Full Postal Address
            </label>
            <input
              type="text"
              required
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Primary Phone / Mobile
              </label>
              <input
                type="text"
                required
                value={form.phonePrimary}
                onChange={(e) => setForm({ ...form, phonePrimary: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Secondary Phone / Hotline
              </label>
              <input
                type="text"
                value={form.phoneSecondary}
                onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Primary Official Email
              </label>
              <input
                type="email"
                required
                value={form.emailPrimary}
                onChange={(e) => setForm({ ...form, emailPrimary: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                PUO / Commander Direct Email
              </label>
              <input
                type="email"
                value={form.emailSecondary || ''}
                onChange={(e) => setForm({ ...form, emailSecondary: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
              Office Hours & Parade Timings
            </label>
            <input
              type="text"
              required
              value={form.officeHours}
              onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="japandi-btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Contact Details</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
