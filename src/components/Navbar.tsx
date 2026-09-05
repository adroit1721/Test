import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TabType } from '../types';
import { Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenJoinModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenJoinModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Parallax / Scroll detection for sticky navigation elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exactly the 8 requested navigation items + Join Us Button
  const navLinks: { id: TabType; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'training', label: 'Trainings & Events' },
    { id: 'notices', label: 'Notice & Blogs' },
    { id: 'memories', label: 'Memories' },
    { id: 'cadets', label: 'Cadets Corner' },
    { id: 'honor', label: 'Honor Board' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`sticky top-2 z-50 max-w-[1120px] mx-auto px-3 sm:px-4 w-full mb-4 sm:mb-6 transition-all duration-300 ${
        isScrolled ? 'translate-y-0 shadow-md' : 'translate-y-0 shadow-xs'
      }`}
    >
      <nav
        className={`w-full rounded-2xl md:rounded-full min-h-[44px] md:min-h-[64px] flex flex-col justify-center transition-all duration-300 border ${
          isScrolled
            ? 'bg-[#fcf9f3]/40 dark:bg-[#12110e]/40 backdrop-blur-2xl backdrop-saturate-180 border-[#cdc6b3]/40 dark:border-white/10 py-1 px-3 md:py-3 md:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]'
            : 'bg-[#fcf9f3]/30 dark:bg-[#12110e]/30 backdrop-blur-2xl backdrop-saturate-180 border-[#cdc6b3]/30 dark:border-white/8 py-1 px-3 md:py-3.5 md:px-6 shadow-[0_6px_24px_0_rgba(0,0,0,0.03)] dark:shadow-[0_6px_28px_0_rgba(0,0,0,0.35)]'
        }`}
      >
        {/* Desktop Navigation Items */}
        <div className="hidden lg:flex items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-1 xl:gap-2 flex-1 justify-start">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-[13px] xl:text-sm font-semibold transition-all px-3.5 py-2.5 xl:px-4 rounded-full whitespace-nowrap cursor-pointer min-h-[42px] flex items-center justify-center ${
                    isActive
                      ? 'text-[#1c1c18] dark:text-[#faec9c] font-bold bg-[#eedc82]/85 dark:bg-[#eedc82]/20 backdrop-blur-md border border-[#6b5e10]/30 dark:border-[#eedc82]/40 shadow-xs scale-102'
                      : 'text-[#4a4738] dark:text-[#d4cec1] hover:text-[#1c1c18] dark:hover:text-[#ffffff] hover:bg-black/5 dark:hover:bg-white/8'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* 9. Join Us Button */}
          <div className="shrink-0 pl-2">
            <button
              id="btn-join-us-nav"
              onClick={onOpenJoinModal}
              className={`py-2.5 px-5 xl:px-6 rounded-full text-[13px] xl:text-sm font-bold cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1.5 min-h-[42px] backdrop-blur-md ${
                activeTab === 'recruitment'
                  ? 'bg-[#eedc82] text-[#1c1c18] border-2 border-[#6b5e10] dark:border-[#eedc82] shadow-md ring-2 ring-[#eedc82]/50 scale-102 font-extrabold'
                  : 'bg-[#eedc82]/90 hover:bg-[#eedc82] dark:bg-[#eedc82]/85 dark:hover:bg-[#eedc82] text-[#1c1c18] dark:text-[#141310] border border-[#6b5e10]/30 dark:border-[#eedc82]/50'
              }`}
            >
              <span>Join Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Medium Screen Navigation (Tablet & Small Laptops) */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-2 overflow-x-auto scrollbar-hide py-1">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-md-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-xs md:text-[13px] font-semibold transition-all px-3 py-2 rounded-full whitespace-nowrap cursor-pointer min-h-[38px] flex items-center justify-center ${
                    isActive
                      ? 'text-[#1c1c18] dark:text-[#faec9c] font-bold bg-[#eedc82]/85 dark:bg-[#eedc82]/20 backdrop-blur-md border border-[#6b5e10]/30 dark:border-[#eedc82]/40 shadow-xs'
                      : 'text-[#4a4738] dark:text-[#d4cec1] hover:bg-black/5 dark:hover:bg-white/8 dark:hover:text-[#ffffff]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* 9. Join Us Button */}
          <button
            id="btn-join-us-nav-md"
            onClick={onOpenJoinModal}
            className="bg-[#eedc82]/90 hover:bg-[#eedc82] dark:bg-[#eedc82]/85 dark:hover:bg-[#eedc82] text-[#1c1c18] dark:text-[#141310] border border-[#6b5e10]/30 dark:border-[#eedc82]/50 py-2 px-4 rounded-full text-xs md:text-[13px] font-bold shrink-0 ml-1 cursor-pointer whitespace-nowrap min-h-[38px] flex items-center gap-1 shadow-xs backdrop-blur-md"
          >
            <span>Join Us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Header Bar */}
        <div className="flex md:hidden items-center justify-between px-1 py-1 min-h-[44px]">
          <button
            id="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-[#1c1c18] dark:text-[#fcfbf7] hover:bg-black/5 dark:hover:bg-white/8 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            id="btn-mobile-join-pill"
            onClick={onOpenJoinModal}
            className="bg-[#eedc82]/90 dark:bg-[#eedc82]/85 text-[#1c1c18] dark:text-[#141310] border border-[#6b5e10]/30 dark:border-[#eedc82]/50 py-1.5 px-4 rounded-full text-xs font-bold cursor-pointer shadow-xs min-h-[36px] flex items-center gap-1.5 backdrop-blur-md"
          >
            <span>Join Us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-3 pt-3 border-t border-[#cdc6b3]/30 dark:border-white/10 flex flex-col space-y-1"
          >
            {navLinks.map((link, index) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`mobile-nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left text-xs font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#eedc82]/85 dark:bg-[#eedc82]/20 text-[#1c1c18] dark:text-[#faec9c] font-bold border border-transparent dark:border-[#eedc82]/30 shadow-xs'
                      : 'text-[#1c1c18] dark:text-[#d4cec1] hover:bg-black/5 dark:hover:bg-white/8'
                  }`}
                >
                  <span>{`${index + 1}. ${link.label}`}</span>
                  {isActive && <span className="text-[10px] uppercase font-bold tracking-wider">Active</span>}
                </button>
              );
            })}

            <div className="pt-2">
              <button
                id="btn-mobile-join-action"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoinModal();
                }}
                className="w-full bg-[#eedc82]/90 hover:bg-[#eedc82] dark:bg-[#eedc82]/85 dark:hover:bg-[#eedc82] text-[#1c1c18] dark:text-[#141310] font-bold py-2.5 rounded-full text-center border border-[#6b5e10]/30 dark:border-[#eedc82]/50 text-xs shadow-xs backdrop-blur-md"
              >
                9. Join Us (Enrollment Form)
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </div>
  );
};
