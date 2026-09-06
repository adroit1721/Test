import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { CadetUserAccount, FormFieldConfig, PlatoonCategory, PlatoonSection, CadetRankHierarchyItem } from '../../../types';
import { CadetRegistrationForm } from '../../CadetRegistrationForm';
import { CloudinaryUploader } from '../../common/CloudinaryUploader';
import { DatabaseAndCloudSettingsModal } from '../DatabaseAndCloudSettingsModal';
import { isSupabaseConfigured } from '../../../utils/supabaseClient';
import { isCloudinaryConfigured } from '../../../utils/cloudinary';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  KeyRound,
  Search,
  Filter,
  CheckCircle2,
  X,
  ListPlus,
  UserCheck,
  UserX,
  Lock,
  Music,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Check,
  UserCog,
  Database,
  Cloud,
  RefreshCw,
  Award,
  UploadCloud,
} from 'lucide-react';

const PLATOON_QUOTAS = {
  'Male Platoon': 31,
  'Female Platoon': 31,
  'Band Platoon': 15,
  'Ex-cadets': Infinity,
};

export const CadetCornerTab: React.FC = () => {
  const {
    cadetUsers,
    addCadetUser,
    updateCadetUser,
    deleteCadetUser,
    approveCadetApplicant,
    clearAllCadetUsers,
    cadetRegFields,
    setCadetRegFields,
    syncCadetsWithSupabase,
    isSupabaseActive,
    cadetRanks,
    addCadetRank,
    updateCadetRank,
    deleteCadetRank,
  } = useAdminData();

  // Active subtab: 'roster' | 'registerCadet' | 'hierarchy' | 'applicants'
  const [activeSubtab, setActiveSubtab] = useState<'roster' | 'registerCadet' | 'hierarchy' | 'applicants'>('roster');

  // Supabase & Cloudinary Settings Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Rank Hierarchy modal state
  const [isAddingRank, setIsAddingRank] = useState(false);
  const [editingRank, setEditingRank] = useState<CadetRankHierarchyItem | null>(null);
  const [rankForm, setRankForm] = useState<Omit<CadetRankHierarchyItem, 'id'>>({
    rank: '',
    holderName: '',
    cadetNo: '',
    image: '',
    description: '',
    order: 1,
  });

  const handleStartAddRank = () => {
    setRankForm({
      rank: 'Senior Cadet Under Officer (CUO)',
      holderName: 'Cadet Name',
      cadetNo: 'NGDC-2024-001',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      description: 'Leads the platoon during major ceremonial guards and coordinates drill instructors.',
      order: cadetRanks.length + 1,
    });
    setEditingRank(null);
    setIsAddingRank(true);
  };

  const handleStartEditRank = (rank: CadetRankHierarchyItem) => {
    setEditingRank(rank);
    setRankForm({
      rank: rank.rank,
      holderName: rank.holderName,
      cadetNo: rank.cadetNo || '',
      image: rank.image || '',
      description: rank.description,
      order: rank.order,
    });
    setIsAddingRank(false);
  };

  const handleSaveRank = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRank) {
      updateCadetRank(editingRank.id, rankForm);
      setEditingRank(null);
    } else {
      addCadetRank(rankForm);
      setIsAddingRank(false);
    }
  };

  const handleRankImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRankForm((prev) => ({ ...prev, image: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Search & Filters for Roster
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | PlatoonCategory>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');

  // Add / Edit Cadet Modal State
  const [isAddingCadet, setIsAddingCadet] = useState(false);
  const [editingCadet, setEditingCadet] = useState<CadetUserAccount | null>(null);

  // Password Modal
  const [passwordModalCadet, setPasswordModalCadet] = useState<CadetUserAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Applicant Approval Modal
  const [approvingApplicant, setApprovingApplicant] = useState<CadetUserAccount | null>(null);
  const [approvalPassword, setApprovalPassword] = useState('cadet123');
  const [approvalCategory, setApprovalCategory] = useState<PlatoonCategory>('Male Platoon');
  const [approvalSection, setApprovalSection] = useState<string>('Section 01');
  const [approvalRank, setApprovalRank] = useState('Cadet (CDT)');
  const [approvalCadetNo, setApprovalCadetNo] = useState('');

  // Cadet Form Data
  const [cadetForm, setCadetForm] = useState<Omit<CadetUserAccount, 'id'>>({
    cadetNo: '',
    password: '',
    name: '',
    category: 'Male Platoon',
    section: 'Section 01',
    rank: 'Cadet (CDT)',
    gender: 'Male',
    appointment: 'Cadet',
    platoon: 'Male Platoon',
    batch: 'Batch 24',
    collegeId: '',
    department: 'Dept. of Science',
    bloodGroup: 'B+',
    phone: '',
    email: '',
    joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    attendancePercentage: 100,
    paradesAttended: 24,
    totalParades: 24,
    campsAttended: [],
    certificates: [],
    status: 'Active',
    cadetType: 'Current',
    isApproved: true,
    avatarUrl: '',
  });

  // Form Builder Field State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormFieldConfig['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // Quota counts for currently serving approved cadets
  const approvedCadets = cadetUsers.filter((c) => c.isApproved && c.status !== 'Pending Approval');
  const pendingApplicants = cadetUsers.filter((c) => !c.isApproved || c.status === 'Pending Approval');

  const maleServingCount = approvedCadets.filter((c) => c.category === 'Male Platoon' && c.cadetType !== 'Ex-cadet').length;
  const femaleServingCount = approvedCadets.filter((c) => c.category === 'Female Platoon' && c.cadetType !== 'Ex-cadet').length;
  const bandServingCount = approvedCadets.filter((c) => c.category === 'Band Platoon' && c.cadetType !== 'Ex-cadet').length;
  const exCadetCount = approvedCadets.filter((c) => c.category === 'Ex-cadets' || c.cadetType === 'Ex-cadet').length;

  // Band gender breakdown
  const bandMaleCount = approvedCadets.filter((c) => c.category === 'Band Platoon' && c.gender === 'Male').length;
  const bandFemaleCount = approvedCadets.filter((c) => c.category === 'Band Platoon' && c.gender === 'Female').length;

  const handleStartAddCadet = (defaultCat: PlatoonCategory = 'Male Platoon') => {
    const isEx = defaultCat === 'Ex-cadets';
    const initialSection = defaultCat === 'Band Platoon' ? 'Band Section 01' : isEx ? 'Ex-cadet Platoon' : 'Section 01';
    const initialGender = defaultCat === 'Female Platoon' ? 'Female' : 'Male';

    setCadetForm({
      cadetNo: `NGDC-${defaultCat === 'Male Platoon' ? 'M' : defaultCat === 'Female Platoon' ? 'F' : defaultCat === 'Band Platoon' ? 'B' : 'EX'}-${Math.floor(100 + Math.random() * 900)}`,
      password: 'cadet' + Math.floor(100 + Math.random() * 900),
      name: '',
      category: defaultCat,
      section: initialSection,
      rank: 'Cadet (CDT)',
      gender: initialGender,
      appointment: 'Cadet Trainee',
      platoon: defaultCat,
      batch: 'Batch 24',
      collegeId: '',
      department: 'Dept. of Science & Humanities',
      bloodGroup: 'B+',
      phone: '+880 17...',
      email: '',
      joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      attendancePercentage: 100,
      paradesAttended: 24,
      totalParades: 24,
      campsAttended: [],
      certificates: [],
      status: isEx ? 'Alumni' : 'Active',
      cadetType: isEx ? 'Ex-cadet' : 'Current',
      isApproved: true,
      avatarUrl: '',
    });
    setEditingCadet(null);
    setIsAddingCadet(true);
  };

  const handleStartEditCadet = (cadet: CadetUserAccount) => {
    setEditingCadet(cadet);
    setCadetForm({
      cadetNo: cadet.cadetNo,
      password: cadet.password,
      name: cadet.name,
      category: cadet.category || 'Male Platoon',
      section: cadet.section || 'Section 01',
      rank: cadet.rank,
      gender: cadet.gender || 'Male',
      appointment: cadet.appointment || 'Cadet',
      platoon: cadet.platoon,
      batch: cadet.batch,
      collegeId: cadet.collegeId,
      department: cadet.department,
      bloodGroup: cadet.bloodGroup,
      phone: cadet.phone,
      email: cadet.email || '',
      joiningDate: cadet.joiningDate,
      attendancePercentage: cadet.attendancePercentage,
      paradesAttended: cadet.paradesAttended,
      totalParades: cadet.totalParades,
      campsAttended: cadet.campsAttended,
      certificates: cadet.certificates,
      status: cadet.status,
      cadetType: cadet.cadetType,
      isApproved: cadet.isApproved,
      avatarUrl: cadet.avatarUrl || '',
    });
    setIsAddingCadet(false);
  };

  const handleSaveCadet = (e: React.FormEvent) => {
    e.preventDefault();

    // Check quota for new additions
    if (!editingCadet && cadetForm.cadetType !== 'Ex-cadet' && cadetForm.category !== 'Ex-cadets') {
      const quota = PLATOON_QUOTAS[cadetForm.category];
      const currentServing = cadetForm.category === 'Male Platoon'
        ? maleServingCount
        : cadetForm.category === 'Female Platoon'
        ? femaleServingCount
        : bandServingCount;

      if (currentServing >= quota) {
        if (!confirm(`Warning: ${cadetForm.category} already has ${currentServing} serving cadets (quota is ${quota}). Do you still wish to add this cadet?`)) {
          return;
        }
      }
    }

    if (editingCadet) {
      updateCadetUser(editingCadet.id, {
        ...cadetForm,
        status: cadetForm.category === 'Ex-cadets' ? 'Alumni' : cadetForm.status,
        cadetType: cadetForm.category === 'Ex-cadets' ? 'Ex-cadet' : cadetForm.cadetType,
      });
      setEditingCadet(null);
    } else {
      addCadetUser({
        ...cadetForm,
        status: cadetForm.category === 'Ex-cadets' ? 'Alumni' : 'Active',
        cadetType: cadetForm.category === 'Ex-cadets' ? 'Ex-cadet' : 'Current',
        isApproved: true,
      });
      setIsAddingCadet(false);
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalCadet || !newPasswordValue.trim()) return;
    updateCadetUser(passwordModalCadet.id, { password: newPasswordValue.trim() });
    alert(`Password for Cadet ${passwordModalCadet.cadetNo} (${passwordModalCadet.name}) updated to: "${newPasswordValue.trim()}"`);
    setPasswordModalCadet(null);
    setNewPasswordValue('');
  };

  const handleStartApproveApplicant = (applicant: CadetUserAccount) => {
    setApprovingApplicant(applicant);
    setApprovalPassword(`pass${Math.floor(1000 + Math.random() * 9000)}`);
    setApprovalCategory(applicant.category || (applicant.gender === 'Female' ? 'Female Platoon' : 'Male Platoon'));
    setApprovalSection(applicant.section || 'Section 01');
    setApprovalRank(applicant.rank || 'Cadet (CDT)');
    setApprovalCadetNo(applicant.cadetNo || `NGDC-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingApplicant) return;

    if (!approvalPassword.trim()) {
      alert('Please enter a password for this cadet so they can log in.');
      return;
    }

    approveCadetApplicant(approvingApplicant.id, {
      password: approvalPassword.trim(),
      category: approvalCategory,
      section: approvalSection,
      rank: approvalRank,
      cadetNo: approvalCadetNo.trim(),
    });

    alert(`Cadet "${approvingApplicant.name}" approved!\nLogin ID: ${approvalCadetNo.trim()}\nPassword: ${approvalPassword.trim()}\nPlatoon: ${approvalCategory} (${approvalSection})`);
    setApprovingApplicant(null);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const newField: FormFieldConfig = {
      id: `cr-fld-${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: `Enter ${newFieldLabel.trim()}...`,
      options:
        newFieldType === 'select'
          ? (newFieldOptions || '')
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };
    setCadetRegFields((prev) => [...prev, newField]);
    setNewFieldLabel('');
    setNewFieldOptions('');
  };

  const handleDeleteField = (id: string) => {
    setCadetRegFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Filtered Approved Cadets
  const filteredRoster = approvedCadets.filter((c) => {
    const matchesSearch =
      c.cadetNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    const matchesCategory =
      categoryFilter === 'All' || c.category === categoryFilter || (categoryFilter === 'Ex-cadets' && c.cadetType === 'Ex-cadet');

    const matchesSection = sectionFilter === 'All' || c.section === sectionFilter;

    return matchesSearch && matchesCategory && matchesSection;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Platoon Category Quota Cards */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Cadet Corner Admin & Command Roster
              </h2>
            </div>
            <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1 max-w-3xl">
              Manage the 3 serving cadet platoon categories (Male: 31 quota, Female: 31 quota, Band: 15 mixed) and unlimited Ex-cadets.
              Define login IDs, passwords, review applicants, and control the rank hierarchy displayed on the About page.
            </p>

            {/* Supabase & Cloudinary Quick Status Bar */}
            <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Database className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>DB & Cloud Storage Settings</span>
                {isSupabaseConfigured() && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Supabase Postgres Connected"></span>
                )}
              </button>

              <button
                onClick={async () => {
                  setIsSyncing(true);
                  await syncCadetsWithSupabase();
                  setTimeout(() => setIsSyncing(false), 600);
                }}
                disabled={isSyncing}
                className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-medium"
                title="Synchronize Cadets with Supabase Postgres"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#6b5e10]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
              </button>

              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                <span>Cloudinary: {isCloudinaryConfigured() ? 'Active CDN' : 'Local Fallback'}</span>
              </span>
            </div>
          </div>

          {/* Subtab Switcher */}
          <div className="flex items-center bg-[#f0eee8] dark:bg-[#141311] p-1 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] shrink-0 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setActiveSubtab('roster')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'roster'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Platoon Roster ({approvedCadets.length})</span>
            </button>

            <button
              onClick={() => setActiveSubtab('applicants')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'applicants'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Applicants</span>
              {pendingApplicants.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  {pendingApplicants.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubtab('hierarchy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'hierarchy'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Rank Hierarchy ({cadetRanks.length})</span>
            </button>

            <button
              onClick={() => setActiveSubtab('registerCadet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'registerCadet'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Cadet to Directory</span>
            </button>
          </div>
        </div>

        {/* 4 Platoon Category Quota Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* 1. Male Platoon */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Male Platoon</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                Quota: 31
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {maleServingCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">/ 31 Serving</span>
              </div>
              <span className="text-[11px] text-[#695c4e] dark:text-[#aca596]">
                {31 - maleServingCount > 0 ? `${31 - maleServingCount} Vacant` : 'Full'}
              </span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (maleServingCount / 31) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Female Platoon */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Female Platoon</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                Quota: 31
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {femaleServingCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">/ 31 Serving</span>
              </div>
              <span className="text-[11px] text-[#695c4e] dark:text-[#aca596]">
                {31 - femaleServingCount > 0 ? `${31 - femaleServingCount} Vacant` : 'Full'}
              </span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (femaleServingCount / 31) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. Band Platoon */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-600" />
                <span>Band Platoon</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Quota: 15 (Mixed)
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {bandServingCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">/ 15 Members</span>
              </div>
              <span className="text-[10px] text-[#695c4e] dark:text-[#aca596]">
                {bandMaleCount}♂ | {bandFemaleCount}♀
              </span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (bandServingCount / 15) * 100)}%` }}
              />
            </div>
          </div>

          {/* 4. Ex-cadets */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ex-cadets (Alumni)</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Unlimited
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {exCadetCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">Alumni Cadets</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Since 1979</span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-full opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: PLATOON ROSTER & DIRECTORY */}
      {activeSubtab === 'roster' && (
        <div className="space-y-4">
          {/* Controls: Search, Category Filters, Section Filter, Add Cadet, Clear All */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#fcf9f3] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7c7767]" />
                <input
                  type="text"
                  placeholder="Search by Cadet No / Login ID, Name, Roll, Dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-9 pr-3.5 py-2 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-[#f6f3ed] dark:bg-[#141311] p-1 rounded-xl border border-[#cdc6b3]/50 dark:border-[#423e35] text-xs">
                {(['All', 'Male Platoon', 'Female Platoon', 'Band Platoon', 'Ex-cadets'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-[11px] ${
                      categoryFilter === cat
                        ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs font-bold'
                        : 'text-[#695c4e] dark:text-[#aca596]'
                    }`}
                  >
                    {cat === 'All' ? 'All Cadets' : cat}
                  </button>
                ))}
              </div>

              {/* Section Filter */}
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
              >
                <option value="All">All Sections</option>
                <option value="Platoon HQ">Platoon HQ</option>
                <option value="Section 01">Section 01</option>
                <option value="Section 02">Section 02</option>
                <option value="Section 03">Section 03</option>
                <option value="Band HQ">Band HQ</option>
                <option value="Band Section 01">Band Section 01 (Brass/Bugle)</option>
                <option value="Band Section 02">Band Section 02 (Drums)</option>
                <option value="Ex-cadet Platoon">Ex-cadet Platoon</option>
              </select>

              <button
                onClick={() => setActiveSubtab('registerCadet')}
                className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Cadet</span>
              </button>

              {approvedCadets.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all cadets from the Cadet Corner directory? This cannot be undone.')) {
                      clearAllCadetUsers();
                    }
                  }}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer border border-[#cdc6b3]/50 dark:border-[#423e35]"
                  title="Clear All Cadets (Empty Slate)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cadet Cards / List */}
          {filteredRoster.length === 0 ? (
            <div className="p-12 text-center bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] rounded-3xl space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eedc82]/30 flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82]">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  No Cadets Found in Platoon Directory
                </h3>
                <p className="text-xs text-[#695c4e] dark:text-[#aca596] max-w-md mx-auto mt-1">
                  {cadetUsers.length === 0
                    ? 'The cadet database is currently a clean empty slate. Platoon administration can now register new cadets into Male, Female, Band, or Ex-cadets categories.'
                    : 'No cadets matched your current search and filter criteria.'}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveSubtab('registerCadet')}
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register First Cadet</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoster.map((cadet, cIdx) => (
                <div
                  key={cadet.id ? `cadet-${cadet.id}-${cIdx}` : `cadet-${cIdx}`}
                  className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {cadet.avatarUrl ? (
                      <img
                        src={cadet.avatarUrl}
                        alt={cadet.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-[#cdc6b3] dark:border-[#423e35] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#eedc82]/30 border border-[#cdc6b3] dark:border-[#423e35] flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82] font-mono font-bold text-xs shrink-0">
                        {cadet.bloodGroup || 'BNCC'}
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/25 px-2 py-0.5 rounded-md border border-[#cdc6b3]/40">
                          {cadet.cadetNo}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cadet.category === 'Male Platoon'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                              : cadet.category === 'Female Platoon'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              : cadet.category === 'Band Platoon'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {cadet.category || 'Male Platoon'}
                        </span>
                        {cadet.section && (
                          <span className="text-[10px] font-medium bg-[#f0eee8] dark:bg-[#141311] text-[#4a4738] dark:text-[#aca596] px-2 py-0.5 rounded-md border border-[#cdc6b3]/40">
                            {cadet.section}
                          </span>
                        )}
                        {cadet.gender && (
                          <span className="text-[10px] text-[#7c7767]">
                            ({cadet.gender})
                          </span>
                        )}
                        <span className="text-[10px] text-[#7c7767] font-mono bg-zinc-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded">
                          Pass: <strong>{cadet.password}</strong>
                        </span>
                      </div>

                      <h4 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] truncate">
                        {cadet.rank} {cadet.name}
                      </h4>

                      <div className="flex items-center gap-2.5 text-xs text-[#695c4e] dark:text-[#aca596] flex-wrap">
                        <span>{cadet.department}</span>
                        <span>•</span>
                        <span>{cadet.batch}</span>
                        <span>•</span>
                        <span>Phone: {cadet.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => {
                        setPasswordModalCadet(cadet);
                        setNewPasswordValue(cadet.password);
                      }}
                      className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                      title="Set or Change Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Set Pass</span>
                    </button>
                    <button
                      onClick={() => handleStartEditCadet(cadet)}
                      className="japandi-btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1 cursor-pointer"
                      title="Edit Cadet Record"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete cadet "${cadet.cadetNo} - ${cadet.name}"?`)) {
                          deleteCadetUser(cadet.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 cursor-pointer"
                      title="Remove from Platoon Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: PENDING APPLICANTS & APPROVAL */}
      {activeSubtab === 'applicants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#fcf9f3] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
            <div>
              <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Cadet Registration Submissions</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Cadets submit registration via the public Cadet Corner. Review each applicant, assign their official login password, platoon category, rank, and section.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
              {pendingApplicants.length} Pending
            </span>
          </div>

          {pendingApplicants.length === 0 ? (
            <div className="p-12 text-center bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] rounded-3xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                No Pending Applicants
              </h4>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596] max-w-sm mx-auto">
                All submitted cadet registrations have been reviewed. When new cadets submit the registration form, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApplicants.map((appl, aIdx) => (
                <div
                  key={appl.id ? `pending-${appl.id}-${aIdx}` : `pending-${aIdx}`}
                  className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-amber-500/40 p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Pending Admin Approval
                      </span>
                      <span className="font-mono text-xs font-bold bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] px-2 py-0.5 rounded">
                        {appl.cadetNo || appl.collegeId}
                      </span>
                      <span className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                        Category: <strong>{appl.category}</strong>
                      </span>
                      {appl.gender && (
                        <span className="text-xs text-[#7c7767]">({appl.gender})</span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">
                      {appl.name}
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-[#695c4e] dark:text-[#aca596] pt-1">
                      <div>Dept: <strong>{appl.department}</strong></div>
                      <div>Batch: <strong>{appl.batch}</strong></div>
                      <div>Blood: <strong className="text-red-600 font-bold">{appl.bloodGroup}</strong></div>
                      <div>DOB: <strong>{appl.dob || 'N/A'}</strong></div>
                      <div>Phone: <strong>{appl.phone || 'N/A'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleStartApproveApplicant(appl)}
                      className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Review & Approve (Set Password)</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Reject and delete registration for "${appl.name}"?`)) {
                          deleteCadetUser(appl.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 cursor-pointer"
                      title="Reject Applicant"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: CADET RANK HIERARCHY (Transferred from About Us Admin) */}
      {activeSubtab === 'hierarchy' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="text-lg md:text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Cadet Rank Hierarchy Control
                </h3>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Manage the formal chain of cadet ranks (CUO, Sergeant, Corporal, Lance Corporal, Cadet), appointment holders, and official command duties.
              </p>
            </div>
            <button
              onClick={handleStartAddRank}
              className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rank Level</span>
            </button>
          </div>

          {cadetRanks.length === 0 ? (
            <div className="p-12 text-center bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] rounded-3xl space-y-3">
              <Award className="w-10 h-10 text-[#7c7767] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                No cadet rank hierarchy levels configured yet
              </p>
              <button
                onClick={handleStartAddRank}
                className="japandi-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Rank Level</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...cadetRanks]
                .sort((a, b) => a.order - b.order)
                .map((rank) => (
                  <div
                    key={rank.id}
                    className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-5 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-[#eedc82] text-[#1c1c18] font-bold text-xs flex items-center justify-center shrink-0">
                            #{rank.order}
                          </span>
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] border border-[#eedc82]/60">
                              {rank.rank}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditRank(rank)}
                            className="p-1.5 rounded-lg text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] hover:bg-[#eedc82]/20 cursor-pointer"
                            title="Edit Rank Level"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete rank level "${rank.rank}"?`)) {
                                deleteCadetRank(rank.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title="Delete Rank Level"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        {rank.image ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#cdc6b3] dark:border-[#423e35] shrink-0 bg-[#ded2be]">
                            <img
                              src={rank.image}
                              alt={rank.holderName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#eedc82]/20 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center font-bold text-base border border-[#eedc82]/40 shrink-0">
                            {rank.holderName?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] truncate">
                            {rank.holderName}
                          </h4>
                          {rank.cadetNo && (
                            <p className="text-xs text-[#6b5e10] dark:text-[#eedc82] font-mono">
                              {rank.cadetNo}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed line-clamp-3 pt-1">
                        {rank.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-between text-[11px] text-[#7c7767]">
                      <span>Order Priority: {rank.order}</span>
                      <span className="font-semibold text-[#6b5e10] dark:text-[#eedc82]">Active Rank</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: DIRECT CADET REGISTRATION (CURRENTLY SERVING & EX-CADETS) */}
      {activeSubtab === 'registerCadet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSubtab('roster')}
              className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82] hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Back to Platoon Roster
            </button>
          </div>
          <CadetRegistrationForm
            isAdmin={true}
            onSuccess={() => {}}
          />
        </div>
      )}

      {/* MODAL 1: ADD OR EDIT CADET */}
      {(isAddingCadet || editingCadet) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <UserCog className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>{editingCadet ? 'Edit Cadet Record' : 'Register New Cadet to Directory'}</span>
              </h4>
              <button
                onClick={() => {
                  setIsAddingCadet(false);
                  setEditingCadet(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCadet} className="space-y-3 text-xs">
              {/* Status / Enrollment Type: Serving Cadet vs Ex-cadet */}
              <div className="bg-[#f6f3ed] dark:bg-[#141311] p-3 rounded-2xl border border-[#cdc6b3]/60 dark:border-[#423e35] space-y-2">
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Cadet Classification / Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCadetForm({
                        ...cadetForm,
                        cadetType: 'Current',
                        category: cadetForm.category === 'Ex-cadets' ? 'Male Platoon' : cadetForm.category,
                        status: 'Active',
                        section: cadetForm.section === 'Ex-cadet Platoon' ? 'Section 01' : cadetForm.section,
                      });
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                      cadetForm.cadetType !== 'Ex-cadet'
                        ? 'bg-[#eedc82] text-[#1c1c18] border-[#d5c470] shadow-xs'
                        : 'bg-white dark:bg-[#1c1b17] text-[#695c4e] dark:text-[#aca596] border-[#cdc6b3]/50'
                    }`}
                  >
                    Serving Cadet (Current)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCadetForm({
                        ...cadetForm,
                        cadetType: 'Ex-cadet',
                        category: 'Ex-cadets',
                        status: 'Alumni',
                        section: 'Ex-cadet Platoon',
                      });
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                      cadetForm.cadetType === 'Ex-cadet'
                        ? 'bg-[#eedc82] text-[#1c1c18] border-[#d5c470] shadow-xs'
                        : 'bg-white dark:bg-[#1c1b17] text-[#695c4e] dark:text-[#aca596] border-[#cdc6b3]/50'
                    }`}
                  >
                    Ex-cadet (Alumni)
                  </button>
                </div>
              </div>

              {/* Category & Section Selection */}
              {cadetForm.cadetType !== 'Ex-cadet' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Platoon (Serving Cadets Select Platoon) *
                    </label>
                    <select
                      value={cadetForm.category}
                      onChange={(e) => {
                        const cat = e.target.value as PlatoonCategory;
                        setCadetForm({
                          ...cadetForm,
                          category: cat,
                          section: cat === 'Band Platoon' ? 'Band Section 01' : 'Section 01',
                          gender: cat === 'Female Platoon' ? 'Female' : cat === 'Male Platoon' ? 'Male' : cadetForm.gender,
                        });
                      }}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                    >
                      <option value="Male Platoon">Male Platoon</option>
                      <option value="Female Platoon">Female Platoon</option>
                      <option value="Band Platoon">Band Platoon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Section Assignment *
                    </label>
                    <select
                      value={cadetForm.section}
                      onChange={(e) => setCadetForm({ ...cadetForm, section: e.target.value as PlatoonSection })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                    >
                      {cadetForm.category === 'Band Platoon' ? (
                        <>
                          <option value="Band HQ">Band HQ (Cadet Seargent / Corporals)</option>
                          <option value="Band Section 01">Band Section 01 (LCPL & 3 Cadets)</option>
                          <option value="Band Section 02">Band Section 02 (LCPL & 3 Cadets)</option>
                          <option value="Band Section 03">Band Section 03 (LCPL & 3 Cadets)</option>
                        </>
                      ) : (
                        <>
                          <option value="Platoon HQ">Platoon HQ (CUO / Cadet Seargent)</option>
                          <option value="Section 01">Section 01 (Corporal, Lance Corporal, Cadets)</option>
                          <option value="Section 02">Section 02 (Corporal, Lance Corporal, Cadets)</option>
                          <option value="Section 03">Section 03 (Corporal, Lance Corporal, Cadets)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-dashed border-[#cdc6b3] dark:border-[#423e35] text-xs text-[#695c4e] dark:text-[#aca596] flex items-center justify-between">
                  <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">Ex-cadet Alumni</span>
                  <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg text-[11px]">
                    No Platoon Selection Required
                  </span>
                </div>
              )}

              {/* Login Credentials: ID & Password */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#eedc82]/15 border border-[#cdc6b3]/50 rounded-2xl">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Cadet No. (Login ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NGDC-M-01 or Roll"
                    value={cadetForm.cadetNo}
                    onChange={(e) => setCadetForm({ ...cadetForm, cadetNo: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Login Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cadet2024"
                    value={cadetForm.password}
                    onChange={(e) => setCadetForm({ ...cadetForm, password: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Name & Gender */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={cadetForm.name}
                    onChange={(e) => setCadetForm({ ...cadetForm, name: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Gender *
                  </label>
                  <select
                    value={cadetForm.gender}
                    onChange={(e) => setCadetForm({ ...cadetForm, gender: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Rank & Appointment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Rank *
                  </label>
                  <select
                    value={cadetForm.rank}
                    onChange={(e) => setCadetForm({ ...cadetForm, rank: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  >
                    <option value="Cadet Under Officer/CUO">Cadet Under Officer/CUO</option>
                    <option value="Cadet Seargent">Cadet Seargent</option>
                    <option value="Cadet Corporal">Cadet Corporal</option>
                    <option value="Cadet Lance Corporal">Cadet Lance Corporal</option>
                    <option value="Cadet">Cadet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Batch / Session
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Batch 24 (2024-25)"
                    value={cadetForm.batch}
                    onChange={(e) => setCadetForm({ ...cadetForm, batch: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Department & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dept. of Physics"
                    value={cadetForm.department}
                    onChange={(e) => setCadetForm({ ...cadetForm, department: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Blood Group
                  </label>
                  <select
                    value={cadetForm.bloodGroup}
                    onChange={(e) => setCadetForm({ ...cadetForm, bloodGroup: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Contact Phone & College Roll */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 17..."
                    value={cadetForm.phone}
                    onChange={(e) => setCadetForm({ ...cadetForm, phone: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    College Roll / ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 110492"
                    value={cadetForm.collegeId}
                    onChange={(e) => setCadetForm({ ...cadetForm, collegeId: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Cadet Photo / Avatar URL with Cloudinary Upload */}
              <div>
                <CloudinaryUploader
                  label="Cadet Profile Photograph (Cloudinary Upload)"
                  value={cadetForm.avatarUrl}
                  currentImageUrl={cadetForm.avatarUrl}
                  folder="cadets/avatars"
                  onChange={(url) => setCadetForm({ ...cadetForm, avatarUrl: url })}
                  onUploadComplete={(url) => setCadetForm({ ...cadetForm, avatarUrl: url })}
                  helpText="Upload an official photograph. Displays in Cadet Directory, Profile, and Hierarchy Tree."
                />
              </div>

              {/* Dynamic Custom Form Fields (configured by Admin in Form Builder) */}
              {cadetRegFields.length > 0 && (
                <div className="p-3.5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                      <ListPlus className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                      Custom Form Fields (Admin Defined)
                    </span>
                    <span className="text-[10px] text-[#7c7767] dark:text-[#aca596]">
                      {cadetRegFields.length} configured
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cadetRegFields.map((field, fIdx) => (
                      <div key={field.id ? `custom-fld-${field.id}-${fIdx}` : `custom-fld-${fIdx}`}>
                        <label className="block text-[11px] font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-0.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={cadetForm.customFields?.[field.id] || ''}
                            onChange={(e) =>
                              setCadetForm({
                                ...cadetForm,
                                customFields: {
                                  ...cadetForm.customFields,
                                  [field.id]: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl text-xs outline-none"
                          >
                            <option value="">Select option...</option>
                            {field.options?.map((opt, optIdx) => (
                              <option key={`${field.id}-opt-${optIdx}-${opt}`} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            placeholder={field.placeholder || ''}
                            value={cadetForm.customFields?.[field.id] || ''}
                            onChange={(e) =>
                              setCadetForm({
                                ...cadetForm,
                                customFields: {
                                  ...cadetForm.customFields,
                                  [field.id]: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl text-xs outline-none"
                          />
                        ) : (
                          <input
                            type={field.type || 'text'}
                            placeholder={field.placeholder || ''}
                            value={cadetForm.customFields?.[field.id] || ''}
                            onChange={(e) =>
                              setCadetForm({
                                ...cadetForm,
                                customFields: {
                                  ...cadetForm.customFields,
                                  [field.id]: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl text-xs outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCadet(false);
                    setEditingCadet(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  {editingCadet ? 'Update Cadet Record' : 'Save & Register Cadet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SET PASSWORD MODAL */}
      {passwordModalCadet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                  Define Cadet Password
                </h4>
              </div>
              <button
                onClick={() => setPasswordModalCadet(null)}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
              Set the portal login password for Cadet <strong>{passwordModalCadet.cadetNo}</strong> ({passwordModalCadet.name}).
            </p>

            <form onSubmit={handleSetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter password..."
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalCadet(null)}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW & APPROVE APPLICANT MODAL */}
      {approvingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                  Approve Cadet & Issue Credentials
                </h4>
              </div>
              <button
                onClick={() => setApprovingApplicant(null)}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#eedc82]/15 border border-[#cdc6b3]/50 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Applicant: {approvingApplicant.name}
              </div>
              <div className="text-[#695c4e] dark:text-[#aca596]">
                Dept: {approvingApplicant.department} • Phone: {approvingApplicant.phone} • Blood: {approvingApplicant.bloodGroup}
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Assign Cadet No. (Login ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalCadetNo}
                    onChange={(e) => setApprovalCadetNo(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Provide Login Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalPassword}
                    onChange={(e) => setApprovalPassword(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Platoon Category *
                  </label>
                  <select
                    value={approvalCategory}
                    onChange={(e) => setApprovalCategory(e.target.value as PlatoonCategory)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  >
                    <option value="Male Platoon">Male Platoon (Quota: 31)</option>
                    <option value="Female Platoon">Female Platoon (Quota: 31)</option>
                    <option value="Band Platoon">Band Platoon (Quota: 15)</option>
                    <option value="Ex-cadets">Ex-cadets (Unlimited)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Section Assignment *
                  </label>
                  <select
                    value={approvalSection}
                    onChange={(e) => setApprovalSection(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  >
                    {approvalCategory === 'Band Platoon' ? (
                      <>
                        <option value="Band Section 01">Band Section 01 (Brass & Bugle)</option>
                        <option value="Band Section 02">Band Section 02 (Drum & Percussion)</option>
                        <option value="Band HQ">Band HQ</option>
                      </>
                    ) : approvalCategory === 'Ex-cadets' ? (
                      <option value="Ex-cadet Platoon">Ex-cadet Platoon</option>
                    ) : (
                      <>
                        <option value="Section 01">Section 01</option>
                        <option value="Section 02">Section 02</option>
                        <option value="Section 03">Section 03</option>
                        <option value="Platoon HQ">Platoon HQ</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Assigned Rank *
                </label>
                <select
                  value={approvalRank}
                  onChange={(e) => setApprovalRank(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                >
                  <option value="Cadet (CDT)">Cadet (CDT)</option>
                  <option value="Lance Corporal (LCPL)">Lance Corporal (LCPL)</option>
                  <option value="Cadet Corporal (CPL)">Cadet Corporal (CPL)</option>
                  <option value="Cadet Sergeant (CDT SGT)">Cadet Sergeant (CDT SGT)</option>
                  <option value="Cadet Under Officer (CUO)">Cadet Under Officer (CUO)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35]">
                <button
                  type="button"
                  onClick={() => setApprovingApplicant(null)}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Grant Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD OR EDIT CADET RANK HIERARCHY */}
      {(isAddingRank || editingRank) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
              <h3 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>{editingRank ? 'Edit Rank Hierarchy Level' : 'Add Rank Hierarchy Level'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingRank(false);
                  setEditingRank(null);
                }}
                className="p-1 rounded-lg text-[#7c7767] hover:bg-[#eedc82]/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRank} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Rank Title (e.g. Cadet Under Officer / CUO) *
                </label>
                <input
                  type="text"
                  required
                  value={rankForm.rank}
                  onChange={(e) => setRankForm({ ...rankForm, rank: e.target.value })}
                  placeholder="e.g. Cadet Under Officer (CUO)"
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Rank Holder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rankForm.holderName}
                    onChange={(e) => setRankForm({ ...rankForm, holderName: e.target.value })}
                    placeholder="Cadet full name"
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Cadet Number / ID
                  </label>
                  <input
                    type="text"
                    value={rankForm.cadetNo || ''}
                    onChange={(e) => setRankForm({ ...rankForm, cadetNo: e.target.value })}
                    placeholder="e.g. NGDC-2024-001"
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Display Order / Hierarchy Priority (1 = Top Senior) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={rankForm.order}
                  onChange={(e) => setRankForm({ ...rankForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              {/* Cloudinary Image Uploader for Rank Holder */}
              <div>
                <CloudinaryUploader
                  folder="ranks"
                  label="Rank Holder Photograph (Cloudinary Upload)"
                  value={rankForm.image}
                  currentImageUrl={rankForm.image}
                  onChange={(url) => setRankForm({ ...rankForm, image: url })}
                  onUploadComplete={(url) => setRankForm({ ...rankForm, image: url })}
                  helpText="Upload the official photograph for this rank holder via Cloudinary CDN."
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Duties & Command Responsibilities *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rankForm.description}
                  onChange={(e) => setRankForm({ ...rankForm, description: e.target.value })}
                  placeholder="Describe command duties, squad coordination, drill instructions..."
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingRank(false);
                    setEditingRank(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingRank ? 'Save Rank Level' : 'Add Rank Level'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database (Supabase Postgres) & Cloud (Cloudinary) Settings Modal */}
      <DatabaseAndCloudSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSyncCadets={syncCadetsWithSupabase}
      />
    </div>
  );
};
