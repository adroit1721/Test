import React, { useState, useEffect } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  User,
  Upload,
  CheckCircle2,
  Shield,
  Award,
  BookOpen,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Share2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { CadetUserAccount, PlatoonCategory } from '../types';

interface CadetRegistrationFormProps {
  isAdmin?: boolean;
  editingCadet?: CadetUserAccount | null;
  onCancelEdit?: () => void;
  onSuccess?: (cadet: CadetUserAccount) => void;
  onGoToLogin?: (cadetNo?: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

// Generated list from Batch-1979 to Current Year (e.g. Batch-2026)
const CADET_BATCHES = Array.from(
  { length: CURRENT_YEAR - 1979 + 1 },
  (_, idx) => `Batch-${1979 + idx}`
);
const EX_CADET_BATCHES = CADET_BATCHES;

export const STANDARD_CADET_RANKS = [
  'Cadet Under Officer (CUO)',
  'Cadet Seargent (SGT)',
  'Cadet Corporal (CPL)',
  'Cadet Lance Corporal (LCPL)',
  'Cadet (CDT)',
];
export const EX_CADET_RANKS = STANDARD_CADET_RANKS;

export const CadetRegistrationForm: React.FC<CadetRegistrationFormProps> = ({
  isAdmin = false,
  editingCadet = null,
  onCancelEdit,
  onSuccess,
  onGoToLogin,
}) => {
  const { cadetRegister, updateCadetUser } = useAdminData();

  // Tab: 'Current' (Currently serving) or 'Ex-cadet' (Ex-cadets Alumni)
  const [cadetType, setCadetType] = useState<'Current' | 'Ex-cadet'>('Current');

  // Currently Serving Form State
  const [servingForm, setServingForm] = useState({
    avatarUrl: '',
    platoon: 'Male Platoon' as 'Male Platoon' | 'Female Platoon' | 'Band Platoon',
    section: 'Section 01',
    rank: 'Cadet (CDT)',
    batch: `Batch-${CURRENT_YEAR}`,
    cadetNo: '',
    password: '',
    name: '',
    nameBangla: '',
    fatherName: '',
    fatherNameBangla: '',
    motherName: '',
    motherNameBangla: '',
    dob: '',
    bloodGroup: 'B+',
    gender: 'Male' as 'Male' | 'Female' | 'Others',
    religion: 'Islam',
    className: '11th',
    department: '',
    presentAddress: '',
    permanentAddress: '',
    phone: '',
    guardianPhone: '',
    email: '',
    additionalSkills: '',
    achievements: '',
  });

  const [servingBatchSortOrder, setServingBatchSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isServingCustomBatch, setIsServingCustomBatch] = useState(false);
  const [servingCustomBatchValue, setServingCustomBatchValue] = useState('');

  // Ex-Cadets Alumni Form State
  const [exForm, setExForm] = useState({
    avatarUrl: '',
    rank: 'Cadet Under Officer (CUO)',
    batch: '',
    cadetNo: '',
    password: '',
    name: '',
    nameBangla: '',
    currentJob: '',
    dob: '',
    bloodGroup: 'B+',
    gender: 'Male' as 'Male' | 'Female' | 'Others',
    religion: 'Islam',
    presentAddress: '',
    permanentAddress: '',
    phone: '',
    socialMedia: '',
    email: '',
    additionalSkills: '',
    achievements: '',
  });

  const [batchSortOrder, setBatchSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCustomBatch, setIsCustomBatch] = useState(false);
  const [customBatchValue, setCustomBatchValue] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCadet, setSuccessCadet] = useState<CadetUserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if editingCadet changes
  useEffect(() => {
    if (editingCadet) {
      const isEx = editingCadet.cadetType === 'Ex-cadet' || editingCadet.category === 'Ex-cadets';
      if (isEx) {
        setCadetType('Ex-cadet');
        setExForm({
          avatarUrl: editingCadet.avatarUrl || '',
          rank: editingCadet.rank || 'Cadet Under Officer (CUO)',
          batch: editingCadet.batch || '',
          cadetNo: editingCadet.cadetNo || '',
          password: editingCadet.password || '',
          name: editingCadet.name || '',
          nameBangla: editingCadet.nameBangla || '',
          currentJob: editingCadet.currentJob || '',
          dob: editingCadet.dob || '',
          bloodGroup: editingCadet.bloodGroup || 'B+',
          gender: (editingCadet.gender as any) || 'Male',
          religion: editingCadet.religion || 'Islam',
          presentAddress: editingCadet.presentAddress || '',
          permanentAddress: editingCadet.permanentAddress || '',
          phone: editingCadet.phone || '',
          socialMedia: editingCadet.socialMedia || '',
          email: editingCadet.email || '',
          additionalSkills: editingCadet.additionalSkills || '',
          achievements: editingCadet.achievements || '',
        });
      } else {
        setCadetType('Current');
        setServingForm({
          avatarUrl: editingCadet.avatarUrl || '',
          platoon: (editingCadet.platoon || editingCadet.category || 'Male Platoon') as any,
          section: editingCadet.section || 'Section 01',
          rank: editingCadet.rank || 'Cadet (CDT)',
          batch: editingCadet.batch || `Batch-${CURRENT_YEAR}`,
          cadetNo: editingCadet.cadetNo || '',
          password: editingCadet.password || '',
          name: editingCadet.name || '',
          nameBangla: editingCadet.nameBangla || '',
          fatherName: editingCadet.fatherName || '',
          fatherNameBangla: editingCadet.fatherNameBangla || '',
          motherName: editingCadet.motherName || '',
          motherNameBangla: editingCadet.motherNameBangla || '',
          dob: editingCadet.dob || '',
          bloodGroup: editingCadet.bloodGroup || 'B+',
          gender: (editingCadet.gender as any) || 'Male',
          religion: editingCadet.religion || 'Islam',
          className: editingCadet.className || '11th',
          department: editingCadet.department || '',
          presentAddress: editingCadet.presentAddress || '',
          permanentAddress: editingCadet.permanentAddress || '',
          phone: editingCadet.phone || '',
          guardianPhone: editingCadet.guardianPhone || '',
          email: editingCadet.email || '',
          additionalSkills: editingCadet.additionalSkills || '',
          achievements: editingCadet.achievements || '',
        });
      }
    }
  }, [editingCadet]);

  // File Upload Helper (converts image to base64 DataURL)
  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'Current' | 'Ex-cadet'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Image size exceeds 3MB. Please choose a smaller passport photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'Current') {
        setServingForm((prev) => ({ ...prev, avatarUrl: result }));
      } else {
        setExForm((prev) => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Section options for currently serving
  const getSectionOptions = (platoon: string) => {
    if (platoon === 'Band Platoon') {
      return ['Band Section 01', 'Band Section 02', 'Band HQ'];
    }
    return ['Section 01', 'Section 02', 'Section 03', 'Platoon HQ'];
  };

  const handleServingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!servingForm.name.trim()) {
      setErrorMsg('Full Name (English) is required.');
      return;
    }
    if (!servingForm.cadetNo.trim()) {
      setErrorMsg('Cadet No. (Login ID) is required.');
      return;
    }
    if (!servingForm.password.trim()) {
      setErrorMsg('Login Password is required.');
      return;
    }
    if (!servingForm.phone.trim()) {
      setErrorMsg('Contact Number (Self) is required.');
      return;
    }

    setIsSubmitting(true);

    const cadetPayload: Partial<CadetUserAccount> = {
      cadetType: 'Current',
      category: servingForm.platoon,
      platoon: servingForm.platoon,
      section: servingForm.section,
      rank: servingForm.rank,
      batch: servingForm.batch,
      cadetNo: servingForm.cadetNo.trim().toUpperCase(),
      password: servingForm.password.trim(),
      name: servingForm.name.trim().toUpperCase(),
      nameBangla: servingForm.nameBangla.trim(),
      fatherName: servingForm.fatherName.trim().toUpperCase(),
      fatherNameBangla: servingForm.fatherNameBangla.trim(),
      motherName: servingForm.motherName.trim().toUpperCase(),
      motherNameBangla: servingForm.motherNameBangla.trim(),
      dob: servingForm.dob.trim(),
      bloodGroup: servingForm.bloodGroup,
      gender: servingForm.gender,
      religion: servingForm.religion,
      className: servingForm.className,
      department: servingForm.department.trim(),
      presentAddress: servingForm.presentAddress.trim(),
      permanentAddress: servingForm.permanentAddress.trim(),
      phone: servingForm.phone.trim(),
      guardianPhone: servingForm.guardianPhone.trim(),
      email: servingForm.email.trim(),
      additionalSkills: servingForm.additionalSkills.trim(),
      achievements: servingForm.achievements.trim(),
      avatarUrl: servingForm.avatarUrl.trim(),
      status: editingCadet ? (editingCadet.status || (isAdmin ? 'Active' : 'Pending Approval')) : (isAdmin ? 'Active' : 'Pending Approval'),
      isApproved: editingCadet ? editingCadet.isApproved : (isAdmin ? true : false),
      collegeId: servingForm.cadetNo.trim().toUpperCase(),
    };

    if (editingCadet) {
      updateCadetUser(editingCadet.id, cadetPayload);
      setIsSubmitting(false);
      const updated = { ...editingCadet, ...cadetPayload } as CadetUserAccount;
      setSuccessCadet(updated);
      if (onSuccess) onSuccess(updated);
      return;
    }

    const res = cadetRegister(cadetPayload);
    setIsSubmitting(false);

    if (res.success && res.cadet) {
      setSuccessCadet(res.cadet);
      if (onSuccess) onSuccess(res.cadet);
    } else {
      setErrorMsg(res.message || 'Failed to register cadet.');
    }
  };

  const handleExSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!exForm.name.trim()) {
      setErrorMsg('Full Name (English) is required.');
      return;
    }
    if (!exForm.cadetNo.trim()) {
      setErrorMsg('Cadet No. (Login ID) is required.');
      return;
    }
    if (!exForm.password.trim()) {
      setErrorMsg('Login Password is required.');
      return;
    }
    if (!exForm.currentJob.trim()) {
      setErrorMsg('Current status/Job is required for Ex-cadets.');
      return;
    }
    if (!exForm.phone.trim()) {
      setErrorMsg('Contact Number (Self) is required.');
      return;
    }
    if (!exForm.batch || !exForm.batch.trim()) {
      setErrorMsg(`Please select your Batch (from Batch-1979 to Current Year ${CURRENT_YEAR}).`);
      return;
    }

    setIsSubmitting(true);

    const cadetPayload: Partial<CadetUserAccount> = {
      cadetType: 'Ex-cadet',
      category: 'Ex-cadets',
      platoon: 'Ex-cadets Alumni',
      section: 'Ex-cadet Platoon',
      rank: exForm.rank,
      batch: exForm.batch,
      cadetNo: exForm.cadetNo.trim().toUpperCase(),
      password: exForm.password.trim(),
      name: exForm.name.trim().toUpperCase(),
      nameBangla: exForm.nameBangla.trim(),
      currentJob: exForm.currentJob.trim(),
      dob: exForm.dob.trim(),
      bloodGroup: exForm.bloodGroup,
      gender: exForm.gender,
      religion: exForm.religion,
      presentAddress: exForm.presentAddress.trim(),
      permanentAddress: exForm.permanentAddress.trim(),
      phone: exForm.phone.trim(),
      socialMedia: exForm.socialMedia.trim(),
      email: exForm.email.trim(),
      additionalSkills: exForm.additionalSkills.trim(),
      achievements: exForm.achievements.trim(),
      avatarUrl: exForm.avatarUrl.trim(),
      status: editingCadet ? (editingCadet.status || (isAdmin ? 'Alumni' : 'Pending Approval')) : (isAdmin ? 'Alumni' : 'Pending Approval'),
      isApproved: editingCadet ? editingCadet.isApproved : (isAdmin ? true : false),
      collegeId: exForm.cadetNo.trim().toUpperCase(),
    };

    if (editingCadet) {
      updateCadetUser(editingCadet.id, cadetPayload);
      setIsSubmitting(false);
      const updated = { ...editingCadet, ...cadetPayload } as CadetUserAccount;
      setSuccessCadet(updated);
      if (onSuccess) onSuccess(updated);
      return;
    }

    const res = cadetRegister(cadetPayload);
    setIsSubmitting(false);

    if (res.success && res.cadet) {
      setSuccessCadet(res.cadet);
      if (onSuccess) onSuccess(res.cadet);
    } else {
      setErrorMsg(res.message || 'Failed to register ex-cadet.');
    }
  };

  const handleReset = () => {
    setSuccessCadet(null);
    setErrorMsg(null);
    setServingForm({
      avatarUrl: '',
      platoon: 'Male Platoon',
      section: 'Section 01',
      rank: 'Cadet (CDT)',
      batch: 'Batch 24',
      cadetNo: '',
      password: '',
      name: '',
      nameBangla: '',
      fatherName: '',
      fatherNameBangla: '',
      motherName: '',
      motherNameBangla: '',
      dob: '',
      bloodGroup: 'B+',
      gender: 'Male',
      religion: 'Islam',
      className: '11th',
      department: '',
      presentAddress: '',
      permanentAddress: '',
      phone: '',
      guardianPhone: '',
      email: '',
      additionalSkills: '',
      achievements: '',
    });
    setExForm({
      avatarUrl: '',
      rank: 'Cadet Under Officer (CUO)',
      batch: '',
      cadetNo: '',
      password: '',
      name: '',
      nameBangla: '',
      currentJob: '',
      dob: '',
      bloodGroup: 'B+',
      gender: 'Male',
      religion: 'Islam',
      presentAddress: '',
      permanentAddress: '',
      phone: '',
      socialMedia: '',
      email: '',
      additionalSkills: '',
      achievements: '',
    });
    setIsCustomBatch(false);
    setCustomBatchValue('');
  };

  // SUCCESS CONFIRMATION RECEIPT
  if (successCadet) {
    const isPendingApproval = !successCadet.isApproved || successCadet.status === 'Pending Approval';

    return (
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-6 text-center shadow-md animate-fadeIn max-w-2xl mx-auto">
        {isPendingApproval ? (
          <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Calendar className="w-9 h-9" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
        )}

        <div className="space-y-2">
          {isPendingApproval ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" /> Awaiting Admin Approval
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#eedc82] text-[#1c1c18]">
              <Sparkles className="w-3.5 h-3.5" /> Direct Directory Addition
            </span>
          )}

          <h3 className="text-xl sm:text-2xl font-black text-[#1c1c18] dark:text-[#fcfbf7]">
            {isPendingApproval ? 'Registration Submitted for Approval!' : 'Cadet Successfully Registered!'}
          </h3>

          <p className="text-xs sm:text-sm text-[#695c4e] dark:text-[#aca596] max-w-lg mx-auto">
            {isPendingApproval ? (
              <>
                Thank you. Your enrolment application for{' '}
                <strong>{successCadet.cadetType === 'Ex-cadet' ? 'Ex-cadet (Alumni)' : 'Currently Serving Cadet'}</strong>{' '}
                has been received and is pending verification by the Platoon Administration. Once approved by Admin, your profile will be added to the official Cadets Directory and you can log in to the portal.
              </>
            ) : (
              <>
                {successCadet.cadetType === 'Ex-cadet' ? 'Ex-cadet (Alumni)' : 'Currently Serving Cadet'}{' '}
                has been directly added to the Platoon Directory & Roster with full portal access.
              </>
            )}
          </p>
        </div>

        {/* Cadet Profile Preview Card */}
        <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#38342c] rounded-2xl flex items-center gap-4 text-left">
          {successCadet.avatarUrl ? (
            <img
              src={successCadet.avatarUrl}
              alt={successCadet.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border-2 border-[#eedc82] shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center font-bold text-xl shrink-0">
              {successCadet.name.charAt(0)}
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1c1c18] text-white">
                {successCadet.cadetNo}
              </span>
              <span className="text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase">
                {successCadet.rank}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300">
                Blood: {successCadet.bloodGroup || 'N/A'}
              </span>
            </div>
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] truncate">
              {successCadet.name} {successCadet.nameBangla && `(${successCadet.nameBangla})`}
            </h4>
            <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
              {successCadet.platoon} • {successCadet.batch}
            </p>
          </div>
        </div>

        {isPendingApproval && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-medium">
            ⏳ Note: You cannot log in to the Cadets Corner portal until your registration is approved by the Platoon Administration.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAdmin && onCancelEdit && (
            <button
              onClick={onCancelEdit}
              className="japandi-btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Cadet Directory</span>
            </button>
          )}

          {onGoToLogin && !isAdmin && (
            <button
              onClick={() => onGoToLogin(successCadet.cadetNo)}
              className="japandi-btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isPendingApproval ? 'Back to Cadet Login' : 'Go to Cadet Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-full border border-[#cdc6b3] dark:border-[#464237] text-[#5c5746] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{editingCadet ? 'Edit Another Cadet' : 'Register Another Cadet'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] p-5 sm:p-8 rounded-3xl space-y-6 shadow-xs">
      {/* Editing Cadet Banner (if in edit mode) */}
      {editingCadet && (
        <div className="p-4 bg-amber-500/15 dark:bg-amber-950/30 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                Editing Cadet Record: {editingCadet.name}
              </h4>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Cadet No: <strong className="font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{editingCadet.cadetNo}</strong> • Platoon: <strong>{editingCadet.category}</strong>
              </p>
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="japandi-btn-secondary text-xs py-2 px-3.5 font-bold cursor-pointer shrink-0"
            >
              Cancel Edit & Return
            </button>
          )}
        </div>
      )}

      {/* Header & Tab Selector */}
      <div className="space-y-4 border-b border-[#cdc6b3]/50 dark:border-[#38342c] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6b5e10] dark:text-[#eedc82] font-black">
              Official Platoon Enrolment Form
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
              {editingCadet ? `Edit Cadet: ${editingCadet.name}` : 'Cadet Directory Registration'}
            </h3>
            <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-0.5">
              {isAdmin
                ? (editingCadet
                    ? 'Update cadet profile fields below. Password, ranks, platoon, and addresses can be adjusted here.'
                    : 'Admin portal registration: Cadets added here are directly verified and saved to the directory.')
                : 'Select cadet status type below. Public submissions require Platoon Admin approval before directory addition and portal login.'}
            </p>
          </div>

          {isAdmin ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" /> {editingCadet ? 'Admin Edit Mode' : 'Direct Directory Addition'}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto">
              <AlertCircle className="w-3.5 h-3.5" /> Requires Admin Approval
            </div>
          )}
        </div>

        {/* Tab View: Currently Serving vs Ex-cadets Alumni */}
        <div className="grid grid-cols-2 gap-2 bg-[#f0eee8] dark:bg-[#141311] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c]">
          <button
            type="button"
            id="tab-serving-cadet"
            onClick={() => {
              setCadetType('Current');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              cadetType === 'Current'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs border border-[#cfb84f]'
                : 'text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Currently Serving Cadet</span>
          </button>

          <button
            type="button"
            id="tab-ex-cadet"
            onClick={() => {
              setCadetType('Ex-cadet');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              cadetType === 'Ex-cadet'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs border border-[#cfb84f]'
                : 'text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Ex-Cadets (Alumni)</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          FORM 1: CURRENTLY SERVING CADETS
          ========================================================================= */}
      {cadetType === 'Current' && (
        <form onSubmit={handleServingSubmit} className="space-y-6 text-xs animate-fadeIn">
          {/* Section A: Photo & Platoon / Section / Rank */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Platoon Assignment & Identity</span>
            </h4>

            {/* Picture Upload */}
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5">
                Picture - With Uniform passport size <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-28 rounded-2xl border-2 border-dashed border-[#cdc6b3] dark:border-[#423e35] bg-[#fcf9f3] dark:bg-[#1e1d19] overflow-hidden flex items-center justify-center shrink-0">
                  {servingForm.avatarUrl ? (
                    <img
                      src={servingForm.avatarUrl}
                      alt="Cadet Passport Photo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-[#9c9586]" />
                  )}
                </div>

                <div className="space-y-2 flex-grow w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, 'Current')}
                    className="w-full text-xs text-[#5c5746] dark:text-[#aca596] file:mr-3 file:py-2 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#eedc82] file:text-[#1c1c18] hover:file:opacity-90 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={servingForm.avatarUrl}
                    onChange={(e) => setServingForm({ ...servingForm, avatarUrl: e.target.value })}
                    className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                  <p className="text-[10px] text-[#7c7767] dark:text-[#aca596]">
                    Passport size portrait in official BNCC uniform is required for the Digital ID and Rank Hierarchy.
                  </p>
                </div>
              </div>
            </div>

            {/* Platoon & Section & Rank & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Platoon (Serving Cadets Select Platoon) <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.platoon}
                  onChange={(e) => {
                    const newPlatoon = e.target.value as 'Male Platoon' | 'Female Platoon' | 'Band Platoon';
                    const newSec = newPlatoon === 'Band Platoon' ? 'Band Section 01' : 'Section 01';
                    const newGender = newPlatoon === 'Female Platoon' ? 'Female' : 'Male';
                    setServingForm({
                      ...servingForm,
                      platoon: newPlatoon,
                      section: newSec,
                      gender: newGender,
                    });
                  }}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] font-bold outline-none"
                >
                  <option value="Male Platoon">Male Platoon</option>
                  <option value="Female Platoon">Female Platoon</option>
                  <option value="Band Platoon">Band Platoon</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Section Assignment <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.section}
                  onChange={(e) => setServingForm({ ...servingForm, section: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  {getSectionOptions(servingForm.platoon).map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Rank <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.rank}
                  onChange={(e) => setServingForm({ ...servingForm, rank: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] font-semibold outline-none cursor-pointer"
                >
                  {STANDARD_CADET_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setServingBatchSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] hover:underline cursor-pointer flex items-center gap-1"
                    title="Toggle batch ordering"
                  >
                    <span>{servingBatchSortOrder === 'desc' ? 'Now → 1979' : '1979 → Now'}</span>
                  </button>
                </div>
                <select
                  required
                  value={isServingCustomBatch ? '__CUSTOM__' : (servingForm.batch || '')}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsServingCustomBatch(true);
                      setServingForm({ ...servingForm, batch: servingCustomBatchValue });
                    } else {
                      setIsServingCustomBatch(false);
                      setServingForm({ ...servingForm, batch: e.target.value });
                    }
                  }}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold cursor-pointer"
                >
                  <option value="">Select Batch (Batch-1979 to Batch-{CURRENT_YEAR})</option>
                  {(servingBatchSortOrder === 'desc' ? [...CADET_BATCHES].reverse() : CADET_BATCHES).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="__CUSTOM__">Other / Custom Batch...</option>
                </select>

                {isServingCustomBatch && (
                  <input
                    type="text"
                    required
                    placeholder={`e.g. Batch-${CURRENT_YEAR}`}
                    value={servingCustomBatchValue}
                    onChange={(e) => {
                      setServingCustomBatchValue(e.target.value);
                      setServingForm({ ...servingForm, batch: e.target.value });
                    }}
                    className="mt-2 w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  />
                )}
              </div>
            </div>

            {/* Login Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Cadet No. (Login ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NGDC-M-101 / 24-105"
                  value={servingForm.cadetNo}
                  onChange={(e) => setServingForm({ ...servingForm, cadetNo: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Login Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Create Login Password"
                  value={servingForm.password}
                  onChange={(e) => setServingForm({ ...servingForm, password: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section B: Personal Details (Bangla & English) */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <User className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Personal Information (Bangla & English)</span>
            </h4>

            {/* Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center justify-between">
                  <span>Full Name (English) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider">Auto-Capitalized</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G. MD. ASHRAFUL ISLAM"
                  value={servingForm.name}
                  onChange={(e) => setServingForm({ ...servingForm, name: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none uppercase font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Name (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="উদা. মোঃ আশরাফুল ইসলাম"
                  value={servingForm.nameBangla}
                  onChange={(e) => setServingForm({ ...servingForm, nameBangla: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Father's Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Father's Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="FATHER'S NAME IN ENGLISH"
                  value={servingForm.fatherName}
                  onChange={(e) => setServingForm({ ...servingForm, fatherName: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Father's Name (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="পিতার নাম বাংলায়"
                  value={servingForm.fatherNameBangla}
                  onChange={(e) => setServingForm({ ...servingForm, fatherNameBangla: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Mother's Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Mother's Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="MOTHER'S NAME IN ENGLISH"
                  value={servingForm.motherName}
                  onChange={(e) => setServingForm({ ...servingForm, motherName: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Mother's Name (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="মাতার নাম বাংলায়"
                  value={servingForm.motherNameBangla}
                  onChange={(e) => setServingForm({ ...servingForm, motherNameBangla: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* DOB & Blood Group & Gender & Religion & Class & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Date of Birth <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  value={servingForm.dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setServingForm({ ...servingForm, dob: e.target.value })}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none cursor-pointer font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.bloodGroup}
                  onChange={(e) => setServingForm({ ...servingForm, bloodGroup: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                >
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

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.gender}
                  onChange={(e) => setServingForm({ ...servingForm, gender: e.target.value as any })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Religion <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.religion}
                  onChange={(e) => setServingForm({ ...servingForm, religion: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  <option value="Islam">Islam</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Buddhism">Buddhism</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={servingForm.className}
                  onChange={(e) => setServingForm({ ...servingForm, className: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                  <option value="Honours 1st year">Honours 1st year</option>
                  <option value="Honours 2nd year">Honours 2nd year</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Department/Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science / Physics"
                  value={servingForm.department}
                  onChange={(e) => setServingForm({ ...servingForm, department: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section C: Address & Contact Details */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Address & Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Present Address
                </label>
                <textarea
                  rows={2}
                  placeholder="House, Road, Area, Thana, District"
                  value={servingForm.presentAddress}
                  onChange={(e) => setServingForm({ ...servingForm, presentAddress: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Permanent Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Village/Road, Post, Thana, District"
                  value={servingForm.permanentAddress}
                  onChange={(e) => setServingForm({ ...servingForm, permanentAddress: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Contact Number: Self <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+880 17..."
                  value={servingForm.phone}
                  onChange={(e) => setServingForm({ ...servingForm, phone: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Contact Number: Guardian <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+880 18..."
                  value={servingForm.guardianPhone}
                  onChange={(e) => setServingForm({ ...servingForm, guardianPhone: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Email (if any)
                </label>
                <input
                  type="email"
                  placeholder="cadet@example.com"
                  value={servingForm.email}
                  onChange={(e) => setServingForm({ ...servingForm, email: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section D: Skills & BNCC Achievements */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Skills & BNCC Accomplishments</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Additional Skills
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Martial arts, Brass bugle, First aid certified, Debate, IT"
                  value={servingForm.additionalSkills}
                  onChange={(e) => setServingForm({ ...servingForm, additionalSkills: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Achievements in BNCC
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Best Firer 2024, Annual Camp Certificate, Victory Day Contingent"
                  value={servingForm.achievements}
                  onChange={(e) => setServingForm({ ...servingForm, achievements: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="japandi-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (editingCadet ? 'Updating Cadet Record...' : 'Registering Cadet...')
                : editingCadet
                ? 'Update Currently Serving Cadet Record'
                : isAdmin
                ? 'Add Currently Serving Cadet Directly to Directory'
                : 'Submit Registration for Platoon Approval'}
            </span>
          </button>
        </form>
      )}

      {/* =========================================================================
          FORM 2: EX-CADETS (ALUMNI)
          ========================================================================= */}
      {cadetType === 'Ex-cadet' && (
        <form onSubmit={handleExSubmit} className="space-y-6 text-xs animate-fadeIn">
          {/* Section A: Photo, Rank, Batch, Login */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Alumni Rank & Verification</span>
            </h4>

            {/* Photo Upload */}
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5">
                Picture / Portrait (Passport size)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-28 rounded-2xl border-2 border-dashed border-[#cdc6b3] dark:border-[#423e35] bg-[#fcf9f3] dark:bg-[#1e1d19] overflow-hidden flex items-center justify-center shrink-0">
                  {exForm.avatarUrl ? (
                    <img
                      src={exForm.avatarUrl}
                      alt="Ex-Cadet Photo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-[#9c9586]" />
                  )}
                </div>

                <div className="space-y-2 flex-grow w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, 'Ex-cadet')}
                    className="w-full text-xs text-[#5c5746] dark:text-[#aca596] file:mr-3 file:py-2 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#eedc82] file:text-[#1c1c18] hover:file:opacity-90 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="Or paste photo URL (https://...)"
                    value={exForm.avatarUrl}
                    onChange={(e) => setExForm({ ...exForm, avatarUrl: e.target.value })}
                    className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Rank, Batch, Cadet No, Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Rank <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={exForm.rank}
                  onChange={(e) => setExForm({ ...exForm, rank: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold cursor-pointer"
                >
                  {EX_CADET_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setBatchSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] hover:underline cursor-pointer flex items-center gap-1"
                    title="Toggle batch ordering"
                  >
                    <span>{batchSortOrder === 'asc' ? '1979 → Now' : 'Now → 1979'}</span>
                  </button>
                </div>
                <select
                  required
                  value={isCustomBatch ? '__CUSTOM__' : exForm.batch}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomBatch(true);
                      setExForm({ ...exForm, batch: customBatchValue });
                    } else {
                      setIsCustomBatch(false);
                      setExForm({ ...exForm, batch: e.target.value });
                    }
                  }}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold cursor-pointer"
                >
                  <option value="">Select Batch (Batch-1979 to {CURRENT_YEAR})</option>
                  {(batchSortOrder === 'asc' ? EX_CADET_BATCHES : [...EX_CADET_BATCHES].reverse()).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="__CUSTOM__">Other / Custom Batch...</option>
                </select>

                {isCustomBatch && (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batch-1980"
                    value={customBatchValue}
                    onChange={(e) => {
                      setCustomBatchValue(e.target.value);
                      setExForm({ ...exForm, batch: e.target.value });
                    }}
                    className="mt-2 w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Cadet No. (Login ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NGDC-EX-2001"
                  value={exForm.cadetNo}
                  onChange={(e) => setExForm({ ...exForm, cadetNo: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Login Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Create Login Password"
                  value={exForm.password}
                  onChange={(e) => setExForm({ ...exForm, password: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section B: Personal Details & Current Job */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Personal & Career Information</span>
            </h4>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center justify-between">
                  <span>Full Name (English) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider">Auto-Capitalized</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G. CAPTAIN TANVIR AHMED"
                  value={exForm.name}
                  onChange={(e) => setExForm({ ...exForm, name: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none uppercase font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Name (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="উদা. ক্যাপ্টেন তানভীর আহমেদ"
                  value={exForm.nameBangla}
                  onChange={(e) => setExForm({ ...exForm, nameBangla: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Current Job, DOB, Blood Group, Gender, Religion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Current status/Job <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Army Officer / Software Eng."
                  value={exForm.currentJob}
                  onChange={(e) => setExForm({ ...exForm, currentJob: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Date of Birth <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  value={exForm.dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExForm({ ...exForm, dob: e.target.value })}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none cursor-pointer font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={exForm.bloodGroup}
                  onChange={(e) => setExForm({ ...exForm, bloodGroup: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                >
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

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={exForm.gender}
                  onChange={(e) => setExForm({ ...exForm, gender: e.target.value as any })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Religion <span className="text-red-500">*</span>
                </label>
                <select
                  value={exForm.religion}
                  onChange={(e) => setExForm({ ...exForm, religion: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  <option value="Islam">Islam</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Buddhism">Buddhism</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section C: Address & Contact */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Address & Social Media</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Present Address
                </label>
                <textarea
                  rows={2}
                  placeholder="House, Road, Area, Thana, District"
                  value={exForm.presentAddress}
                  onChange={(e) => setExForm({ ...exForm, presentAddress: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Permanent Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Village/Road, Post, Thana, District"
                  value={exForm.permanentAddress}
                  onChange={(e) => setExForm({ ...exForm, permanentAddress: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Contact Number: Self <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+880 17..."
                  value={exForm.phone}
                  onChange={(e) => setExForm({ ...exForm, phone: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Social Media (Profile link)
                </label>
                <input
                  type="text"
                  placeholder="e.g. facebook.com/... or linkedin.com/in/..."
                  value={exForm.socialMedia}
                  onChange={(e) => setExForm({ ...exForm, socialMedia: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Email (if any)
                </label>
                <input
                  type="email"
                  placeholder="alumni@example.com"
                  value={exForm.email}
                  onChange={(e) => setExForm({ ...exForm, email: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section D: Skills & BNCC Achievements */}
          <div className="p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Skills & BNCC Accomplishments</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Additional Skills
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Public administration, Leadership, Crisis management"
                  value={exForm.additionalSkills}
                  onChange={(e) => setExForm({ ...exForm, additionalSkills: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Achievements in BNCC
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Former Platoon Senior, Youth Exchange Programme (India), Sword of Honour"
                  value={exForm.achievements}
                  onChange={(e) => setExForm({ ...exForm, achievements: e.target.value })}
                  className="w-full bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="japandi-btn-primary w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (editingCadet ? 'Updating Cadet Record...' : 'Registering Ex-Cadet...')
                : editingCadet
                ? 'Update Ex-Cadet Record'
                : isAdmin
                ? 'Add Ex-Cadet (Alumni) Directly to Directory'
                : 'Submit Ex-Cadet Registration for Platoon Approval'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
