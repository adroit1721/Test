import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminMenuKey } from '../../types';

// Tab imports
import { HomeTab } from './tabs/HomeTab';
import { AboutTab } from './tabs/AboutTab';
import { TrainingTab } from './tabs/TrainingTab';
import { NoticesBlogsTab } from './tabs/NoticesBlogsTab';
import { MemoriesTab } from './tabs/MemoriesTab';
import { CadetCornerTab } from './tabs/CadetCornerTab';
import { HonorBoardTab } from './tabs/HonorBoardTab';
import { ContactTab } from './tabs/ContactTab';
import { RecruitmentTab } from './tabs/RecruitmentTab';

interface AdminViewProps {
  onLogout: () => void;
  onViewPublicSite: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onLogout,
  onViewPublicSite,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuKey>('home');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'about':
        return <AboutTab />;
      case 'training':
        return <TrainingTab />;
      case 'notices':
        return <NoticesBlogsTab />;
      case 'memories':
        return <MemoriesTab />;
      case 'cadets':
        return <CadetCornerTab />;
      case 'honor':
        return <HonorBoardTab />;
      case 'contact':
        return <ContactTab />;
      case 'recruitment':
        return <RecruitmentTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#12110e] text-[#1c1c18] dark:text-[#fcfbf7] flex font-sans transition-colors duration-300">
      {/* Standard Full-Height Docked Left Sidebar (Sticky on desktop, drawer on mobile) */}
      <AdminSidebar
        activeMenu={activeTab}
        activeTab={activeTab}
        onSelectMenu={setActiveTab}
        onSelectTab={setActiveTab}
        onViewPublic={onViewPublicSite}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Admin Workspace (Sticky Header + Fluid Content Canvas) */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          activeTab={activeTab}
          onLogout={onLogout}
          onViewPublicSite={onViewPublicSite}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        />

        {/* Tab Content Canvas */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto pb-20 animate-fadeIn">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};
