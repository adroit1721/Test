import React, { useState } from 'react';
import { NoticeItem, BlogItem, MemoryItem, RecruitmentFormState, RecruitmentApplicant } from '../types';
import { ASSETS, UNIFORM_ITEMS } from '../data/bnccData';
import { useAdminData } from '../context/AdminDataContext';
import { X, Calendar, User, Clock, Heart, Share2, Download, CheckCircle2, Shield, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Printer, Copy, Check, FileText, Image } from 'lucide-react';
import { CloudinaryUploader } from './common/CloudinaryUploader';
import { RecruitmentApplicationSlipA4 } from './common/RecruitmentApplicationSlipA4';

/* =========================================================================
   1. NOTICE DETAIL MODAL
   ========================================================================= */
export const NoticeDetailModal: React.FC<{
  notice: NoticeItem | null;
  onClose: () => void;
}> = ({ notice, onClose }) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cdc6b3] pb-4">
          <div className="flex items-center gap-3">
            <img src={ASSETS.bnccLogo} alt="BNCC" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
            <div>
              <span className="text-[10px] font-mono uppercase bg-[#eedc82]/50 text-[#6b5e10] px-2 py-0.5 rounded-full font-bold">
                {notice.circularNo}
              </span>
              <p className="text-xs text-[#7c7767] mt-0.5">Mahasthangarh Battalion Circular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f0eee8] text-[#1c1c18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Title & Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#695c4e]">
            <span className="flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5" /> {notice.date}
            </span>
            <span>•</span>
            <span>Issued by: {notice.author}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] leading-tight">
            {notice.title}
          </h2>
        </div>

        {/* Notice Body */}
        <div className="p-5 bg-[#f6f3ed] rounded-2xl border border-[#cdc6b3]/50 text-xs md:text-sm text-[#1c1c18] leading-relaxed space-y-4">
          <p className="font-medium text-[#4a4738]">{notice.summary}</p>
          <div className="border-t border-[#cdc6b3]/40 pt-3">
            <p>{notice.details}</p>
          </div>
        </div>

        {/* Official Authority Box */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#695c4e]">
          <div>
            <p className="font-bold text-[#1c1c18]">By Order of Platoon Commander</p>
            <p className="text-[11px] text-[#7c7767]">PUO Dr. A. Rahman • New Govt. Degree College</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="japandi-btn-secondary text-xs py-2 px-4"
            >
              <Printer className="w-3.5 h-3.5 text-[#6b5e10]" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="japandi-btn-primary text-xs py-2 px-5"
            >
              Acknowledge Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. BLOG READER MODAL
   ========================================================================= */
export const BlogReaderModal: React.FC<{
  blog: BlogItem | null;
  onClose: () => void;
}> = ({ blog, onClose }) => {
  const [likes, setLikes] = useState(blog ? blog.likes : 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!blog) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cdc6b3] pb-3">
          <span className="text-xs font-bold bg-[#eedc82]/60 text-[#6b5e10] px-3 py-1 rounded-full uppercase">
            {blog.category}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f0eee8] text-[#1c1c18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Author */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1c1c18] leading-snug">
            {blog.title}
          </h2>

          <div className="flex items-center justify-between text-xs text-[#695c4e] border-y border-[#cdc6b3]/40 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#eedc82] text-[#1c1c18] font-bold flex items-center justify-center">
                {blog.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[#1c1c18]">{blog.author}</p>
                <p className="text-[11px] text-[#7c7767]">{blog.authorRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>{blog.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#7c7767]" /> {blog.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Blog Paragraphs */}
        <div className="space-y-4 text-xs md:text-sm text-[#31312d] leading-relaxed">
          {blog.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#cdc6b3] flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              hasLiked
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-[#f0eee8] hover:bg-[#ebe8e2] text-[#1c1c18]'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-rose-700' : ''}`} />
            <span>{likes} Appreciations</span>
          </button>

          <button
            onClick={handleShare}
            className="japandi-btn-secondary text-xs py-2 px-4"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. MEMORY LIGHTBOX MODAL
   ========================================================================= */
export const MemoryLightboxModal: React.FC<{
  memory: MemoryItem | null;
  onClose: () => void;
}> = ({ memory, onClose }) => {
  if (!memory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-4xl w-full bg-[#fcf9f3] rounded-3xl overflow-hidden shadow-2xl border border-[#cdc6b3]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src={memory.imageUrl}
            alt={memory.altText}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-6 md:p-8 space-y-2 bg-[#fcf9f3]">
          <div className="flex items-center justify-between text-xs text-[#695c4e]">
            <span className="font-bold uppercase tracking-wider text-[#6b5e10] bg-[#eedc82]/50 px-3 py-0.5 rounded-full">
              {memory.category}
            </span>
            <span>{memory.date} • {memory.location}</span>
          </div>
          <h3 className="text-xl font-bold text-[#1c1c18]">{memory.title}</h3>
          <p className="text-xs md:text-sm text-[#4a4738] leading-relaxed">
            {memory.description}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. CADET RECRUITMENT APPLICATION MODAL
   ========================================================================= */
export const JoinRecruitmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { recruitmentConfig, recruitmentAnnouncement, recruitmentFields, addRecruitmentApplicant } = useAdminData();
  const [formData, setFormData] = useState<RecruitmentFormState>({
    fullName: '',
    email: '',
    phone: '',
    collegeRoll: '',
    department: 'HSC Science',
    session: '2024-2025',
    heightFeet: '5',
    heightInches: '8',
    weightKg: '64',
    bloodGroup: 'B+',
    reason: '',
  });

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [createdApplicant, setCreatedApplicant] = useState<RecruitmentApplicant | null>(null);
  const [showA4Slip, setShowA4Slip] = useState(false);

  if (!isOpen) return null;

  const isFormActive = recruitmentAnnouncement ? recruitmentAnnouncement.isActive !== false : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const applicantPayload: Omit<RecruitmentApplicant, 'id' | 'appliedAt' | 'token' | 'status'> = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      collegeRoll: formData.collegeRoll,
      department: formData.department,
      session: formData.session,
      heightFeet: formData.heightFeet,
      heightInches: formData.heightInches,
      weightKg: formData.weightKg,
      bloodGroup: formData.bloodGroup,
      reason: formData.reason,
      avatarUrl: avatarUrl || undefined,
      customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
    };

    const token = addRecruitmentApplicant(applicantPayload);
    const assignedToken = token || `REC-${Date.now().toString().slice(-6)}`;
    setSubmittedId(assignedToken);

    setCreatedApplicant({
      id: `app-${Date.now()}`,
      ...applicantPayload,
      token: assignedToken,
      status: 'Pending',
      appliedAt: new Date().toLocaleDateString('en-GB'),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Custom Header Banner (if uploaded by Admin) */}
          {recruitmentAnnouncement?.headerImageUrl && (
            <div className="w-full rounded-2xl overflow-hidden border border-[#cdc6b3]/60 dark:border-[#423e35] mb-2 shadow-xs">
              <img
                src={recruitmentAnnouncement.headerImageUrl}
                alt="Recruitment Header"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-36 object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#cdc6b3] dark:border-[#423e35] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82] rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  {recruitmentAnnouncement?.title || recruitmentConfig?.noticeTitle || 'Cadet Recruitment Application'}
                </h3>
                <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                  {recruitmentAnnouncement?.batch || recruitmentConfig?.batchName || 'Batch 24'} • New Govt. Degree College Platoon
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#f0eee8] dark:hover:bg-[#2a2822] text-[#1c1c18] dark:text-[#fcfbf7]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isFormActive ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Recruitment Window is Currently Closed
              </h4>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596] max-w-sm mx-auto">
                Applications are not actively being accepted at this moment. Please monitor the Cadet Notice Board for the next batch announcement.
              </p>
              <button onClick={onClose} className="japandi-btn-secondary text-xs py-2 px-4 mt-2">
                Close Window
              </button>
            </div>
          ) : submittedId ? (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Application Lodged!</h4>
              <p className="text-xs md:text-sm text-[#4a4738] dark:text-[#aca596] max-w-md mx-auto">
                Your cadet enlistment application has been recorded. You can now download your official <strong>A4 PDF Application Slip</strong> for physical verification.
              </p>
              <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl max-w-xs mx-auto text-center space-y-1">
                <span className="text-[10px] text-[#7c7767] uppercase font-bold">Enlistment Token</span>
                <p className="font-mono text-lg font-black text-[#1c1c18] dark:text-[#eedc82]">{submittedId}</p>
                <p className="text-[10px] text-[#6b5e10] dark:text-[#aca596]">Keep this slip for physical trial</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowA4Slip(true)}
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print A4 PDF Slip</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="japandi-btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl flex items-start gap-2 text-[11px] text-[#4a4738] dark:text-[#aca596]">
                <AlertCircle className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0 mt-0.5" />
                <span>
                  Minimum height: Male 5&apos;4&quot; / Female 5&apos;0&quot;. Must be an enrolled regular student of New Govt. Degree College, Rajshahi.
                </span>
              </div>

              {/* Applicant Photograph Upload via Cloudinary */}
              <div className="p-3 bg-white dark:bg-[#252420] border border-[#cdc6b3]/60 dark:border-[#423e35] rounded-2xl">
                <CloudinaryUploader
                  label="Applicant Formal Photograph (Optional / Cloudinary)"
                  value={avatarUrl}
                  currentImageUrl={avatarUrl}
                  folder="recruitment/applicants"
                  onChange={(url) => setAvatarUrl(url)}
                  onUploadComplete={(url) => setAvatarUrl(url)}
                  helpText="Passport size photo recommended. Appears on your A4 verification slip."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Full Legal Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="As per SSC Certificate"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">College Roll No. *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 240192"
                    value={formData.collegeRoll}
                    onChange={(e) => setFormData({ ...formData, collegeRoll: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none font-mono text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Department / Class *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. HSC Science, English, etc."
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Academic Session *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 2024-2025"
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Mobile Contact No. *</label>
                  <input
                    required
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Height (Feet/In)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="4"
                      max="7"
                      value={formData.heightFeet}
                      onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.heightInches}
                      onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="40"
                    max="120"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Custom Fields configured in Admin Form Builder */}
              {recruitmentFields && recruitmentFields.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35]">
                  <p className="text-[11px] font-bold text-[#6b5e10] dark:text-[#eedc82]">Additional Questions</p>
                  {recruitmentFields.map((field, fIdx) => (
                    <div key={field.id ? `modal-rf-${field.id}-${fIdx}` : `modal-rf-${fIdx}`}>
                      <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                        {field.label} {field.required && '*'}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })}
                          className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((opt, optIdx) => (
                            <option key={`${field.id}-opt-${optIdx}-${opt}`} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })}
                          className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] p-3 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7] resize-none"
                          rows={2}
                        />
                      ) : (
                        <input
                          type={field.type}
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })}
                          className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl outline-none text-[#1c1c18] dark:text-[#fcfbf7]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Why do you want to join BNCC?</label>
                <textarea
                  rows={2}
                  placeholder="Explain in 1-2 sentences your motivation..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] p-3 rounded-2xl outline-none text-[#1c1c18] dark:text-[#fcfbf7] resize-none"
                ></textarea>
              </div>

              {/* Custom Footer Notice or Image */}
              {recruitmentAnnouncement?.footerImageUrl && (
                <div className="w-full rounded-xl overflow-hidden border border-[#cdc6b3]/50">
                  <img
                    src={recruitmentAnnouncement.footerImageUrl}
                    alt="Footer Notice"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-24 object-contain"
                  />
                </div>
              )}
              {recruitmentAnnouncement?.footerText && (
                <p className="text-[10px] text-[#7c7767] dark:text-[#aca596] text-center italic">
                  {recruitmentAnnouncement.footerText}
                </p>
              )}

              <button
                type="submit"
                className="japandi-btn-primary w-full py-3 text-xs md:text-sm mt-2 font-bold cursor-pointer"
              >
                Submit Enlistment Application
              </button>
            </form>
          )}
        </div>
      </div>

      {/* A4 Application Slip Viewer */}
      {showA4Slip && createdApplicant && (
        <RecruitmentApplicationSlipA4
          applicant={createdApplicant}
          announcement={recruitmentAnnouncement}
          formFields={recruitmentFields}
          onClose={() => setShowA4Slip(false)}
        />
      )}
    </>
  );
};

/* =========================================================================
   5. CADET AUTH MODAL (LOGIN / REGISTER)
   ========================================================================= */
export const CadetAuthModal: React.FC<{
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
}> = ({ isOpen, initialMode, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [cadetNo, setCadetNo] = useState('');
  const [password, setPassword] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cdc6b3] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#6b5e10]" />
            <h3 className="text-lg font-bold text-[#1c1c18]">Cadet Self-Service Portal</h3>
          </div>
          <button
            onClick={() => {
              onClose();
              setAuthSuccess(false);
            }}
            className="p-1 rounded-full text-[#7c7767] hover:text-[#1c1c18]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {authSuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
            <h4 className="text-xl font-bold text-[#1c1c18]">Welcome, Cadet!</h4>
            <p className="text-xs text-[#4a4738]">
              Logged in successfully to NGDC-BNCC platoon portal. Your parade records and attendance dashboard are synchronized.
            </p>
            <button
              onClick={() => {
                onClose();
                setAuthSuccess(false);
              }}
              className="japandi-btn-primary text-xs mt-2"
            >
              Continue to Portal
            </button>
          </div>
        ) : (
          <div>
            {/* Mode switch */}
            <div className="flex bg-[#ebe8e2] p-1 rounded-full mb-4 border border-[#cdc6b3]/50">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mode === 'login' ? 'bg-[#1c1c18] text-white shadow-xs' : 'text-[#4a4738]'
                }`}
              >
                Cadet Login
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mode === 'register' ? 'bg-[#1c1c18] text-white shadow-xs' : 'text-[#4a4738]'
                }`}
              >
                New Registration
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] mb-1">
                  {mode === 'login' ? 'Cadet ID or College Roll' : 'College Roll Number'}
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. NGDC-2024-042"
                  value={cadetNo}
                  onChange={(e) => setCadetNo(e.target.value)}
                  className="w-full bg-[#f6f3ed] border border-[#cdc6b3] px-3.5 py-2.5 rounded-full outline-none focus:border-[#1c1c18] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] mb-1">Portal Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f6f3ed] border border-[#cdc6b3] px-3.5 py-2.5 rounded-full outline-none focus:border-[#1c1c18]"
                />
              </div>

              <button
                type="submit"
                className="japandi-btn-primary w-full py-3 text-xs font-bold mt-2"
              >
                {mode === 'login' ? 'Access Cadet Portal' : 'Register Cadet Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   6. UNIFORM OF THE DAY MODAL
   ========================================================================= */
export const UniformGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#cdc6b3] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6b5e10]" />
            <h3 className="text-lg font-bold text-[#1c1c18]">Uniform & Bearing Regulations</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#7c7767] hover:text-[#1c1c18]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {UNIFORM_ITEMS.map((item, idx) => (
            <div key={idx} className="p-4 bg-[#f6f3ed] rounded-2xl border border-[#cdc6b3]/50 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#1c1c18]">{item.name}</h4>
                <span className="text-[10px] font-bold bg-[#eedc82]/60 text-[#6b5e10] px-2 py-0.5 rounded-full">
                  Standard Regs
                </span>
              </div>
              <p className="text-[11px] text-[#695c4e] italic">{item.when}</p>
              <ul className="space-y-1 text-xs text-[#4a4738] pt-1">
                {item.items.map((i, iIdx) => (
                  <li key={iIdx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6b5e10]"></span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button onClick={onClose} className="japandi-btn-secondary text-xs w-full">
            Understood Regulations
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   7. ADMIN LOGIN MODAL
   ========================================================================= */
export const AdminLoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Retrieve active Admin PIN from localStorage or default '1721'
    const storedPin = localStorage.getItem('ngdc_admin_pin') || '1721';
    if (pin.trim() === storedPin.trim()) {
      setStatus('success');
      sessionStorage.setItem('ngdc_admin_auth', 'true');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setStatus('idle');
        setPin('');
      }, 700);
    } else {
      setErrorMsg('Invalid Service PIN. Default PIN is 1721.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#cdc6b3] dark:border-[#423e35] pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">Command Admin Panel Login</h4>
          </div>
          <button onClick={onClose} className="text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-4 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Authorized as PUO Office Admin</p>
            <p className="text-[11px] text-[#4a4738] dark:text-[#aca596]">Launching Admin Panel Workspace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">PUO / Officer Service PIN</label>
                <span className="text-[10px] text-[#7c7767] font-mono">Default: 1721</span>
              </div>
              <input
                required
                type="password"
                maxLength={8}
                placeholder="Enter Service PIN (1721)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl outline-none font-mono text-center tracking-widest text-base text-[#1c1c18] dark:text-[#fcfbf7] font-bold"
                autoFocus
              />
              {errorMsg && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1 text-center">
                  {errorMsg}
                </p>
              )}
            </div>
            <button type="submit" className="japandi-btn-primary w-full py-2.5 text-xs font-bold cursor-pointer">
              Verify Command PIN & Enter Panel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
