/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { TabType, NoticeItem, BlogItem, MemoryItem } from './types';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { TrainingEventsView } from './components/TrainingEventsView';
import { NoticeBlogsView } from './components/NoticeBlogsView';
import { MemoriesView } from './components/MemoriesView';
import { CadetsCornerView } from './components/CadetsCornerView';
import { HonorBoardView } from './components/HonorBoardView';
import { ContactView } from './components/ContactView';
import { RecruitmentView } from './components/RecruitmentView';
import { TopographicBackground } from './components/TopographicBackground';
import { AdminView } from './components/admin/AdminView';
import {
  NoticeDetailModal,
  BlogReaderModal,
  MemoryLightboxModal,
  JoinRecruitmentModal,
  CadetAuthModal,
  UniformGuideModal,
  AdminLoginModal,
} from './components/Modals';

export default function App() {
  const { activeTab, setActiveTab, selectedNotice, setSelectedNotice, selectedBlog, setSelectedBlog, selectedMemory, setSelectedMemory } = useAppStore(state => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    selectedNotice: state.selectedNotice,
    setSelectedNotice: state.setSelectedNotice,
    selectedBlog: state.selectedBlog,
    setSelectedBlog: state.setSelectedBlog,
    selectedMemory: state.selectedMemory,
    setSelectedMemory: state.setSelectedMemory,
  }));

  // Admin authentication state from store
  const { isAdminAuthenticated, setIsAdminAuthenticated, validateAdminToken } = useAppStore(state => ({
    isAdminAuthenticated: state.isAdminAuthenticated,
    setIsAdminAuthenticated: state.setIsAdminAuthenticated,
    validateAdminToken: state.validateAdminToken,
  }));

  // Default light theme (dark mode button removed)
  const isDarkMode = false;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.removeItem('ngdc_bncc_theme');
    }
  }, []);

  // Modals state from store
  const { isJoinModalOpen, setJoinModalOpen, isCadetAuthOpen, setCadetAuthOpen, isUniformModalOpen, setUniformModalOpen, isAdminLoginOpen, setAdminLoginOpen, showLegalModal, setShowLegalModal, showBackToTop, setShowBackToTop } = useAppStore(state => ({
    isJoinModalOpen: state.isJoinModalOpen,
    setJoinModalOpen: state.setJoinModalOpen,
    isCadetAuthOpen: state.isCadetAuthOpen,
    setCadetAuthOpen: state.setCadetAuthOpen,
    isUniformModalOpen: state.isUniformModalOpen,
    setUniformModalOpen: state.setUniformModalOpen,
    isAdminLoginOpen: state.isAdminLoginOpen,
    setAdminLoginOpen: state.setAdminLoginOpen,
    showLegalModal: state.showLegalModal,
    setShowLegalModal: state.setShowLegalModal,
    showBackToTop: state.showBackToTop,
    setShowBackToTop: state.setShowBackToTop,
  }));
  const [cadetAuthMode, setCadetAuthMode] = useState<'login' | 'register'>('login');

  // Monitor scroll for back-to-top floating button (updates store)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenCadetLogin = () => {
    setCadetAuthMode('login');
    setActiveTab('cadets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCadetRegister = () => {
    setCadetAuthMode('register');
    setActiveTab('cadets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If Admin is Authenticated, render the dedicated Admin Workspace
  if (isAdminAuthenticated) {
    return (
      <AdminView
        onLogout={() => {
          sessionStorage.removeItem('ngdc_admin_auth');
          setIsAdminAuthenticated(false);
        }}
        onViewPublicSite={() => {
          setIsAdminAuthenticated(false);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#eedc82] selection:text-[#1c1c18] bg-[#fcf9f3] text-[#1c1c18] relative">
      {/* Topographic Contours Background */}
      <TopographicBackground isDarkMode={false} />

      {/* Top Header with 2 Side Logos & Centered College Text */}
      <Header
        onNavigateHome={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Parallax Sticky Navigation Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJoinModal={() => {
          setActiveTab('recruitment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area with Page Motion Animation */}
      <main className="flex-grow pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <HomeView
                setActiveTab={setActiveTab}
                onSelectNotice={(notice) => setSelectedNotice(notice)}
                onSelectBlog={(blog) => setSelectedBlog(blog)}
                onSelectMemory={(memory) => setSelectedMemory(memory)}
                onOpenCadetLogin={handleOpenCadetLogin}
                onOpenCadetRegister={handleOpenCadetRegister}
              />
            )}

            {activeTab === 'about' && (
              <AboutView
                onOpenJoinModal={() => {
                  setActiveTab('recruitment');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'recruitment' && (
              <RecruitmentView setActiveTab={setActiveTab} />
            )}

            {activeTab === 'training' && <TrainingEventsView />}

            {activeTab === 'notices' && (
              <NoticeBlogsView
                onSelectNotice={(notice) => setSelectedNotice(notice)}
                onSelectBlog={(blog) => setSelectedBlog(blog)}
              />
            )}

            {activeTab === 'memories' && (
              <MemoriesView onSelectMemory={(memory) => setSelectedMemory(memory)} />
            )}

            {activeTab === 'cadets' && (
              <CadetsCornerView
                key={cadetAuthMode}
                initialAuthMode={cadetAuthMode}
              />
            )}

            {activeTab === 'honor' && <HonorBoardView />}

            {activeTab === 'contact' && <ContactView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="btn-back-to-top"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            title="Scroll to Top"
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#eedc82] dark:bg-[#eedc82] text-[#1c1c18] shadow-lg border border-[#d5c470] flex items-center justify-center cursor-pointer transition-shadow hover:shadow-xl"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenAdminLogin={() => {
          if (sessionStorage.getItem('ngdc_admin_auth') === 'true') {
            setIsAdminAuthenticated(true);
          } else {
            setAdminLoginOpen(true);
          }
        }}
        onOpenPrivacyModal={() => setShowLegalModal('Privacy Policy')}
        onOpenTermsModal={() => setShowLegalModal('Terms of Service')}
      />

      {/* Floating Shortcut to Return to Admin Panel if authenticated in session */}
      {typeof window !== 'undefined' && sessionStorage.getItem('ngdc_admin_auth') === 'true' && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            id="btn-return-admin-floating"
            onClick={() => setIsAdminAuthenticated(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#1c1c18] rounded-full shadow-lg border border-[#eedc82]/50 text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Return to Admin Panel</span>
          </button>
        </div>
      )}

      {/* Interactive Modals */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      <BlogReaderModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
      />

      <MemoryLightboxModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />

      <JoinRecruitmentModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      <CadetAuthModal
        isOpen={isCadetAuthOpen}
        initialMode={cadetAuthMode}
        onClose={() => setIsCadetAuthOpen(false)}
      />

      <UniformGuideModal
        isOpen={isUniformModalOpen}
        onClose={() => setIsUniformModalOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={() => {
          setAdminLoginOpen(false);
          setIsAdminAuthenticated(true);
        }}
      />

      {/* Legal Dialog */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1c1c18]">{showLegalModal}</h3>
            <p className="text-xs text-[#4a4738] leading-relaxed">
              This digital portal is maintained by the NGDC BNCC Platoon under the jurisdiction of the Bangladesh National Cadet Corps Act 2016. Cadet data, parade attendance, and officer circulars are strictly handled for educational and training purposes.
            </p>
            <button
              onClick={() => setShowLegalModal(null)}
              className="japandi-btn-secondary text-xs w-full mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
