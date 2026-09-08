import React, { useState } from 'react';
import {
  Shield,
  Printer,
  FileText,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Award,
  AlertCircle,
  Upload,
  ArrowRight,
  Search,
  Check,
  Building2,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { RecruitmentFormState, RecruitmentApplicant, ApplicantAddress, ApplicantQualification, TabType } from '../types';
import { RecruitmentApplicationSlipA4, formatDateOfBirth } from './common/RecruitmentApplicationSlipA4';
import {
  BANGLADESH_DIVISIONS,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  BANGLADESH_EDUCATION_BOARDS,
  DIVISION_GROUP_OPTIONS,
} from '../data/bangladeshGeoData';
import { ASSETS } from '../data/bnccData';
import { compressAndConvertToDataUrl, processPassportPhoto } from '../utils/cloudinary';

// Generate passing years list from current year down to 2000
const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEARS: number[] = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, i) => CURRENT_YEAR - i
);

interface RecruitmentViewProps {
  setActiveTab?: (tab: TabType) => void;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ setActiveTab }) => {
  const {
    recruitmentAnnouncement,
    isRecruitmentOpen,
    recruitmentConfig,
    addRecruitmentApplicant,
    recruitmentApplicants,
    recruitmentSignatories,
  } = useAdminData();

  // Printable slip states
  const [showSlip, setShowSlip] = useState(false);
  const [slipApplicant, setSlipApplicant] = useState<RecruitmentApplicant | null>(null);
  const [isSlipBlank, setIsSlipBlank] = useState(false);

  // Status check modal/drawer state
  const [showStatusSearch, setShowStatusSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedApplicant, setSearchedApplicant] = useState<RecruitmentApplicant | null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Form State - only placeholders, no pre-filled text
  const [formData, setFormData] = useState<RecruitmentFormState>({
    fullName: '',
    email: '',
    phone: '',
    collegeRoll: '',
    department: '',
    session: '',
    heightFeet: '',
    heightInches: '',
    weightKg: '',
    bloodGroup: '',
    reason: '',
    nameBangla: '',
    nameEnglish: '',
    fatherNameBangla: '',
    fatherNameEnglish: '',
    motherNameBangla: '',
    motherNameEnglish: '',
    gender: '',
    studentClass: '',
    dateOfBirth: '',
    religion: '',
    presentAddress: { division: '', district: '', upazila: '', post: '', village: '' },
    permanentAddress: { division: '', district: '', upazila: '', post: '', village: '' },
    phoneSelf: '',
    phoneGuardian: '',
    qualifications: [
      { examName: 'SSC', divisionOrGroup: '', passingYear: '', gpa: '', board: '' },
      { examName: 'HSC', divisionOrGroup: '', passingYear: '', gpa: '', board: '' },
    ],
    chestNormal: '',
    chestExpanded: '',
    additionalSkills: '',
    pledgeAccepted: false,
    guardianConsentAccepted: false,
  });

  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [photoMeta, setPhotoMeta] = useState<{ sizeKb?: number; isCompliant?: boolean } | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedApplicant, setSubmittedApplicant] = useState<RecruitmentApplicant | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isWindowActive = isRecruitmentOpen !== undefined ? isRecruitmentOpen : (recruitmentAnnouncement?.isActive !== false);

  // Handle Photo Upload with BNCC specification: Fixed 300x300 px, max 300 KB only
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsPhotoProcessing(true);

    try {
      const res = await processPassportPhoto(file, 300);
      if (res && res.url) {
        setAvatarPreview(res.url);
        setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
        setPhotoMeta({ sizeKb: res.fileSizeKb, isCompliant: res.isCompliant });
      }
    } catch (err: any) {
      console.warn('Applicant photo processing failed:', err);
      setErrorMsg(err.message || 'Failed to process passport photo. Please upload a valid image under 300 KB.');
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  // Hierarchical Address Change Handler (Division -> District -> Upazila)
  const handleAddressChange = (
    type: 'present' | 'permanent',
    field: keyof ApplicantAddress,
    value: string
  ) => {
    setFormData((prev) => {
      const current = type === 'present'
        ? { ...(prev.presentAddress || { division: '', district: '', upazila: '', post: '', village: '' }) }
        : { ...(prev.permanentAddress || { division: '', district: '', upazila: '', post: '', village: '' }) };

      (current as any)[field] = value;

      // Cascading reset: changing division resets district and upazila
      if (field === 'division') {
        current.district = '';
        current.upazila = '';
      } else if (field === 'district') {
        // Changing district resets upazila
        current.upazila = '';
      }

      if (type === 'present') {
        return {
          ...prev,
          presentAddress: current,
          ...(sameAsPresent ? { permanentAddress: { ...current } } : {}),
        };
      } else {
        return {
          ...prev,
          permanentAddress: current,
        };
      }
    });
  };

  // Sync permanent address when checkbox is toggled
  const handleSameAddressToggle = (checked: boolean) => {
    setSameAsPresent(checked);
    if (checked && formData.presentAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...prev.presentAddress! },
      }));
    }
  };

  // Handle Qualification changes
  const handleQualificationChange = (index: number, field: keyof ApplicantQualification, value: string) => {
    setFormData((prev) => {
      const quals = [...(prev.qualifications || [])];
      if (!quals[index]) {
        quals[index] = { examName: index === 0 ? 'SSC' : 'HSC', divisionOrGroup: '', passingYear: '', gpa: '', board: '' };
      }
      quals[index] = { ...quals[index], [field]: value };
      return { ...prev, qualifications: quals };
    });
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!formData.nameEnglish?.trim() && !formData.fullName?.trim()) {
      setErrorMsg('Please enter applicant name in English (Capital letters).');
      return;
    }
    if (!formData.gender) {
      setErrorMsg('Please select applicant gender (Item 4).');
      return;
    }
    if (!formData.studentClass) {
      setErrorMsg('Please select college class (Item 5).');
      return;
    }
    if (!formData.department?.trim()) {
      setErrorMsg('Please enter department/subject (Item 6).');
      return;
    }
    if (!formData.collegeRoll?.trim()) {
      setErrorMsg('Please enter college roll number (Item 7).');
      return;
    }
    if (!formData.session?.trim()) {
      setErrorMsg('Please enter academic session (Item 8).');
      return;
    }
    if (!formData.dateOfBirth) {
      setErrorMsg('Please select date of birth (Item 9).');
      return;
    }
    if (!formData.religion) {
      setErrorMsg('Please select religion (Item 10).');
      return;
    }
    // Address validations (All division, district, upazila, post, village required)
    if (
      !formData.presentAddress?.division ||
      !formData.presentAddress?.district ||
      !formData.presentAddress?.upazila ||
      !formData.presentAddress?.post?.trim() ||
      !formData.presentAddress?.village?.trim()
    ) {
      setErrorMsg('Please complete all Present Address fields (Division, District, Upazila, Post Office, Village/Area).');
      return;
    }
    if (
      !formData.permanentAddress?.division ||
      !formData.permanentAddress?.district ||
      !formData.permanentAddress?.upazila ||
      !formData.permanentAddress?.post?.trim() ||
      !formData.permanentAddress?.village?.trim()
    ) {
      setErrorMsg('Please complete all Permanent Address fields (Division, District, Upazila, Post Office, Village/Area).');
      return;
    }
    if (!formData.phoneSelf?.trim() && !formData.phone?.trim()) {
      setErrorMsg('Please enter applicant mobile number (Item 13).');
      return;
    }
    if (!formData.heightFeet || !formData.heightInches) {
      setErrorMsg('Please enter height in feet and inches (Item 15).');
      return;
    }
    if (!formData.bloodGroup) {
      setErrorMsg('Please select blood group (Item 16).');
      return;
    }
    if (!formData.weightKg) {
      setErrorMsg('Please enter weight in kg (Item 17).');
      return;
    }
    if (!formData.pledgeAccepted) {
      setErrorMsg('You must agree to the BNCC Service Pledge (Section 20).');
      return;
    }
    if (!formData.guardianConsentAccepted) {
      setErrorMsg('Guardian consent confirmation is required (Section 21).');
      return;
    }
    // Requirement 3: New applicants for cadet recruitment must upload passport size formal picture (fixed 300x300, max 300 KB)
    if (!avatarPreview && !formData.avatarUrl) {
      setErrorMsg('Passport size formal picture is required (fixed 300x300 px, max 300 KB only). Please attach applicant photograph.');
      window.scrollTo({ top: 380, behavior: 'smooth' });
      return;
    }

    const year = new Date().getFullYear();
    const tokenNo = `NGDC-REC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveName = formData.nameEnglish?.trim() || formData.fullName.trim();
    const effectivePhone = formData.phoneSelf?.trim() || formData.phone.trim();

    const newApplicantPayload: Omit<RecruitmentApplicant, 'id' | 'token' | 'appliedAt' | 'status'> = {
      fullName: effectiveName,
      email: formData.email || '',
      phone: effectivePhone,
      collegeRoll: formData.collegeRoll,
      department: formData.department,
      session: formData.session,
      heightFeet: formData.heightFeet,
      heightInches: formData.heightInches,
      weightKg: formData.weightKg,
      bloodGroup: formData.bloodGroup,
      reason: formData.additionalSkills || formData.reason || 'Desire to serve nation through BNCC',
      avatarUrl: avatarPreview || undefined,

      // Detailed official fields
      serialNo: tokenNo,
      nameBangla: formData.nameBangla,
      nameEnglish: formData.nameEnglish,
      fatherNameBangla: formData.fatherNameBangla,
      fatherNameEnglish: formData.fatherNameEnglish,
      motherNameBangla: formData.motherNameBangla,
      motherNameEnglish: formData.motherNameEnglish,
      gender: formData.gender,
      studentClass: formData.studentClass,
      dateOfBirth: formData.dateOfBirth,
      religion: formData.religion,
      presentAddress: formData.presentAddress,
      permanentAddress: formData.permanentAddress,
      phoneSelf: effectivePhone,
      phoneGuardian: formData.phoneGuardian,
      qualifications: formData.qualifications,
      chestNormal: formData.chestNormal,
      chestExpanded: formData.chestExpanded,
      additionalSkills: formData.additionalSkills,
      pledgeAccepted: formData.pledgeAccepted,
      guardianConsentAccepted: formData.guardianConsentAccepted,
    };

    const token = addRecruitmentApplicant(newApplicantPayload);
    const assignedToken = token || tokenNo;

    const completeApplicant: RecruitmentApplicant = {
      id: `app-${Date.now()}`,
      ...newApplicantPayload,
      token: assignedToken,
      serialNo: assignedToken,
      status: 'Pending',
      appliedAt: new Date().toLocaleString(),
    };

    setSubmittedApplicant(completeApplicant);
    setFormSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search Application Status
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSubmitted(true);
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchedApplicant(null);
      return;
    }
    const found = recruitmentApplicants.find(
      (a) =>
        a.token?.toLowerCase() === q ||
        a.serialNo?.toLowerCase() === q ||
        a.collegeRoll?.toLowerCase() === q ||
        a.phone?.toLowerCase().includes(q) ||
        a.fullName?.toLowerCase().includes(q)
    );
    setSearchedApplicant(found || null);
  };

  return (
    <div className={`min-h-screen py-8 sm:py-12 px-4 sm:px-6 max-w-[1180px] mx-auto space-y-10 main-app-content ${showSlip ? 'print:hidden' : ''}`}>
      {/* 1. HERO & RECRUITMENT BANNER */}
      <section
        className="japandi-card bg-[#fcf9f3] dark:bg-[#1b1a17] border border-[#cdc6b3]/70 dark:border-[#38342c] p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-xs"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] text-xs font-bold uppercase tracking-wider border border-[#eedc82]/60">
              <Shield className="w-4 h-4" />
              <span>
                {recruitmentAnnouncement?.batch || recruitmentConfig?.batchName || 'Batch 24'} • Army Wing
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
              {recruitmentAnnouncement?.title || 'Cadet Recruitment Application'}
            </h1>

            <p className="text-sm sm:text-base text-[#4a4738] dark:text-[#aca596] max-w-2xl leading-relaxed">
              {recruitmentAnnouncement?.description ||
                'Join the prestigious 31 BNCC Battalion, Mahasthan Regiment at New Govt. Degree College, Rajshahi. Complete your application online, print the official 2-page hardcopy format, and submit it to Platoon Headquarters.'}
            </p>

            {/* Event Key Facts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f6f3ed] dark:bg-[#25231c] border border-[#cdc6b3]/40 dark:border-[#38342c]">
                <Clock className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] block font-medium">Application Deadline</span>
                  <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {recruitmentAnnouncement?.deadline || '15 October 2026'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f6f3ed] dark:bg-[#25231c] border border-[#cdc6b3]/40 dark:border-[#38342c]">
                <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] block font-medium">Physical Test & Submission</span>
                  <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] truncate">
                    {recruitmentAnnouncement?.venue || 'Platoon HQ Room 123, NGDC'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f6f3ed] dark:bg-[#25231c] border border-[#cdc6b3]/40 dark:border-[#38342c]">
                <Building2 className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] block font-medium">Countersigned Authority</span>
                  <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {recruitmentSignatories?.countersignedTitle || 'Platoon Commander'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platoon & College Emblems */}
          <div className="flex items-center gap-3 shrink-0 p-3 bg-white dark:bg-[#25231c] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] shadow-xs">
            <img src={ASSETS.bnccLogo} alt="BNCC" className="w-14 h-14 object-contain" referrerPolicy="no-referrer" />
            <div className="h-10 w-px bg-gray-300 dark:bg-gray-700" />
            <img src={ASSETS.ngdcLogo} alt="NGDC" className="w-14 h-14 object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="mt-6 pt-5 border-t border-[#cdc6b3]/50 dark:border-[#38342c] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-print-blank-form-hero"
              onClick={() => {
                setIsSlipBlank(true);
                setSlipApplicant(null);
                setShowSlip(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f0eee8] hover:bg-[#ebe8e2] dark:bg-[#25231c] dark:hover:bg-[#322f27] text-[#1c1c18] dark:text-[#fcfbf7] font-bold text-xs sm:text-sm border border-[#cdc6b3] dark:border-[#423e35] transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Print Blank Form (2-Page A4)</span>
            </button>

            <button
              id="btn-check-application-status"
              onClick={() => setShowStatusSearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f0eee8] hover:bg-[#ebe8e2] dark:bg-[#25231c] dark:hover:bg-[#322f27] text-[#1c1c18] dark:text-[#fcfbf7] font-bold text-xs sm:text-sm border border-[#cdc6b3] dark:border-[#423e35] transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Check Application Status</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isWindowActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </span>
            <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              {isWindowActive ? 'Enrolment Window Active' : 'Enrolment Window Closed'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. SUCCESS STATE (IF JUST SUBMITTED) */}
      {formSubmitted && submittedApplicant && (
        <div
          className="japandi-card bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-500/60 p-6 sm:p-8 rounded-3xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                Application Registered Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80">
                Your application has been registered with Serial No:{' '}
                <span className="font-mono font-bold text-black dark:text-white px-2 py-0.5 bg-white/70 dark:bg-black/40 rounded border border-emerald-300 dark:border-emerald-700">
                  {submittedApplicant.serialNo || submittedApplicant.token}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#1e1d19]/80 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 text-xs text-[#1c1c18] dark:text-[#fcfbf7] space-y-2">
            <span className="font-bold uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] block">
              Next Mandatory Steps for Submission:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 leading-relaxed">
              <li>Click <strong>"Print Official 2-Page Form"</strong> below to print your filled application form on A4 paper.</li>
              <li>Affix candidate signature on Section 20 and guardian signature on Section 21.</li>
              <li>Attach photocopy of College ID Card / Admission slip and SSC/HSC marksheets.</li>
              <li>Submit the physical form directly to the <strong>BNCC Platoon HQ (Room 123)</strong> before the deadline.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-print-submitted-slip"
              onClick={() => {
                setSlipApplicant(submittedApplicant);
                setIsSlipBlank(false);
                setShowSlip(true);
              }}
              className="japandi-btn-primary px-6 py-3 font-bold text-sm shadow-md"
            >
              <Printer className="w-4 h-4 mr-2" />
              <span>Download / Print Official 2-Page Form (A4)</span>
            </button>

            {setActiveTab && (
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-[#7c7767] hover:underline px-3 py-2"
              >
                Return to Home
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. RECRUITMENT CLOSED NOTICE OR MAIN ADMISSION FORM */}
      {!formSubmitted && (
        !isWindowActive ? (
          <div
            id="recruitment-closed-notice"
            className="japandi-card bg-[#fcf9f3] dark:bg-[#181714] border-2 border-red-300 dark:border-red-900/60 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-sm max-w-3xl mx-auto my-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                Notice: Enrolment Suspended / Closed
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] leading-tight">
                Currently the recuitment is closed any query contact to Platoon HQ
              </h2>
              <p className="text-xs sm:text-sm text-[#695c4e] dark:text-[#aca596] max-w-xl mx-auto leading-relaxed">
                The online cadet admission portal is currently closed for new enrollments. For questions regarding upcoming recruitment circulars, selection dates, or training activities, please contact the BNCC Platoon Headquarters.
              </p>
            </div>

            {/* Platoon HQ Details Card */}
            <div className="bg-white dark:bg-[#1f1e1a] rounded-2xl p-5 border border-[#cdc6b3]/60 dark:border-[#423e35] text-left text-xs space-y-3 max-w-xl mx-auto">
              <h4 className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
                <Building2 className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>BNCC Platoon HQ • New Govt. Degree College, Rajshahi</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#4a4639] dark:text-[#cdc6b3]">
                <div>
                  <span className="font-semibold block text-[#1c1c18] dark:text-[#fcfbf7]">Office Location:</span>
                  <span>Room 123, Front Building, NGDC Rajshahi</span>
                </div>
                <div>
                  <span className="font-semibold block text-[#1c1c18] dark:text-[#fcfbf7]">Office Hours:</span>
                  <span>Sun - Thu: 09:00 AM - 04:00 PM</span>
                </div>
                <div>
                  <span className="font-semibold block text-[#1c1c18] dark:text-[#fcfbf7]">Contact Number:</span>
                  <span>+880 1712-345678</span>
                </div>
                <div>
                  <span className="font-semibold block text-[#1c1c18] dark:text-[#fcfbf7]">Email:</span>
                  <span>bncc.ngdc@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusSearch(true)}
                className="japandi-btn-secondary text-xs sm:text-sm py-2.5 px-4 font-bold flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Check Application Status</span>
              </button>

              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="japandi-btn-primary text-xs sm:text-sm py-2.5 px-5 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Contact Platoon HQ</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className="bg-[#fbf9f4] dark:bg-[#181714] border border-[#d6cebf] dark:border-[#38342c] p-4 sm:p-7 md:p-9 rounded-3xl shadow-sm space-y-6 sm:space-y-8"
          >
          <div className="border-b border-[#cdc6b3]/60 dark:border-[#38342c] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Recruit Admission Form
              </h2>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-0.5">
                Fill up all personal, academic, and physical details accurately as per college records.
              </p>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/30 px-3 py-1 rounded-full border border-[#eedc82]/50">
              Official Platoon Standard
            </span>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 text-xs text-[#1c1c18] dark:text-[#fcfbf7]">
            {/* Top Card: Photo Upload Box & Name (Items 1 - 3) */}
            <div className="bg-white dark:bg-[#1f1e1a] p-4 sm:p-6 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Photo Box - Fixed 300x300 px, Max 300 KB, Required */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className={`w-36 h-36 aspect-square border-2 border-dashed ${!avatarPreview ? 'border-red-400 dark:border-red-600 bg-red-50/20 dark:bg-red-950/10' : 'border-[#7c7767] dark:border-[#695c4e] bg-[#faf8f5] dark:bg-[#181714]'} rounded-2xl overflow-hidden flex flex-col items-center justify-center p-1 text-center relative group shadow-inner`}>
                  {isPhotoProcessing ? (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-xs text-[#6b5e10] dark:text-[#eedc82] animate-pulse">
                      <Loader2 className="w-7 h-7 animate-spin mb-1 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span className="font-bold text-[11px]">Resizing 300×300...</span>
                    </div>
                  ) : avatarPreview ? (
                    <>
                      <img
                        src={avatarPreview}
                        alt="Applicant Formal Photo"
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <label
                        htmlFor="photo-upload-input"
                        className="absolute inset-0 bg-black/65 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity rounded-xl"
                      >
                        <Upload className="w-5 h-5 mb-1" />
                        <span>Change Photo</span>
                      </label>
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white py-0.5 text-center font-mono font-bold">
                        300 × 300 px
                      </div>
                    </>
                  ) : (
                    <label
                      htmlFor="photo-upload-input"
                      className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 dark:hover:bg-[#25231c] transition-colors p-2 text-center"
                    >
                      <User className="w-9 h-9 text-gray-400 mb-1" />
                      <span className="font-bold text-[11px] text-[#1c1c18] dark:text-[#fcfbf7] leading-tight">
                        Upload Formal Photo <span className="text-red-600 dark:text-red-400">*</span>
                      </span>
                      <span className="text-[9px] text-[#6b5e10] dark:text-[#eedc82] font-semibold mt-0.5">
                        Fixed 300 × 300 px
                      </span>
                      <span className="text-[8px] text-red-600 dark:text-red-400 font-bold mt-0.5 uppercase tracking-wider">
                        Max 300 KB Only
                      </span>
                    </label>
                  )}
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-center max-w-[150px]">
                  {photoMeta?.sizeKb !== undefined ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> 300×300 • {photoMeta.sizeKb} KB
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#7c7767] dark:text-[#aca596] block leading-tight font-medium">
                      Formal passport photo is <span className="text-red-600 dark:text-red-400 font-bold">mandatory</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                      1. Applicant's Name (In Bangla):
                    </label>
                    <input
                      type="text"
                      value={formData.nameBangla || ''}
                      onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                      placeholder="e.g. মোঃ তানভীর আহমেদ"
                      className="japandi-input w-full bg-white dark:bg-[#181714]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                      1. Applicant's Name (In English Capital): <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameEnglish || ''}
                      onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value.toUpperCase(), fullName: e.target.value.toUpperCase() })}
                      placeholder="e.g. MD. TANVIR AHMED"
                      className="japandi-input w-full font-mono uppercase bg-white dark:bg-[#181714]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                      2. Father's Name (In Bangla):
                    </label>
                    <input
                      type="text"
                      value={formData.fatherNameBangla || ''}
                      onChange={(e) => setFormData({ ...formData, fatherNameBangla: e.target.value })}
                      placeholder="e.g. মোঃ রফিকুল ইসলাম"
                      className="japandi-input w-full bg-white dark:bg-[#181714]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                      2. Father's Name (In English Capital):
                    </label>
                    <input
                      type="text"
                      value={formData.fatherNameEnglish || ''}
                      onChange={(e) => setFormData({ ...formData, fatherNameEnglish: e.target.value.toUpperCase() })}
                      placeholder="e.g. MD. RAFIQUL ISLAM"
                      className="japandi-input w-full font-mono uppercase bg-white dark:bg-[#181714]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                      3. Mother's Name (In Bangla):
                    </label>
                    <input
                      type="text"
                      value={formData.motherNameBangla || ''}
                      onChange={(e) => setFormData({ ...formData, motherNameBangla: e.target.value })}
                      placeholder="e.g. মোছাঃ নাসিমা খাতুন"
                      className="japandi-input w-full bg-white dark:bg-[#181714]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                      3. Mother's Name (In English Capital):
                    </label>
                    <input
                      type="text"
                      value={formData.motherNameEnglish || ''}
                      onChange={(e) => setFormData({ ...formData, motherNameEnglish: e.target.value.toUpperCase() })}
                      placeholder="e.g. MST. NASIMA KHATUN"
                      className="japandi-input w-full font-mono uppercase bg-white dark:bg-[#181714]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & Personal Information Card (Items 4 - 10) */}
            <div className="bg-white dark:bg-[#1f1e1a] p-4 sm:p-6 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] border-b border-[#cdc6b3]/50 dark:border-[#38342c] pb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center text-xs font-bold">2</span>
                <span>Academic & Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 4. Gender */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    4. Gender: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="japandi-input w-full bg-white dark:bg-[#181714]"
                  >
                    <option value="">Select Gender *</option>
                    <option value="Male">Male (পুরুষ)</option>
                    <option value="Female">Female (মহিলা)</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* 5. Class */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    5. Class: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={formData.studentClass || ''}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    className="japandi-input w-full bg-white dark:bg-[#181714]"
                  >
                    <option value="">Select Class *</option>
                    <option value="11th">11th (একাদশ)</option>
                    <option value="12th">12th (দ্বাদশ)</option>
                    <option value="Honours 1st year">Honours 1st year (স্নাতক ১ম বর্ষ)</option>
                    <option value="Honours 2nd year">Honours 2nd year (স্নাতক ২য় বর্ষ)</option>
                    <option value="Degree Pass 1st year">Degree Pass 1st year (ডিগ্রি পাস ১ম বর্ষ)</option>
                  </select>
                </div>

                {/* 6. Department / Subject */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    6. Department / Subject: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Science / Physics / Management"
                    className="japandi-input w-full bg-white dark:bg-[#181714]"
                  />
                </div>

                {/* 7. Roll No */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    7. Roll No: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.collegeRoll || ''}
                    onChange={(e) => setFormData({ ...formData, collegeRoll: e.target.value })}
                    placeholder="e.g. 24-SCI-0142"
                    className="japandi-input w-full font-mono bg-white dark:bg-[#181714]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 8. Academic Session */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    8. Academic Session: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.session || ''}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    placeholder="e.g. 2024-2025"
                    className="japandi-input w-full font-mono bg-white dark:bg-[#181714]"
                  />
                </div>

                {/* 9. Date of Birth */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold block text-[#2c281e] dark:text-[#e8e4dc]">
                      9. Date of Birth: <span className="text-red-500 font-bold">*</span>
                    </label>
                    {formData.dateOfBirth && (
                      <span className="text-[10px] font-mono font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/30 px-2 py-0.5 rounded-full border border-[#eedc82]/60">
                        {formatDateOfBirth(formData.dateOfBirth)}
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="japandi-input w-full bg-white dark:bg-[#181714]"
                  />
                </div>

                {/* 10. Religion */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    10. Religion: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={formData.religion || ''}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="japandi-input w-full bg-white dark:bg-[#181714]"
                  >
                    <option value="">Select Religion *</option>
                    <option value="Islam">Islam</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Particulars Card (Items 11 & 12) */}
            <div className="bg-white dark:bg-[#1f1e1a] p-4 sm:p-6 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] border-b border-[#cdc6b3]/50 dark:border-[#38342c] pb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center text-xs font-bold">3</span>
                <span>Residential Addresses (Bangladesh Divisions, Districts & Upazilas)</span>
              </h3>

              {/* 11. Present Address */}
              <div className="p-4 rounded-xl bg-[#faf8f4] dark:bg-[#25231c] border border-[#ded8cc] dark:border-[#3d382e] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs block text-[#6b5e10] dark:text-[#eedc82]">
                    11. Present Address (বর্তমান ঠিকানা): <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">All fields required</span>
                </div>

                {/* Division, District, Upazila Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Division <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.presentAddress?.division || ''}
                      onChange={(e) => handleAddressChange('present', 'division', e.target.value)}
                      className="japandi-input w-full bg-white dark:bg-[#181714]"
                    >
                      <option value="">Select Division *</option>
                      {BANGLADESH_DIVISIONS.map((div) => (
                        <option key={div.id} value={div.name}>
                          {div.name} ({div.bnName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!formData.presentAddress?.division}
                      value={formData.presentAddress?.district || ''}
                      onChange={(e) => handleAddressChange('present', 'district', e.target.value)}
                      className="japandi-input w-full bg-white dark:bg-[#181714] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.presentAddress?.division ? 'Select District *' : 'First Select Division'}
                      </option>
                      {formData.presentAddress?.division &&
                        getDistrictsByDivision(formData.presentAddress.division).map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Upazila / Thana <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!formData.presentAddress?.district}
                      value={formData.presentAddress?.upazila || ''}
                      onChange={(e) => handleAddressChange('present', 'upazila', e.target.value)}
                      className="japandi-input w-full bg-white dark:bg-[#181714] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.presentAddress?.district ? 'Select Upazila *' : 'First Select District'}
                      </option>
                      {formData.presentAddress?.district &&
                        getUpazilasByDistrict(formData.presentAddress.district).map((upz) => (
                          <option key={upz} value={upz}>
                            {upz}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Village and Post Office Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Post Office (Plaintext) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.presentAddress?.post || ''}
                      onChange={(e) => handleAddressChange('present', 'post', e.target.value)}
                      placeholder="e.g. Ghoramara - 6100"
                      className="japandi-input w-full bg-white dark:bg-[#181714]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Village / Area / Road (Plaintext) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.presentAddress?.village || ''}
                      onChange={(e) => handleAddressChange('present', 'village', e.target.value)}
                      placeholder="e.g. Kazihata, Ward 11, Road 4"
                      className="japandi-input w-full bg-white dark:bg-[#181714]"
                    />
                  </div>
                </div>
              </div>

              {/* 12. Permanent Address */}
              <div className="p-4 rounded-xl bg-[#faf8f4] dark:bg-[#25231c] border border-[#ded8cc] dark:border-[#3d382e] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#6b5e10] dark:text-[#eedc82]">
                    12. Permanent Address (স্থায়ী ঠিকানা): <span className="text-red-500">*</span>
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181714] px-3 py-1 rounded-lg border border-[#cdc6b3]/70 dark:border-[#423e35]">
                    <input
                      type="checkbox"
                      checked={Boolean(sameAsPresent)}
                      onChange={(e) => handleSameAddressToggle(e.target.checked)}
                      className="rounded accent-[#6b5e10]"
                    />
                    <span>Same as Present Address (একই ঠিকানা)</span>
                  </label>
                </div>

                {sameAsPresent ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Permanent address is synchronized with present address: <strong>{formData.presentAddress?.village || '...'}, {formData.presentAddress?.post || '...'}, {formData.presentAddress?.upazila || '...'}, {formData.presentAddress?.district || '...'}, {formData.presentAddress?.division || '...'}</strong></span>
                  </div>
                ) : (
                  <>
                    {/* Division, District, Upazila Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Division <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.permanentAddress?.division || ''}
                          onChange={(e) => handleAddressChange('permanent', 'division', e.target.value)}
                          className="japandi-input w-full bg-white dark:bg-[#181714]"
                        >
                          <option value="">Select Division *</option>
                          {BANGLADESH_DIVISIONS.map((div) => (
                            <option key={div.id} value={div.name}>
                              {div.name} ({div.bnName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          District <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          disabled={!formData.permanentAddress?.division}
                          value={formData.permanentAddress?.district || ''}
                          onChange={(e) => handleAddressChange('permanent', 'district', e.target.value)}
                          className="japandi-input w-full bg-white dark:bg-[#181714] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {formData.permanentAddress?.division ? 'Select District *' : 'First Select Division'}
                          </option>
                          {formData.permanentAddress?.division &&
                            getDistrictsByDivision(formData.permanentAddress.division).map((dist) => (
                              <option key={dist} value={dist}>
                                {dist}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Upazila / Thana <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          disabled={!formData.permanentAddress?.district}
                          value={formData.permanentAddress?.upazila || ''}
                          onChange={(e) => handleAddressChange('permanent', 'upazila', e.target.value)}
                          className="japandi-input w-full bg-white dark:bg-[#181714] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {formData.permanentAddress?.district ? 'Select Upazila *' : 'First Select District'}
                          </option>
                          {formData.permanentAddress?.district &&
                            getUpazilasByDistrict(formData.permanentAddress.district).map((upz) => (
                              <option key={upz} value={upz}>
                                {upz}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Village and Post Office Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Post Office (Plaintext) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.permanentAddress?.post || ''}
                          onChange={(e) => handleAddressChange('permanent', 'post', e.target.value)}
                          placeholder="e.g. Ghoramara - 6100"
                          className="japandi-input w-full bg-white dark:bg-[#181714]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Village / Area / Road (Plaintext) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.permanentAddress?.village || ''}
                          onChange={(e) => handleAddressChange('permanent', 'village', e.target.value)}
                          placeholder="e.g. Kazihata, Ward 11, Road 4"
                          className="japandi-input w-full bg-white dark:bg-[#181714]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 13. Contact Particulars Card */}
            <div className="bg-white dark:bg-[#1f1e1a] p-4 sm:p-6 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] border-b border-[#cdc6b3]/50 dark:border-[#38342c] pb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center text-xs font-bold">4</span>
                <span>13. Contact Numbers & Email</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    Mobile No. (Self): <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneSelf || formData.phone}
                    onChange={(e) => setFormData({ ...formData, phoneSelf: e.target.value, phone: e.target.value })}
                    placeholder="e.g. 017XXXXXXXX"
                    className="japandi-input w-full font-mono bg-white dark:bg-[#181714]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">Mobile No. (Guardian):</label>
                  <input
                    type="tel"
                    value={formData.phoneGuardian || ''}
                    onChange={(e) => setFormData({ ...formData, phoneGuardian: e.target.value })}
                    placeholder="e.g. 018XXXXXXXX"
                    className="japandi-input w-full font-mono bg-white dark:bg-[#181714]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">Email Address (if any):</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. applicant@gmail.com"
                    className="japandi-input w-full font-mono bg-white dark:bg-[#181714]"
                  />
                </div>
              </div>
            </div>

            {/* 14. Educational Qualifications Card (Fully Responsive - Zero Horizontal Scrolling) */}
            <div className="bg-white dark:bg-[#1f1e1a] p-4 sm:p-6 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs space-y-4">
              <div className="border-b border-[#cdc6b3]/50 dark:border-[#38342c] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center text-xs font-bold">5</span>
                  <span>14. Educational Qualifications (শিক্ষাগত যোগ্যতা)</span>
                </h3>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">SSC required, HSC for degree/honours</span>
              </div>

              <div className="space-y-4">
                {/* SSC Qualification Section */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-[#dcd6c8] dark:border-[#38342c] bg-[#faf8f4] dark:bg-[#171613] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#6b5e10] text-white text-xs font-bold font-mono">
                        SSC
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                        Secondary School Certificate / Dakhil / Equivalent
                      </span>
                      <span className="text-red-500 font-bold">*</span>
                    </div>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Division / Group */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Division / Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.qualifications?.[0]?.divisionOrGroup || ''}
                        onChange={(e) => handleQualificationChange(0, 'divisionOrGroup', e.target.value)}
                        className="japandi-input w-full py-2 px-2.5 text-xs bg-white dark:bg-[#1f1e1a]"
                      >
                        <option value="">Select Division / Group</option>
                        {DIVISION_GROUP_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Passing Year */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Passing Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.qualifications?.[0]?.passingYear || ''}
                        onChange={(e) => handleQualificationChange(0, 'passingYear', e.target.value)}
                        className="japandi-input w-full py-2 px-2.5 text-xs bg-white dark:bg-[#1f1e1a] font-mono"
                      >
                        <option value="">Select Year</option>
                        {PASSING_YEARS.map((yr) => (
                          <option key={yr} value={yr.toString()}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. GPA Obtained */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        GPA Obtained <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1.00"
                        max="5.00"
                        value={formData.qualifications?.[0]?.gpa || ''}
                        onChange={(e) => handleQualificationChange(0, 'gpa', e.target.value)}
                        placeholder="e.g. 5.00"
                        className="japandi-input w-full py-2 px-3 text-xs font-mono font-bold bg-white dark:bg-[#1f1e1a]"
                      />
                    </div>

                    {/* 4. Education Board */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Education Board <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.qualifications?.[0]?.board || ''}
                        onChange={(e) => handleQualificationChange(0, 'board', e.target.value)}
                        className="japandi-input w-full py-2 px-2.5 text-xs bg-white dark:bg-[#1f1e1a]"
                      >
                        <option value="">Select Board</option>
                        {BANGLADESH_EDUCATION_BOARDS.map((board) => (
                          <option key={board} value={board}>
                            {board}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* HSC Qualification Section */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-[#dcd6c8] dark:border-[#38342c] bg-[#faf8f4] dark:bg-[#171613] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#6b5e10]/20 text-[#6b5e10] dark:text-[#eedc82] text-xs font-bold font-mono">
                        HSC
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                        Higher Secondary Certificate / Alim / Equivalent
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      If applicable (Degree / Honours)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Division / Group */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Division / Group
                      </label>
                      <select
                        value={formData.qualifications?.[1]?.divisionOrGroup || ''}
                        onChange={(e) => handleQualificationChange(1, 'divisionOrGroup', e.target.value)}
                        className="japandi-input w-full py-2 px-2.5 text-xs bg-white dark:bg-[#1f1e1a]"
                      >
                        <option value="">Select Division / Group</option>
                        {DIVISION_GROUP_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Passing Year */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Passing Year
                      </label>
                      <select
                        value={formData.qualifications?.[1]?.passingYear || ''}
                        onChange={(e) => handleQualificationChange(1, 'passingYear', e.target.value)}
                        className="japandi-input w-full py-2 px-2.5 text-xs bg-white dark:bg-[#1f1e1a] font-mono"
                      >
                        <option value="">Select Year</option>
                        {PASSING_YEARS.map((yr) => (
                          <option key={yr} value={yr.toString()}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. GPA Obtained */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        GPA Obtained
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1.00"
                        max="5.00"
                        value={formData.qualifications?.[1]?.gpa || ''}
                        onChange={(e) => handleQualificationChange(1, 'gpa', e.target.value)}
                        placeholder="e.g. 4.80"
                        className="japandi-input w-full py-2 px-3 text-xs font-mono font-bold bg-white dark:bg-[#1f1e1a]"
                      />
                    </div>

                    {/* 4. Education Board */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Education Board
                      </label>
                      <select
                        value={formData.qualifications?.[1]?.board || ''}
                        onChange={(e) => handleQualificationChange(1, 'board', e.target.value)}
                        className="japandi-input w-full py-2 px-2.5 text-xs bg-white dark:bg-[#1f1e1a]"
                      >
                        <option value="">Select Board</option>
                        {BANGLADESH_EDUCATION_BOARDS.map((board) => (
                          <option key={board} value={board}>
                            {board}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Measurements & Skills Card (Items 15 - 19) */}
            <div className="bg-white dark:bg-[#1f1e1a] p-4 sm:p-6 rounded-2xl border border-[#dcd6c8] dark:border-[#3a352b] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] border-b border-[#cdc6b3]/50 dark:border-[#38342c] pb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center text-xs font-bold">6</span>
                <span>Physical Measurements & Additional Skills</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 15. Height */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    15. Height: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="4"
                        max="7"
                        required
                        value={formData.heightFeet || ''}
                        onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                        placeholder="5"
                        className="japandi-input w-full py-2 pr-7 font-mono text-center bg-white dark:bg-[#181714]"
                      />
                      <span className="absolute right-2 text-xs font-bold text-gray-400 pointer-events-none">ft</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        required
                        value={formData.heightInches || ''}
                        onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                        placeholder="8"
                        className="japandi-input w-full py-2 pr-7 font-mono text-center bg-white dark:bg-[#181714]"
                      />
                      <span className="absolute right-2 text-xs font-bold text-gray-400 pointer-events-none">in</span>
                    </div>
                  </div>
                </div>

                {/* 16. Blood Group */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    16. Blood Group: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={formData.bloodGroup || ''}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="japandi-input w-full font-bold bg-white dark:bg-[#181714]"
                  >
                    <option value="">Select Blood Group *</option>
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                  </select>
                </div>

                {/* 17. Weight */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    17. Weight: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      min="35"
                      max="120"
                      value={formData.weightKg || ''}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      placeholder="e.g. 62"
                      className="japandi-input w-full py-2 pr-9 font-mono bg-white dark:bg-[#181714]"
                    />
                    <span className="absolute right-2.5 text-xs font-bold text-gray-400 pointer-events-none">kg</span>
                  </div>
                </div>

                {/* 18. Chest (Normal / Expanded) in inch */}
                <div>
                  <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                    18. Chest (in inch):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={formData.chestNormal || ''}
                        onChange={(e) => setFormData({ ...formData, chestNormal: e.target.value })}
                        placeholder="Norm: 32"
                        className="japandi-input w-full py-2 pr-7 text-xs bg-white dark:bg-[#181714]"
                      />
                      <span className="absolute right-2 text-[11px] font-bold text-gray-400 pointer-events-none">in</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={formData.chestExpanded || ''}
                        onChange={(e) => setFormData({ ...formData, chestExpanded: e.target.value })}
                        placeholder="Exp: 34"
                        className="japandi-input w-full py-2 pr-7 text-xs bg-white dark:bg-[#181714]"
                      />
                      <span className="absolute right-2 text-[11px] font-bold text-gray-400 pointer-events-none">in</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 19. Additional Skills */}
              <div>
                <label className="font-bold block mb-1 text-[#2c281e] dark:text-[#e8e4dc]">
                  19. Additional Skills & Extracurriculars (অতিরিক্ত দক্ষতা ও বিশেষ শখ):
                </label>
                <textarea
                  rows={2}
                  value={formData.additionalSkills || ''}
                  onChange={(e) => setFormData({ ...formData, additionalSkills: e.target.value, reason: e.target.value })}
                  placeholder="e.g. Sports (Football, Cricket), Red Crescent First Aid, Rover Scout, Computer Skills, Band Instruments, Public Speaking..."
                  className="japandi-input w-full resize-none bg-white dark:bg-[#181714]"
                />
              </div>
            </div>

            {/* PLEDGE (Item 20) & GUARDIAN CONSENT (Item 21) */}
            <div className="space-y-4 pt-2">
              {/* Item 20: Pledge */}
              <div className="p-4 rounded-2xl bg-[#eedc82]/20 dark:bg-[#eedc82]/10 border border-[#eedc82]/60 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] block">
                  20. BNCC Cadet Pledge (অঙ্গীকারনামা)
                </span>
                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-justify">
                  "I promise that I shall be bound to perform any service activity in the national interest by order of BNCC. Even at the risk of my life for the defense of the country, I will obey the lawful orders of my superior officers and cadets. From the date of my enlistment in the BNCC, I will be bound to appear for any of the above-mentioned duties whenever called upon by the BNCC as long as my cadetship remains active."
                </p>
                <label className="flex items-start gap-2.5 cursor-pointer font-bold text-xs">
                  <input
                    type="checkbox"
                    required
                    checked={Boolean(formData.pledgeAccepted)}
                    onChange={(e) => setFormData({ ...formData, pledgeAccepted: e.target.checked })}
                    className="mt-0.5 rounded accent-[#6b5e10]"
                  />
                  <span>I solemnly accept and agree to the BNCC Cadet Pledge.</span>
                </label>
              </div>

              {/* Item 21: Guardian Consent */}
              <div className="p-4 rounded-2xl bg-[#eedc82]/20 dark:bg-[#eedc82]/10 border border-[#eedc82]/60 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] block">
                  21. Guardian's Consent Letter (অভিভাবকের সম্মতিপত্র)
                </span>
                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed text-justify">
                  "This is to certify that my child is a 1st-year student in Class 11 / Bachelor's Degree program at New Govt. Degree College, Rajshahi. He/She wishes to become a member of the Bangladesh National Cadet Corps (BNCC) unit of the said college. I hereby grant permission for my son/child to become a member of the Bangladesh National Cadet Corps."
                </p>
                <label className="flex items-start gap-2.5 cursor-pointer font-bold text-xs">
                  <input
                    type="checkbox"
                    required
                    checked={Boolean(formData.guardianConsentAccepted)}
                    onChange={(e) => setFormData({ ...formData, guardianConsentAccepted: e.target.checked })}
                    className="mt-0.5 rounded accent-[#6b5e10]"
                  />
                  <span>I confirm that my parent/guardian has granted official consent for BNCC enlistment.</span>
                </label>
              </div>
            </div>

            {/* Submission Controls */}
            <div className="pt-4 border-t border-[#cdc6b3]/50 dark:border-[#38342c] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                After submission, your application with unique Serial No will be generated for physical 2-page printout.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsSlipBlank(true);
                    setSlipApplicant(null);
                    setShowSlip(true);
                  }}
                  className="japandi-btn-secondary py-3 px-5 text-xs font-bold w-full sm:w-auto text-center"
                >
                  <Printer className="w-4 h-4 mr-1.5 inline" />
                  <span>Print Blank Form</span>
                </button>

                <button
                  id="btn-submit-recruitment-form"
                  type="submit"
                  className="japandi-btn-primary py-3 px-7 text-sm font-bold w-full sm:w-auto text-center shadow-md active:scale-98"
                >
                  <span>Submit & Generate Form</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 inline" />
                </button>
              </div>
            </div>
          </form>
        </div>
        )
      )}

      {/* 4. APPLICATION STATUS SEARCH DRAWER / MODAL */}
      {showStatusSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3] dark:border-[#423e35] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82] rounded-xl">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      Track Recruitment Application
                    </h3>
                    <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                      Search by Serial No, College Roll, or Mobile Number
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStatusSearch(false);
                    setSearchQuery('');
                    setSearchedApplicant(null);
                    setSearchSubmitted(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Serial No (e.g. REC-8192) or Roll No"
                  className="japandi-input flex-1 font-mono text-xs"
                />
                <button type="submit" className="japandi-btn-primary px-4 py-2 font-bold text-xs">
                  Search
                </button>
              </form>

              {searchSubmitted && (
                <div className="pt-2">
                  {searchedApplicant ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#25231c] border border-[#cdc6b3]/70 dark:border-[#38342c] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                          {searchedApplicant.serialNo || searchedApplicant.token}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          searchedApplicant.status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : searchedApplicant.status === 'Shortlisted'
                            ? 'bg-blue-100 text-blue-800'
                            : searchedApplicant.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {searchedApplicant.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                        <div><strong>Applicant Name:</strong> {searchedApplicant.fullName}</div>
                        <div><strong>College Roll:</strong> {searchedApplicant.collegeRoll}</div>
                        <div><strong>Department:</strong> {searchedApplicant.department}</div>
                        <div><strong>Applied Date:</strong> {searchedApplicant.appliedAt}</div>
                      </div>

                      <button
                        onClick={() => {
                          setSlipApplicant(searchedApplicant);
                          setIsSlipBlank(false);
                          setShowSlip(true);
                        }}
                        className="w-full japandi-btn-secondary py-2 text-xs font-bold"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5 inline" />
                        <span>Print Official 2-Page Form</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                      No recruitment record found for "{searchQuery}". Please check your Roll or Serial Number.
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* 5. PRINTABLE 2-PAGE APPLICATION SLIP (MODAL / PRINT VIEW) */}
      {showSlip && (
        <div id="recruitment-slip-modal-root">
          <RecruitmentApplicationSlipA4
            applicant={slipApplicant}
            signatories={recruitmentSignatories}
            isBlank={isSlipBlank}
            onClose={() => setShowSlip(false)}
          />
        </div>
      )}
    </div>
  );
};
