import React from 'react';
import { AdminMenuKey } from '../../types';
import {
  Home,
  Info,
  CalendarDays,
  FileText,
  Image,
  Users,
  Award,
  PhoneCall,
  UserPlus,
  LayoutTemplate,
  ChevronRight,
  Shield,
  X,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  activeMenu?: AdminMenuKey;
  activeTab?: AdminMenuKey;
  onSelectMenu?: (menu: AdminMenuKey) => void;
  onSelectTab?: (menu: AdminMenuKey) => void;
  onViewPublic?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  key: AdminMenuKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
  desc: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'home', label: 'Home Page', icon: Home, desc: 'Slider images & headings' },
  { key: 'about', label: 'About Us', icon: Info, desc: 'Custom sections & rank hierarchy' },
  { key: 'training', label: 'Trainings & Events', icon: CalendarDays, desc: 'Announcements & form builder' },
  { key: 'notices', label: 'Notice & Blogs', icon: FileText, desc: 'PDF circulars & articles' },
  { key: 'memories', label: 'Memories Gallery', icon: Image, desc: 'Photo & video gallery' },
  { key: 'cadets', label: 'Cadet Corner', icon: Users, desc: 'Registration form & directory' },
  { key: 'honor', label: 'Honor Board', icon: Award, desc: '3 categories tab view' },
  { key: 'contact', label: 'Contact & Inbox', icon: PhoneCall, desc: 'Contact info & inbox' },
  { key: 'recruitment', label: 'Cadet Recruitment', icon: UserPlus, desc: 'Join Us form & Excel export' },
  { key: 'footer', label: 'Footer Config', icon: LayoutTemplate, desc: 'Social & campus links' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeMenu,
  activeTab,
  onSelectMenu,
  onSelectTab,
  onViewPublic,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const currentKey = activeMenu || activeTab || 'home';

  const handleSelect = (key: AdminMenuKey) => {
    if (typeof onSelectMenu === 'function') {
      onSelectMenu(key);
    }
    if (typeof onSelectTab === 'function') {
      onSelectTab(key);
    }
    if (typeof onCloseMobile === 'function') {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs animate-fadeIn"
          onClick={onCloseMobile}
        />
      )}

      {/* Standard Admin Sidebar: Fixed on mobile, Sticky full-height on desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 lg:w-70 shrink-0 bg-[#f6f3ed] dark:bg-[#181714] border-r border-[#cdc6b3]/60 dark:border-[#423e35] p-3.5 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding Area */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eedc82] text-[#1c1c18] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <h2 className="text-sm font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                NGDC BNCC
              </h2>
              <span className="text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] tracking-wider uppercase block">
                Command HQ
              </span>
            </div>
          </div>

          {/* Mobile Dismiss Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white hover:bg-[#ebe7de] dark:hover:bg-[#23211c] transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Middle Navigation Section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-1 space-y-1">
          <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest text-[#7c7767] dark:text-[#aca596]">
            Modules ({MENU_ITEMS.length})
          </div>

          {MENU_ITEMS.map((item) => {
            const isActive = currentKey === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left group ${
                  isActive
                    ? 'bg-[#eedc82] text-[#1c1c18] font-bold shadow-xs border border-[#d5c470]'
                    : 'text-[#4a4738] dark:text-[#cdc6b3] hover:bg-[#eae6dc] dark:hover:bg-[#23211c] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#1c1c18] text-[#eedc82]'
                        : 'bg-[#ebe7de] dark:bg-[#23211c] text-[#6b5e10] dark:text-[#eedc82] group-hover:bg-[#eedc82]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">{item.label}</span>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive ? 'translate-x-0.5 text-[#1c1c18]' : 'text-[#7c7767]/40 group-hover:translate-x-0.5'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Bottom Helper / Status Footer */}
        <div className="pt-3 mt-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35] space-y-2">
          {onViewPublic && (
            <button
              onClick={onViewPublic}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-[#4a4738] dark:text-[#cdc6b3] bg-[#ebe7de] dark:bg-[#23211c] hover:bg-[#eedc82]/30 hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] border border-[#cdc6b3]/60 dark:border-[#423e35] rounded-xl transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>View Public Website</span>
            </button>
          )}

          <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-[#7c7767] dark:text-[#8c8474] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>
            <span>HQ Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
