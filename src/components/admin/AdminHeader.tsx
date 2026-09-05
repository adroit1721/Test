import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { AdminMenuKey } from '../../types';
import {
  Shield,
  ExternalLink,
  KeyRound,
  LogOut,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
} from 'lucide-react';
import { ASSETS } from '../../data/bnccData';

interface AdminHeaderProps {
  activeTab?: AdminMenuKey;
  onReturnToPublic?: () => void;
  onViewPublicSite?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onToggleMobileMenu?: () => void;
}

const TAB_INFO: Record<AdminMenuKey, { label: string; desc: string }> = {
  home: { label: 'Home Page', desc: 'Slider images, notice tickers & welcome message' },
  about: { label: 'About Us', desc: 'Custom sections & rank hierarchy structure' },
  training: { label: 'Trainings & Events', desc: 'Training schedules & custom registration forms' },
  notices: { label: 'Notice & Blogs', desc: 'Official circulars, PDF orders & cadet articles' },
  memories: { label: 'Memories Gallery', desc: 'High-resolution photo albums & training videos' },
  cadets: { label: 'Cadet Corner', desc: 'Cadet roster, profile records & online registration' },
  honor: { label: 'Honor Board', desc: 'Company commanders, CUOs & merit accolades' },
  contact: { label: 'Contact & Inbox', desc: 'HQ coordinates & public contact submissions' },
  recruitment: { label: 'Cadet Recruitment', desc: 'Application pipeline & selected list export' },
  footer: { label: 'Footer Config', desc: 'Campus links, BNCC helpline & social media' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab = 'home',
  onReturnToPublic,
  onViewPublicSite,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileMenu,
}) => {
  const { servicePin, changeServicePin, logoutAdmin } = useAdminData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const activeTabMeta = TAB_INFO[activeTab] || TAB_INFO.home;

  const handleReturnToPublic = () => {
    if (typeof onReturnToPublic === 'function') onReturnToPublic();
    if (typeof onViewPublicSite === 'function') onViewPublicSite();
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logoutAdmin();
    if (typeof onLogout === 'function') onLogout();
    handleReturnToPublic();
  };

  // Change PIN form state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);

    if (newPin !== confirmPin) {
      setPinFeedback({ type: 'error', text: 'New PIN and Confirm PIN do not match.' });
      return;
    }

    const result = changeServicePin(oldPin, newPin);
    if (result.success) {
      setPinFeedback({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowChangePinModal(false);
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setPinFeedback(null);
      }, 1500);
    } else {
      setPinFeedback({ type: 'error', text: result.message });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fcf9f3]/95 dark:bg-[#181714]/95 backdrop-blur-md border-b border-[#cdc6b3]/60 dark:border-[#423e35] px-4 md:px-8 py-3 flex items-center justify-between transition-colors shadow-2xs">
      {/* Brand / Active Module Context */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#f6f3ed] dark:bg-[#23211c] border border-[#cdc6b3] dark:border-[#423e35] text-[#1c1c18] dark:text-[#fcfbf7] hover:bg-[#eedc82]/30 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile View Title */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#eedc82] flex items-center justify-center text-[#1c1c18] font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] truncate max-w-[140px]">
              {activeTabMeta.label}
            </h1>
            <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] font-medium">
              Command HQ
            </span>
          </div>
        </div>

        {/* Desktop Breadcrumb & Module Heading */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7c7767] dark:text-[#aca596]">
              Command HQ /
            </span>
            <h1 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
              {activeTabMeta.label}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#eedc82] text-[#1c1c18]">
              Active Module
            </span>
          </div>
          <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
            {activeTabMeta.desc}
          </p>
        </div>
      </div>

      {/* Action Buttons & Profile Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Switch to Public View */}
        <button
          onClick={handleReturnToPublic}
          className="japandi-btn-secondary text-xs py-1.5 px-3 bg-[#f6f3ed] dark:bg-[#23211c] border-[#cdc6b3] dark:border-[#423e35] flex items-center gap-1.5 cursor-pointer hover:border-[#6b5e10]"
          title="Return to Public View"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
          <span className="hidden md:inline">View Public Website</span>
        </button>

        {/* Top Right Corner Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#f6f3ed] dark:bg-[#23211c] border border-[#cdc6b3] dark:border-[#423e35] hover:border-[#6b5e10] transition-all cursor-pointer shadow-xs"
            title="Admin Profile & PIN settings"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#cdc6b3] dark:border-[#eedc82] bg-[#eedc82]/30 flex items-center justify-center">
              <img
                src={ASSETS.puoRahman}
                alt="Command Officer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <User className="w-4 h-4 text-[#6b5e10]" />
            </div>
            <div className="text-left hidden lg:block leading-tight">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">PUO Office</span>
              <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] font-mono">PIN: {servicePin}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl p-4 shadow-xl z-50 space-y-3 animate-fadeIn">
              <div className="border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
                <p className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Command Administrator</p>
                <p className="text-[11px] text-[#695c4e] dark:text-[#aca596]">Md. Abdul Matin (PUO)</p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] bg-[#f6f3ed] dark:bg-[#141311] px-2.5 py-1 rounded-lg border border-[#cdc6b3]/40 dark:border-[#333]">
                  <span className="text-[#7c7767] dark:text-[#aca596]">Active Service PIN:</span>
                  <span className="font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">{servicePin}</span>
                </div>
              </div>

              <div className="space-y-1">
                {/* Change Service PIN Trigger */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowChangePinModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] hover:bg-[#eedc82]/30 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Change Service PIN</span>
                </button>

                {/* Logout Trigger */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Admin Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Service PIN Dialog */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">Change Admin Panel PIN</h4>
              </div>
              <button
                onClick={() => {
                  setShowChangePinModal(false);
                  setPinFeedback(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pinFeedback.type === 'success'
                    ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-red-100/80 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-300 dark:border-red-800'
                }`}
              >
                {pinFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{pinFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Current PIN (Default: 1721)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current 4-digit PIN"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none font-mono text-center tracking-widest text-[#1c1c18] dark:text-[#fcfbf7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  New Service PIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none font-mono text-center tracking-widest text-[#1c1c18] dark:text-[#fcfbf7]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new 4-digit PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none font-mono text-center tracking-widest text-[#1c1c18] dark:text-[#fcfbf7]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="japandi-btn-secondary text-xs w-1/2 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs w-1/2 py-2 cursor-pointer font-bold"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
