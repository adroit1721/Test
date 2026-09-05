import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { RecruitmentApplicant, RecruitmentAnnouncementConfig, FormFieldConfig, RecruitmentSignatoriesConfig } from '../../types';
import { ASSETS } from '../../data/bnccData';
import { useAdminData } from '../../context/AdminDataContext';

interface RecruitmentApplicationSlipA4Props {
  applicant?: Partial<RecruitmentApplicant> | null;
  announcement?: RecruitmentAnnouncementConfig;
  formFields?: FormFieldConfig[];
  signatories?: RecruitmentSignatoriesConfig;
  isBlank?: boolean;
  onClose?: () => void;
}

// Format Date of Birth as "10 Feb 2005"
export const formatDateOfBirth = (dobStr?: string): string => {
  if (!dobStr) return '';
  const trimmed = dobStr.trim();
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) return trimmed;

  const parts = trimmed.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return trimmed;
};

export const RecruitmentApplicationSlipA4: React.FC<RecruitmentApplicationSlipA4Props> = ({
  applicant,
  announcement,
  signatories: propSignatories,
  isBlank = false,
  onClose,
}) => {
  const { recruitmentSignatories: contextSignatories, recruitmentAnnouncement } = useAdminData();
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');

  const activeAnnouncement = announcement || recruitmentAnnouncement;
  const sig = propSignatories || contextSignatories;
  const appData = applicant || {};

  useEffect(() => {
    document.body.classList.add('printing-slip-ready');
    return () => {
      document.body.classList.remove('printing-slip-ready');
      document.body.classList.remove('printing-slip');
    };
  }, []);

  // Direct, rock-solid 2-Page PDF file download using jsPDF + html2canvas
  // Captures page 1 and page 2 individually so it NEVER captures the website or freezes mobile browsers
  const handleDownloadPdf = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    setIsGeneratingPdf(true);
    setPdfStatus('Rendering Page 1 (Personal & Academic)...');

    try {
      const serial = appData.serialNo || appData.token || (isBlank ? 'Blank' : 'Application');
      const filename = `BNCC-Admission-Form-${serial}.pdf`;

      const imageOptions = {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      };

      // 1. Render Page 1
      const imgData1 = await htmlToImage.toJpeg(page1Ref.current, imageOptions);

      setPdfStatus('Rendering Page 2 (Pledge, Board Evaluation & Signatures)...');

      // 2. Render Page 2
      const imgData2 = await htmlToImage.toJpeg(page2Ref.current, imageOptions);

      setPdfStatus('Assembling 2-Page A4 PDF...');

      // 3. Assemble PDF using jsPDF (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      pdf.save(filename);
      setPdfStatus('PDF Downloaded successfully!');
      setTimeout(() => setPdfStatus(''), 2500);
    } catch (err) {
      console.error('Direct PDF download error:', err);
      setPdfStatus('Failed to generate PDF. Please try again.');
      setTimeout(() => setPdfStatus(''), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-slip');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-slip');
      }, 1000);
    }, 150);
  };

  // Helper to format values or return dotted placeholders
  const val = (text?: string | null, placeholderDots = '........................................................................') => {
    if (isBlank || !text || text.trim() === '') {
      return <span className="font-mono text-gray-400 select-none">{placeholderDots}</span>;
    }
    return <span className="font-bold text-black border-b border-black/70 pb-0.5 px-1">{text}</span>;
  };

  const isCheck = (target: string, current?: string) => {
    if (isBlank) return false;
    return current?.toLowerCase() === target.toLowerCase();
  };

  const modalContent = (
    <div
      id="recruitment-slip-portal"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-6 print:p-0 print:bg-white print:static recruitment-slip-modal-backdrop"
    >
      {/* Floating Action Controls - Hidden during physical print */}
      <div className="sticky top-3 z-[10000] mb-4 flex flex-wrap items-center justify-center gap-2.5 print:hidden bg-[#1c1c18]/95 text-white px-4 sm:px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20">
        <div className="flex items-center gap-2 pr-3 border-r border-white/20">
          <FileText className="w-5 h-5 text-[#eedc82]" />
          <span className="font-bold text-xs sm:text-sm tracking-wide">
            {isBlank ? 'Blank Printable Application Form' : 'Official Recruit Admission Form'}
          </span>
        </div>

        {/* Primary Direct Download PDF Button (Instant & Mobile Friendly) */}
        <button
          id="btn-download-slip"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 bg-[#eedc82] hover:bg-[#ffe885] disabled:opacity-75 text-[#1c1c18] font-black px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#1c1c18]" />
              <span>{pdfStatus || 'Generating PDF...'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download 2-Page PDF (A4)</span>
            </>
          )}
        </button>

        {/* System Print Dialog Button (Desktop / Printer) */}
        <button
          id="btn-print-slip"
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all border border-white/20 active:scale-95 cursor-pointer"
          title="Open system print dialog (for desktop printers)"
        >
          <Printer className="w-4 h-4 text-[#eedc82]" />
          <span>Print / System Dialog</span>
        </button>

        {onClose && (
          <button
            id="btn-close-slip"
            onClick={onClose}
            className="p-2 text-[#cdc6b3] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {pdfStatus && !isGeneratingPdf && (
        <div className="mb-3 px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 animate-fadeIn print:hidden">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{pdfStatus}</span>
        </div>
      )}

      {/* Printable Document Container - Strictly Exactly 2 Pages */}
      <div
        id="official-recruitment-a4-document"
        className="w-full max-w-[210mm] text-[#1c1c18] font-sans text-[12px] leading-snug print:w-[210mm] print:max-w-none print:p-0"
      >
        {/* =========================================================================
            PAGE 1: PERSONAL & ACADEMIC PARTICULARS (Items 1 - 20)
            Carefully balanced vertical spacing to fill A4 sheet naturally
            ========================================================================= */}
        <div
          ref={page1Ref}
          className="bg-white p-7 sm:p-9 my-4 shadow-2xl rounded-xs border border-[#d8d2be] print:border-none print:shadow-none print:m-0 print:p-[10mm_12mm] print:rounded-none flex flex-col justify-between slip-a4-page"
          style={{
            width: '210mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
          }}
        >
          {/* PAGE 1 CONTENT WRAPPER */}
          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            {/* 1. HEADER: Logos & College / Battalion Typography */}
            <div>
              <div className="border-b-2 border-black pb-2.5">
                <div className="flex items-center justify-between gap-3">
                  {/* Left Logo: BNCC */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                    <img
                      src={ASSETS.bnccLogo}
                      alt="BNCC Emblem"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Center Battalion & College Identity */}
                  <div className="text-center flex-1 px-1">
                    <h1 className="text-[17px] sm:text-[18px] font-black uppercase tracking-wide text-black leading-tight">
                      Bangladesh National Cadet Corps (BNCC)
                    </h1>
                    <h2 className="text-[13px] sm:text-[14px] font-bold text-black mt-0.5 leading-tight">
                      31 BNCC Battalion, Mahasthan Regiment
                    </h2>
                    <h3 className="text-[13px] sm:text-[14px] font-bold text-black leading-tight">
                      New Govt. Degree College, Rajshahi
                    </h3>
                    <div className="inline-block mt-1.5 px-5 py-0.5 border-2 border-black rounded-xs bg-gray-50">
                      <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-black">
                        Recruit Admission Form
                      </span>
                    </div>
                  </div>

                  {/* Right Logo: NGDC Crest */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                    <img
                      src={ASSETS.ngdcLogo}
                      alt="NGDC Crest"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-bar: Serial Number, Session & Date */}
              <div className="flex items-center justify-between text-[11.5px] font-bold text-black pt-2 pb-1 border-b border-black/30">
                <div className="flex items-center gap-1.5">
                  <span>Serial No:</span>
                  <span className="font-mono px-2.5 py-0.5 border border-black bg-gray-50 rounded-xs text-xs font-black">
                    {isBlank ? '....................................' : (appData.serialNo || appData.token || 'REC-2026-001')}
                  </span>
                </div>
                <div>
                  <span>Session: </span>
                  <span className="font-mono font-bold">
                    {val(appData.session || activeAnnouncement?.academicSession || '2024-2025', '....................')}
                  </span>
                </div>
                <div>
                  <span>Issue Date: </span>
                  <span className="font-mono font-medium">
                    {isBlank ? '....................' : (appData.appliedAt?.split(' ')[0] || new Date().toLocaleDateString('en-GB'))}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PERSONAL PARTICULARS (Items 1 - 3) + Photo Box */}
            <div className="relative pt-1">
              {/* Official 35x45mm Passport Photograph Box */}
              <div className="absolute right-0 top-0 w-28 h-35 border-2 border-dashed border-black/80 bg-gray-50 flex flex-col items-center justify-center text-center p-1 overflow-hidden z-10 shadow-xs">
                {!isBlank && appData.avatarUrl ? (
                  <img
                    src={appData.avatarUrl}
                    alt={appData.fullName || 'Candidate Photo'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[9.5px] text-gray-600 p-1">
                    <span className="font-bold text-black uppercase tracking-wider">Photograph</span>
                    <span className="text-[8px] text-gray-500 mt-0.5">300 x 300 px</span>
                    <span className="text-[7.5px] mt-1 text-gray-500 leading-tight">
                      Affix 1 copy passport size color photo with gum
                    </span>
                  </div>
                )}
              </div>

              {/* Items 1 to 3 (Constrained width to avoid photo overlap) */}
              <div className="space-y-2.5 text-[12px] text-black pr-32">
                {/* 1. Applicant's Name */}
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="font-bold w-48 shrink-0">1. Applicant's Name: *</span>
                    <span className="text-gray-700 mr-2 shrink-0">In Bangla:</span>
                    <div className="flex-1 text-[13px]">{val(appData.nameBangla, '...........................................................................')}</div>
                  </div>
                  <div className="flex items-baseline pl-48">
                    <span className="text-gray-700 mr-2 shrink-0">In English (Capital):</span>
                    <div className="flex-1 font-mono uppercase font-black text-[12.5px]">
                      {val(appData.nameEnglish || appData.fullName, '...................................................................')}
                    </div>
                  </div>
                </div>

                {/* 2. Father's Name */}
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="font-bold w-48 shrink-0">2. Father's Name: *</span>
                    <span className="text-gray-700 mr-2 shrink-0">In Bangla:</span>
                    <div className="flex-1">{val(appData.fatherNameBangla, '...........................................................................')}</div>
                  </div>
                  <div className="flex items-baseline pl-48">
                    <span className="text-gray-700 mr-2 shrink-0">In English (Capital):</span>
                    <div className="flex-1 font-mono uppercase">
                      {val(appData.fatherNameEnglish, '...................................................................')}
                    </div>
                  </div>
                </div>

                {/* 3. Mother's Name */}
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="font-bold w-48 shrink-0">3. Mother's Name: *</span>
                    <span className="text-gray-700 mr-2 shrink-0">In Bangla:</span>
                    <div className="flex-1">{val(appData.motherNameBangla, '...........................................................................')}</div>
                  </div>
                  <div className="flex items-baseline pl-48">
                    <span className="text-gray-700 mr-2 shrink-0">In English (Capital):</span>
                    <div className="flex-1 font-mono uppercase">
                      {val(appData.motherNameEnglish, '...................................................................')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. GENERAL & ACADEMIC PARTICULARS (Items 4 - 10) */}
            <div className="space-y-2.5 text-[12px] text-black border-t border-black/20 pt-2.5">
              {/* 4. Gender */}
              <div className="flex items-center gap-6">
                <span className="font-bold w-48 shrink-0">4. Gender:</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('Male', appData.gender) ? 'bg-black text-white' : ''}`}>
                      {isCheck('Male', appData.gender) ? '✓' : ''}
                    </span>
                    <span>Male (পুরুষ)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('Female', appData.gender) ? 'bg-black text-white' : ''}`}>
                      {isCheck('Female', appData.gender) ? '✓' : ''}
                    </span>
                    <span>Female (মহিলা)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('Others', appData.gender) ? 'bg-black text-white' : ''}`}>
                      {isCheck('Others', appData.gender) ? '✓' : ''}
                    </span>
                    <span>Others</span>
                  </label>
                </div>
              </div>

              {/* 5. Class */}
              <div className="flex items-center gap-4">
                <span className="font-bold w-48 shrink-0">5. Class (শ্রেণি):</span>
                <div className="flex items-center gap-5 flex-wrap font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('11th', appData.studentClass) ? 'bg-black text-white' : ''}`}>
                      {isCheck('11th', appData.studentClass) ? '✓' : ''}
                    </span>
                    <span>11th (একাদশ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('12th', appData.studentClass) ? 'bg-black text-white' : ''}`}>
                      {isCheck('12th', appData.studentClass) ? '✓' : ''}
                    </span>
                    <span>12th (দ্বাদশ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('Honours 1st year', appData.studentClass) ? 'bg-black text-white' : ''}`}>
                      {isCheck('Honours 1st year', appData.studentClass) ? '✓' : ''}
                    </span>
                    <span>Honours 1st year (স্নাতক ১ম বর্ষ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className={`inline-block w-4 h-4 border-2 border-black text-center text-[11px] leading-3.5 font-black ${isCheck('Honours 2nd year', appData.studentClass) ? 'bg-black text-white' : ''}`}>
                      {isCheck('Honours 2nd year', appData.studentClass) ? '✓' : ''}
                    </span>
                    <span>Honours 2nd year</span>
                  </label>
                </div>
              </div>

              {/* 6. Department/Subject */}
              <div className="flex items-baseline">
                <span className="font-bold w-48 shrink-0">6. Department/Subject:</span>
                <div className="flex-1 font-semibold">{val(appData.department, '....................................................................................................................................................')}</div>
              </div>

              {/* 7 & 8: Roll No & Academic Session */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-baseline">
                  <span className="font-bold w-32 shrink-0">7. College Roll No:</span>
                  <div className="flex-1 font-mono font-bold text-sm">{val(appData.collegeRoll, '................................................')}</div>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold w-40 shrink-0">8. Academic Session:</span>
                  <div className="flex-1 font-mono font-bold">{val(appData.session, '................................................')}</div>
                </div>
              </div>

              {/* 9 & 10: Date of Birth & Religion */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-baseline">
                  <span className="font-bold w-32 shrink-0">9. Date of Birth:</span>
                  <div className="flex-1 font-bold text-black">
                    {val(formatDateOfBirth(appData.dateOfBirth), '................................................')}
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold w-32 shrink-0">10. Religion:</span>
                  <div className="flex-1 font-semibold">{val(appData.religion, '................................................')}</div>
                </div>
              </div>
            </div>

            {/* 4. ADDRESS & CONTACT (Items 11 - 13) */}
            <div className="space-y-2 text-[11.5px] text-black border-t border-black/20 pt-2.5">
              {/* 11. Present Address */}
              <div className="space-y-1">
                <div className="font-bold">11. Present Address (বর্তমান ঠিকানা): *</div>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">Village/House/Road:</span>
                    <span className="flex-1">{val(appData.presentAddress?.village, '..........................................................')}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">Post Office:</span>
                    <span className="flex-1">{val(appData.presentAddress?.post, '..........................................................')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">Upazila / Thana:</span>
                    <span className="flex-1 font-semibold">{val(appData.presentAddress?.upazila, '..........................................................')}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">District & Division:</span>
                    <span className="flex-1 font-semibold">
                      {val(
                        appData.presentAddress?.district
                          ? `${appData.presentAddress.district}${appData.presentAddress.division ? `, ${appData.presentAddress.division}` : ''}`
                          : null,
                        '..........................................................'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 12. Permanent Address */}
              <div className="space-y-1 pt-1">
                <div className="font-bold">12. Permanent Address (স্থায়ী ঠিকানা): *</div>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">Village/House/Road:</span>
                    <span className="flex-1">{val(appData.permanentAddress?.village, '..........................................................')}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">Post Office:</span>
                    <span className="flex-1">{val(appData.permanentAddress?.post, '..........................................................')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">Upazila / Thana:</span>
                    <span className="flex-1 font-semibold">{val(appData.permanentAddress?.upazila, '..........................................................')}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gray-700 font-medium shrink-0">District & Division:</span>
                    <span className="flex-1 font-semibold">
                      {val(
                        appData.permanentAddress?.district
                          ? `${appData.permanentAddress.district}${appData.permanentAddress.division ? `, ${appData.permanentAddress.division}` : ''}`
                          : null,
                        '..........................................................'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 13. Contact Particulars */}
              <div className="space-y-1 pt-1">
                <div className="font-bold">13. Contact Particulars (যোগাযোগ): *</div>
                <div className="grid grid-cols-3 gap-3 pl-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-700 font-medium shrink-0">Mobile (Self):*</span>
                    <span className="flex-1 font-mono font-black text-xs">{val(appData.phoneSelf || appData.phone, '............................')}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-700 font-medium shrink-0">Mobile (Guardian):</span>
                    <span className="flex-1 font-mono font-bold text-xs">{val(appData.phoneGuardian, '............................')}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-700 font-medium shrink-0">Email:</span>
                    <span className="flex-1 font-mono text-[11px] truncate">{val(appData.email, '............................')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. EDUCATIONAL QUALIFICATIONS (Item 14) */}
            <div className="space-y-1.5 border-t border-black/20 pt-2.5">
              <div className="font-bold text-[12px]">14. Educational Qualifications (শিক্ষাগত যোগ্যতা): *</div>
              <table className="w-full border-collapse border-2 border-black text-center text-[11px]">
                <thead>
                  <tr className="bg-gray-100 font-black border-b-2 border-black">
                    <th className="border border-black py-1 px-2">Exam Name</th>
                    <th className="border border-black py-1 px-2">Division / Group</th>
                    <th className="border border-black py-1 px-2">Passing Year</th>
                    <th className="border border-black py-1 px-2">GPA / Division</th>
                    <th className="border border-black py-1 px-2">Board / University</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: SSC */}
                  <tr className="h-8 border-b border-black">
                    <td className="border border-black font-bold p-1">SSC / Dakhil / Equiv.</td>
                    <td className="border border-black p-1 font-medium">
                      {!isBlank ? (appData.qualifications?.[0]?.divisionOrGroup || '') : ''}
                    </td>
                    <td className="border border-black p-1 font-mono">
                      {!isBlank ? (appData.qualifications?.[0]?.passingYear || '') : ''}
                    </td>
                    <td className="border border-black p-1 font-mono font-bold text-xs">
                      {!isBlank ? (appData.qualifications?.[0]?.gpa || '') : ''}
                    </td>
                    <td className="border border-black p-1 font-medium">
                      {!isBlank ? (appData.qualifications?.[0]?.board || '') : ''}
                    </td>
                  </tr>
                  {/* Row 2: HSC */}
                  <tr className="h-8 border-b border-black">
                    <td className="border border-black p-1">
                      <span className="font-bold">HSC / Alim / Equiv.</span>
                    </td>
                    <td className="border border-black p-1 font-medium">
                      {!isBlank ? (appData.qualifications?.[1]?.divisionOrGroup || '') : ''}
                    </td>
                    <td className="border border-black p-1 font-mono">
                      {!isBlank ? (appData.qualifications?.[1]?.passingYear || '') : ''}
                    </td>
                    <td className="border border-black p-1 font-mono font-bold text-xs">
                      {!isBlank ? (appData.qualifications?.[1]?.gpa || '') : ''}
                    </td>
                    <td className="border border-black p-1 font-medium">
                      {!isBlank ? (appData.qualifications?.[1]?.board || '') : ''}
                    </td>
                  </tr>
                  {/* Row 3: Graduation / Other */}
                  <tr className="h-7.5">
                    <td className="border border-black p-1 text-gray-700">Degree / Other (if any)</td>
                    <td className="border border-black p-1 font-mono"></td>
                    <td className="border border-black p-1 font-mono"></td>
                    <td className="border border-black p-1 font-mono"></td>
                    <td className="border border-black p-1 font-mono"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6. PHYSICAL MEASUREMENTS & SKILLS (Items 15 - 20) */}
            <div className="space-y-2 border-t border-black/20 pt-2 text-[12px] text-black">
              {/* 15 - 18 Physical Fitness Standard */}
              <div className="grid grid-cols-4 gap-3">
                <div className="flex items-baseline">
                  <span className="font-bold w-18 shrink-0">15. Height:</span>
                  <div className="flex-1 font-bold">
                    {val(
                      appData.heightFeet ? `${appData.heightFeet}' ${appData.heightInches || '0'}"` : appData.height,
                      '....................'
                    )}
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold w-26 shrink-0">16. Blood Group:</span>
                  <div className="flex-1 font-black text-red-700 text-sm">
                    {val(appData.bloodGroup, '..........')}
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold w-18 shrink-0">17. Weight:</span>
                  <div className="flex-1 font-bold">
                    {val(appData.weightKg ? `${appData.weightKg} kg` : appData.weight, '....................')}
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold w-18 shrink-0">18. Chest:</span>
                  <div className="flex-1 text-[11px] font-semibold">
                    {val(
                      appData.chestNormal || appData.chestExpanded
                        ? `${appData.chestNormal || '32'}" / ${appData.chestExpanded || '34'}"`
                        : null,
                      '......../........'
                    )}
                  </div>
                </div>
              </div>

              {/* 19. Computer & Technical Skills */}
              <div className="flex items-baseline pt-0.5">
                <span className="font-bold w-48 shrink-0">19. Computer / Technical Skills:</span>
                <div className="flex-1 font-medium">{val(appData.additionalSkills || 'Computer (MS Office, Web Browsing)', '....................................................................................................................................................')}</div>
              </div>

              {/* 20. Extra-Curricular Activities & Sports */}
              <div className="flex items-baseline pt-0.5">
                <span className="font-bold w-48 shrink-0">20. Extra-Curricular Activities:</span>
                <div className="flex-1 font-medium">{val(appData.reason, 'Sports / Athletics / Cultural / Scouting / Rover / Debate ....................................................')}</div>
              </div>
            </div>
          </div>

          {/* PAGE 1 FOOTER: Turn over notice & Page number */}
          <div className="pt-2 mt-2 border-t-2 border-black flex items-center justify-between text-[10px] text-gray-700 font-mono">
            <span className="font-semibold text-black">
              * Note: Please check all entries. Turn over to Page 2 for Pledge & Selection Board Evaluation.
            </span>
            <span className="font-bold text-black bg-gray-100 px-2 py-0.5 border border-black rounded-xs">
              Page 1 of 2
            </span>
          </div>
        </div>

        {/* =========================================================================
            PAGE 2: PLEDGE, GUARDIAN CONSENT, SELECTION BOARD & SIGNATORIES
            Filled evenly with essential official recruit verification sections
            ========================================================================= */}
        <div
          ref={page2Ref}
          className="bg-white p-7 sm:p-9 my-4 shadow-2xl rounded-xs border border-[#d8d2be] print:border-none print:shadow-none print:m-0 print:p-[10mm_12mm] print:rounded-none flex flex-col justify-between slip-a4-page"
          style={{
            width: '210mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
          }}
        >
          {/* PAGE 2 CONTENT WRAPPER */}
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Top Mini Header */}
            <div className="text-center border-b-2 border-black pb-2">
              <span className="text-[12px] font-black tracking-wider uppercase text-black">
                Bangladesh National Cadet Corps (BNCC) • New Govt. Degree College, Rajshahi
              </span>
              <div className="text-[10.5px] font-bold text-gray-800">
                31 BNCC Battalion, Mahasthan Regiment • Recruit Admission Form (Part II)
              </div>
            </div>

            {/* PART 1: PLEDGE OF THE RECRUIT (ক্যাডেট প্রার্থীর অঙ্গীকারনামা) */}
            <div className="space-y-2 border border-black/40 p-3 bg-gray-50/50 rounded-xs">
              <h2 className="text-center text-[13px] font-black uppercase tracking-widest text-black underline">
                Pledge (ক্যাডেট প্রার্থীর অঙ্গীকারনামা)
              </h2>

              <p className="text-[11.5px] leading-relaxed text-justify text-black">
                <span className="font-black">21. </span>
                I, <span className="font-black underline px-1 text-black">{isBlank ? '...................................................................................' : (appData.nameEnglish || appData.fullName || '...................................................')}</span>,
                do hereby solemnly promise that I shall be bound to perform any service activity in the national interest by order of BNCC. Even at the risk of my life for the defense of the country, I will obey the lawful orders of my superior officers and cadets. From the date of my enlistment in the BNCC, I will be bound to appear for any duty whenever called upon by the BNCC as long as my cadetship remains active.
              </p>

              {/* Applicant Signature Lines */}
              <div className="flex items-end justify-between pt-4 px-2">
                <div className="text-[11px] font-semibold">
                  Date: <span className="font-mono font-bold">{isBlank ? '....................................' : (appData.appliedAt?.split(' ')[0] || new Date().toLocaleDateString('en-GB'))}</span>
                </div>

                <div className="text-center">
                  <div className="border-t-2 border-black w-60 pt-1 font-bold text-xs text-black">
                    Applicant's Signature (আবেদনকারীর স্বাক্ষর)
                  </div>
                </div>
              </div>
            </div>

            {/* PART 2: GUARDIAN'S CONSENT LETTER (অভিভাবকের সম্মতিপত্র) */}
            <div className="space-y-2 border border-black/40 p-3 bg-gray-50/50 rounded-xs">
              <h2 className="text-center text-[13px] font-black uppercase tracking-widest text-black underline">
                Guardian's Consent Letter (অভিভাবকের সম্মতিপত্র)
              </h2>

              <p className="text-[11.5px] leading-relaxed text-justify text-black">
                <span className="font-black">22. </span>
                This is to certify that my child / ward, <span className="font-black underline px-1 text-black">{isBlank ? '...................................................................................' : (appData.nameEnglish || appData.fullName || '...................................................')}</span>,
                is a student in Class 11 / Bachelor's Degree program at New Govt. Degree College, Rajshahi. He/She has my full permission to become a member of the Bangladesh National Cadet Corps (BNCC) unit of this college. I shall not make any claim for any unintentional injury or eventuality during authorized training.
              </p>

              {/* Guardian Signature & Particulars */}
              <div className="flex items-end justify-between pt-4 px-2">
                <div className="space-y-1 text-[11px]">
                  <div>
                    Guardian's Name: <span className="font-semibold">{val(appData.fatherNameBangla || appData.fatherNameEnglish, '..........................................')}</span>
                  </div>
                  <div>
                    Mobile / NID: <span className="font-mono font-semibold">{val(appData.phoneGuardian, '..........................................')}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="border-t-2 border-black w-60 pt-1 font-bold text-xs text-black">
                    Guardian's Signature (অভিভাবকের স্বাক্ষর)
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5">Date: ....................................</div>
                </div>
              </div>
            </div>

            {/* PART 3: FOR OFFICIAL / SELECTION BOARD EVALUATION ONLY (অফিস ব্যবহারের জন্য) */}
            <div className="border-2 border-black p-2.5 rounded-xs space-y-2 bg-white">
              <div className="flex items-center justify-between border-b border-black pb-1">
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  For Official / Selection Board Use Only (নির্বাচনী পর্ষদের মূল্যায়ন)
                </span>
                <span className="text-[10.5px] font-mono font-bold text-gray-700">BNCC Rec-2026</span>
              </div>

              <table className="w-full border-collapse border border-black text-center text-[10.5px]">
                <thead>
                  <tr className="bg-gray-100 font-black border-b border-black">
                    <th className="border border-black py-1 px-1.5">1. Physical Fitness (40)</th>
                    <th className="border border-black py-1 px-1.5">2. Written Test (30)</th>
                    <th className="border border-black py-1 px-1.5">3. Viva & Personality (30)</th>
                    <th className="border border-black py-1 px-1.5">Medical Exam</th>
                    <th className="border border-black py-1 px-1.5">Total Marks (100)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-8 font-mono">
                    <td className="border border-black p-1 text-gray-500">Run / Push-up: .....</td>
                    <td className="border border-black p-1 text-gray-500">Marks: .....</td>
                    <td className="border border-black p-1 text-gray-500">Marks: .....</td>
                    <td className="border border-black p-1 text-gray-700 font-sans font-bold">[ ] Fit &nbsp; [ ] Unfit</td>
                    <td className="border border-black p-1 font-black text-xs">/ 100</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center justify-between text-[11px] font-bold text-black pt-1 px-1">
                <div className="flex items-center gap-4">
                  <span>Selection Status:</span>
                  <label className="flex items-center gap-1 font-medium">
                    <span className="w-3.5 h-3.5 border border-black inline-block" />
                    <span>Selected (নির্বাচিত)</span>
                  </label>
                  <label className="flex items-center gap-1 font-medium">
                    <span className="w-3.5 h-3.5 border border-black inline-block" />
                    <span>Waiting (অপেক্ষমান)</span>
                  </label>
                  <label className="flex items-center gap-1 font-medium">
                    <span className="w-3.5 h-3.5 border border-black inline-block" />
                    <span>Rejected</span>
                  </label>
                </div>

                <div className="text-right">
                  <span>Board Officer Signature: .......................................</span>
                </div>
              </div>
            </div>

            {/* PART 4: 3-COLUMN OFFICIAL SIGNATORIES */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-3 text-center text-[11px] leading-snug items-start">
                {/* Column 1: Signature of Form Provider */}
                <div className="flex flex-col items-center w-full">
                  <div className="h-14 flex items-end justify-center w-full pb-1">
                    <span className="text-[10px] text-gray-400 select-none">
                      {isBlank ? '' : '(Provider Signature)'}
                    </span>
                  </div>
                  <div className="border-t-2 border-black w-full pt-1.5 font-bold text-black text-xs">
                    {sig.formProviderTitle || 'Signature of Form Provider:'}
                  </div>
                  <div className="text-[10px] text-gray-700 mt-1">
                    Date: ....................................
                  </div>
                </div>

                {/* Column 2: Countersigned Authority (PUO / Platoon Commander) */}
                <div className="flex flex-col items-center w-full border-x border-gray-200 px-2">
                  <div className="h-14 flex items-end justify-center w-full pb-1">
                    {sig.countersignedSignatureUrl ? (
                      <img
                        src={sig.countersignedSignatureUrl}
                        alt="Countersigned Authority Signature"
                        className="max-h-12 max-w-[130px] object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-6" />
                    )}
                  </div>
                  <div className="border-t-2 border-black w-full pt-1 text-black">
                    <span className="font-black block uppercase text-[10.5px] mb-0.5">Countersigned:</span>
                    <span className="font-bold block text-xs">{sig.countersignedName || 'PUO Md. Abdul Matin'}</span>
                    <span className="block font-mono text-[10px]">{sig.countersignedPNo ? `P-No: ${sig.countersignedPNo}` : 'P-No: P-8193'}</span>
                    <span className="font-semibold block text-[10px]">{sig.countersignedTitle || 'Platoon Commander'}</span>
                    <span className="block text-[10px]">{sig.countersignedBattalion || '31 BNCC Battalion'}, {sig.countersignedRegiment || 'Mahasthan Regiment'}</span>
                    <span className="block text-[9px] text-gray-700">{sig.countersignedInstitution || 'New Govt. Degree College, Rajshahi'}</span>
                  </div>
                </div>

                {/* Column 3: Signature of Platoon Senior Cadet */}
                <div className="flex flex-col items-center w-full">
                  <div className="h-14 flex items-end justify-center w-full pb-1">
                    {sig.seniorCadetSignatureUrl ? (
                      <img
                        src={sig.seniorCadetSignatureUrl}
                        alt="Platoon Senior Cadet Signature"
                        className="max-h-12 max-w-[130px] object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-6" />
                    )}
                  </div>
                  <div className="border-t-2 border-black w-full pt-1 text-black">
                    <span className="font-black block uppercase text-[10.5px] mb-0.5 leading-tight">
                      Signature of Platoon Senior Cadet:
                    </span>
                    <span className="font-bold block text-xs">{sig.seniorCadetRankAndName || 'Cadet Sergeant Touhid'}</span>
                    <span className="block font-mono text-[10px]">{sig.seniorCadetNo ? `Cadet No: ${sig.seniorCadetNo}` : 'Cadet No: 2210...'}</span>
                    <span className="font-semibold block text-[10px]">Platoon Senior Under Officer / Cadet</span>
                    <span className="block text-[10px]">{sig.seniorCadetBattalion || '31 BNCC Battalion'}, {sig.seniorCadetRegiment || 'Mahasthan Regiment'}</span>
                    <span className="block text-[9px] text-gray-700">{sig.seniorCadetInstitution || 'New Govt. Degree College, Rajshahi'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PART 5: ATTACHMENTS NOTICE BOX */}
            <div className="border-2 border-dashed border-black/80 p-2.5 bg-gray-50/80 rounded-xs">
              <span className="font-black text-[11px] uppercase tracking-wide block text-black mb-1">
                Mandatory Attachments (আবেদনপত্রের সাথে অবশ্যই সংযুক্ত করতে হবে):
              </span>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-black font-medium pl-1">
                {sig.attachments && sig.attachments.length > 0 ? (
                  sig.attachments.map((att, i) => <li key={i}>{att}</li>)
                ) : (
                  <>
                    <li>Photocopy of College ID Card / Admission Money Receipt (কলেজ আইডি / বেতন রসিদ)</li>
                    <li>Photocopy of SSC / HSC Transcript / Marksheet (মার্কশিটের ফটোকপি)</li>
                    <li>Photocopy of Guardian's NID Card & Candidate Birth Certificate (এনআইডি / জন্মসনদ)</li>
                    <li>Blood Group Test Report (ব্লাড গ্রুপ রিপোর্ট)</li>
                    <li>2 Copies Passport Size Color Photographs (২ কপি পাসপোর্ট সাইজ ছবি)</li>
                  </>
                )}
              </ol>
            </div>
          </div>

          {/* PAGE 2 FOOTER */}
          <div className="pt-2 mt-2 border-t-2 border-black flex items-center justify-between text-[10px] text-gray-700 font-mono">
            <span className="font-semibold text-black">
              Bangladesh National Cadet Corps • NGDC Platoon, 31 BNCC Battalion
            </span>
            <span className="font-bold text-black bg-gray-100 px-2 py-0.5 border border-black rounded-xs">
              Page 2 of 2
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
