import React from 'react';
import { TabType } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { MapPin, Phone, Mail, ExternalLink, ShieldCheck, Shield } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
  onOpenAdminLogin: () => void;
  onOpenPrivacyModal: () => void;
  onOpenTermsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenAdminLogin,
  onOpenPrivacyModal,
  onOpenTermsModal,
}) => {
  const { footerConfig, contactConfig } = useAdminData();

  const handleNav = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="max-w-[1120px] mx-auto mt-14 sm:mt-18 mb-6 sm:mb-8 border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl md:rounded-3xl relative bg-transparent w-full pt-8 pb-6 px-5 sm:px-8 md:px-10 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {/* Col 1: Platoon Address & Contact */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#eedc82]/40 dark:bg-[#eedc82]/15 flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
              Platoon Address
            </h3>
          </div>

          <div className="space-y-2.5 text-xs sm:text-[13px] text-[#555042] dark:text-[#9e9788]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-[#1c1c18] dark:text-[#e4ded3] block">
                  {contactConfig.addressTitle || 'NGDC BNCC Platoon HQ'}
                </span>
                <span>{contactConfig.roomAndBuilding}</span>
                <span className="block">{contactConfig.fullAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
              <a
                href={`tel:${contactConfig.phonePrimary}`}
                className="hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors"
              >
                {contactConfig.phonePrimary} {contactConfig.phoneSecondary ? `/ ${contactConfig.phoneSecondary}` : ''}
              </a>
            </div>

            {footerConfig.emergencyPhone && (
              <div className="flex items-center gap-2.5 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Duty / Hotline: {footerConfig.emergencyPhone}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
              <a
                href={`mailto:${contactConfig.emailPrimary}`}
                className="hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors font-mono text-[11.5px]"
              >
                {contactConfig.emailPrimary}
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Important Links */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
            Important Links
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-[13px]">
            <li>
              <a
                href={footerConfig.collegeOfficialUrl || "https://ngdc.ac.bd"}
                target="_blank"
                rel="noreferrer"
                className="text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors inline-flex items-center gap-1.5 font-medium group"
              >
                <span>NGDC College Official Website</span>
                <ExternalLink className="w-3 h-3 text-[#8c8474] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors" />
              </a>
            </li>
            <li>
              <a
                href={footerConfig.bnccGovUrl || "https://bncc.info/"}
                target="_blank"
                rel="noreferrer"
                className="text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors inline-flex items-center gap-1.5 font-medium group"
              >
                <span>BNCC Official Directorate (Govt)</span>
                <ExternalLink className="w-3 h-3 text-[#8c8474] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors" />
              </a>
            </li>
            <li>
              <button
                id="footer-link-cadets"
                onClick={() => handleNav('cadets')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Cadets Corner & Directory
              </button>
            </li>
            <li>
              <button
                id="footer-link-training"
                onClick={() => handleNav('training')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Training Routines & Camps
              </button>
            </li>
            <li>
              <button
                id="footer-link-honor"
                onClick={() => handleNav('honor')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Platoon Honor Board
              </button>
            </li>
            <li>
              <button
                id="footer-link-notices"
                onClick={() => handleNav('notices')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Notice Board & Blogs
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Legal & Policy */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
            Legal & Policy
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-[13px]">
            <li>
              <button
                id="footer-link-privacy"
                onClick={onOpenPrivacyModal}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                id="footer-link-terms"
                onClick={onOpenTermsModal}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                id="footer-link-bncc-act"
                onClick={() => handleNav('about')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                BNCC Act 2016 Guidelines
              </button>
            </li>
            <li>
              <button
                id="footer-link-code"
                onClick={() => handleNav('about')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Cadet Code of Conduct
              </button>
            </li>
            <li>
              <button
                id="footer-link-bylaws"
                onClick={() => handleNav('about')}
                className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
              >
                Platoon Standard By-laws
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Follow Us / Social Links with original icons & hover */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
            Follow Us
          </h4>
          <p className="text-xs text-[#695c4e] dark:text-[#8f887a]">
            Connect with our platoon on official social channels:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs sm:text-[13px]">
            {/* Facebook */}
            <a
              href={footerConfig.facebookUrl || "https://www.facebook.com/ngdcbncc"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-1.5 rounded-lg text-[#555042] dark:text-[#9e9788] hover:text-[#1877F2] dark:hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all group"
            >
              <span className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#1a1915] border border-transparent dark:border-white/5 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform shadow-2xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
              <span className="font-medium">Facebook</span>
            </a>

            {/* X.com (Twitter) */}
            <a
              href={footerConfig.twitterUrl || "https://x.com"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-1.5 rounded-lg text-[#555042] dark:text-[#9e9788] hover:text-black dark:hover:text-[#f0eee8] hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
            >
              <span className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#1a1915] border border-transparent dark:border-white/5 flex items-center justify-center text-[#1c1c18] dark:text-[#f0eee8] group-hover:scale-110 transition-transform shadow-2xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </span>
              <span className="font-medium">X (Twitter)</span>
            </a>

            {/* YouTube */}
            <a
              href={footerConfig.youtubeUrl || "https://youtube.com"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-1.5 rounded-lg text-[#555042] dark:text-[#9e9788] hover:text-[#FF0000] dark:hover:text-[#FF0000] hover:bg-[#FF0000]/10 transition-all group"
            >
              <span className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#1a1915] border border-transparent dark:border-white/5 flex items-center justify-center text-[#FF0000] group-hover:scale-110 transition-transform shadow-2xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </span>
              <span className="font-medium">YouTube</span>
            </a>

            {/* Instagram */}
            <a
              href={footerConfig.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-1.5 rounded-lg text-[#555042] dark:text-[#9e9788] hover:text-[#E1306C] dark:hover:text-[#E1306C] hover:bg-[#E1306C]/10 transition-all group"
            >
              <span className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#1a1915] border border-transparent dark:border-white/5 flex items-center justify-center text-[#E1306C] group-hover:scale-110 transition-transform shadow-2xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </span>
              <span className="font-medium">Instagram</span>
            </a>

            {/* LinkedIn (if configured) */}
            {footerConfig.linkedinUrl && (
              <a
                href={footerConfig.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-1.5 rounded-lg text-[#555042] dark:text-[#9e9788] hover:text-[#0A66C2] dark:hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all group"
              >
                <span className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#1a1915] border border-transparent dark:border-white/5 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 transition-transform shadow-2xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </span>
                <span className="font-medium">LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar with Centered Copyright & Stealth Admin Portal Login */}
      <div className="mt-8 pt-5 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex flex-col items-center justify-center text-center relative group/footerbottom">
        {/* Centered Copyright Text */}
        <p className="text-xs sm:text-[13px] text-[#695c4e] dark:text-[#8f887a] font-medium leading-relaxed max-w-2xl px-2">
          {footerConfig.copyrightText || `© ${new Date().getFullYear()} NGDC-BNCC Platoon, New Govt. Degree College, Rajshahi. All rights reserved.`}
        </p>

        {/* Subtle Platoon Motto */}
        <p className="text-[11px] text-[#8c8474] dark:text-[#706a5e] mt-1">
          {footerConfig.mottoText || 'Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা'}
        </p>

        {/* PUO / Cadet Admin Login button */}
        <div className="mt-2.5 min-h-[28px] flex items-center justify-center">
          <button
            id="btn-admin-login-footer"
            onClick={onOpenAdminLogin}
            className="opacity-0 group-hover/footerbottom:opacity-100 focus:opacity-100 hover:!opacity-100 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6b5e10] dark:text-[#faec9c] bg-[#f0eee8] dark:bg-[#1c1b17] hover:bg-[#eedc82]/30 dark:hover:bg-[#eedc82]/15 px-3 py-1 rounded-full transition-all duration-300 cursor-pointer border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs"
            title="Website Admin Panel"
            aria-label="PUO and Cadet Admin Login"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>PUO / Cadet Admin Login</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

