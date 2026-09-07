import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { FormFieldConfig, RecruitmentApplicant, RecruitmentSignatoriesConfig } from '../../../types';
import { RecruitmentApplicationSlipA4 } from '../../common/RecruitmentApplicationSlipA4';
import { CloudinaryUploader } from '../../common/CloudinaryUploader';
import * as XLSX from 'xlsx';
import {
  UserPlus,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  ListPlus,
  Download,
  Megaphone,
  Award,
  Filter,
  Search,
  Printer,
  Calendar,
  Image,
  Eye,
  X,
  FileText,
  RotateCcw,
  Building,
  Check,
} from 'lucide-react';

export const RecruitmentTab: React.FC = () => {
  const {
    recruitmentAnnouncement,
    updateRecruitmentAnnouncement,
    isRecruitmentOpen,
    setIsRecruitmentOpen,
    recruitmentFields,
    setRecruitmentFields,
    applicants,
    recruitmentApplicants,
    updateApplicantStatus,
    updateRecruitmentApplicant,
    deleteApplicant,
    addApplicant,
    recruitmentSignatories,
    updateRecruitmentSignatories,
    resetRecruitmentSignatories,
  } = useAdminData();

  // Safeguard applicant list
  const applicantList = applicants || recruitmentApplicants || [];

  // Subtabs: 'announcement' | 'applicants' | 'selectedList' | 'signatories'
  const [activeSubtab, setActiveSubtab] = useState<'announcement' | 'applicants' | 'selectedList' | 'signatories'>('applicants');

  // Edit Applicant Modal state
  const [editingApplicant, setEditingApplicant] = useState<RecruitmentApplicant | null>(null);

  // A4 PDF Print / Download state
  const [printingApplicant, setPrintingApplicant] = useState<RecruitmentApplicant | null>(null);
  const [printBlankModal, setPrintBlankModal] = useState(false);

  // Signatories Form State
  const [signatoriesForm, setSignatoriesForm] = useState<RecruitmentSignatoriesConfig>(recruitmentSignatories);
  const [signatoriesSaved, setSignatoriesSaved] = useState(false);
  const [newAttachmentText, setNewAttachmentText] = useState('');

  useEffect(() => {
    if (recruitmentSignatories) {
      setSignatoriesForm(recruitmentSignatories);
    }
  }, [recruitmentSignatories]);

  // Announcement Form state
  const [announcementForm, setAnnouncementForm] = useState(
    recruitmentAnnouncement || {
      isActive: true,
      title: 'Cadet Recruitment Batch 2024-2025 Enrolment Circular',
      batch: 'Batch 24',
      deadline: '2026-10-15',
      startDate: '2026-09-01T08:00',
      endDate: '2026-10-15T23:59',
      venue: 'College Gymnasium & Main Parade Ground, NGDC',
      description: 'Join the Bangladesh National Cadet Corps (Army Wing) at New Government Degree College, Rajshahi.',
      eligibilityCriteria: [
        'Enrolled student of New Govt. Degree College (HSC or Degree/Honours)',
        'Minimum height: Male 5\'4", Female 5\'0"',
        'Good physical fitness and sound health condition',
      ],
      headerImageUrl: '',
      footerImageUrl: '',
      footerText: '',
    }
  );

  useEffect(() => {
    if (recruitmentAnnouncement) {
      setAnnouncementForm(recruitmentAnnouncement);
    }
  }, [recruitmentAnnouncement]);

  const isEnrollmentActive = isRecruitmentOpen !== undefined ? isRecruitmentOpen : (announcementForm.isActive !== false);

  const handleToggleEnrollment = () => {
    const nextState = !isEnrollmentActive;
    if (setIsRecruitmentOpen) {
      setIsRecruitmentOpen(nextState);
    }
    if (updateRecruitmentAnnouncement) {
      updateRecruitmentAnnouncement({ ...announcementForm, isActive: nextState });
    }
    setAnnouncementForm((prev) => ({ ...prev, isActive: nextState }));
  };
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // Applicant search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Selected' | 'Pending' | 'Rejected'>('All');

  // Selected List new cadet state
  const [newSelectedRoll, setNewSelectedRoll] = useState('');
  const [newSelectedName, setNewSelectedName] = useState('');
  const [newSelectedDept, setNewSelectedDept] = useState('');

  // Save Announcement
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateRecruitmentAnnouncement) {
      updateRecruitmentAnnouncement(announcementForm);
    }
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2000);
  };

  // Add Eligibility Criterion
  const handleAddCriterion = (criterion: string) => {
    if (!criterion.trim()) return;
    setAnnouncementForm((prev) => ({
      ...prev,
      eligibilityCriteria: [...(prev.eligibilityCriteria || []), criterion.trim()],
    }));
  };

  const handleRemoveCriterion = (index: number) => {
    setAnnouncementForm((prev) => ({
      ...prev,
      eligibilityCriteria: (prev.eligibilityCriteria || []).filter((_, i) => i !== index),
    }));
  };

  // Export Applicants to Excel with ALL recruitment form fields
  const handleExportToExcel = () => {
    if (applicantList.length === 0) {
      alert('No applicants available to export.');
      return;
    }

    const exportData = applicantList.map((app, index) => ({
      'SL No': index + 1,
      'Serial / Token No.': app.serialNo || app.token || app.id,
      'Enrolment Status': app.status || 'Pending',
      'Application Date': app.appliedAt || '',
      'Full Name (English)': app.nameEnglish || app.fullName || '',
      'Full Name (Bangla)': app.nameBangla || '',
      'Father Name (English)': app.fatherNameEnglish || '',
      'Father Name (Bangla)': app.fatherNameBangla || '',
      'Mother Name (English)': app.motherNameEnglish || '',
      'Mother Name (Bangla)': app.motherNameBangla || '',
      'Gender': app.gender || '',
      'Class / Year': app.studentClass || '',
      'Department': app.department || '',
      'College Roll': app.collegeRoll || '',
      'Session': app.session || '',
      'Date of Birth': app.dateOfBirth || '',
      'Religion': app.religion || '',
      'Blood Group': app.bloodGroup || '',
      'Height (Feet)': app.heightFeet || '',
      'Height (Inches)': app.heightInches || '',
      'Height (Combined)': app.heightFeet ? `${app.heightFeet}' ${app.heightInches || 0}"` : (app.height || ''),
      'Weight (kg)': app.weightKg || app.weight || '',
      'Chest (Normal)': app.chestNormal || '',
      'Chest (Expanded)': app.chestExpanded || '',
      'Applicant Mobile (Self)': app.phoneSelf || app.phone || '',
      'Guardian Mobile': app.phoneGuardian || '',
      'Email Address': app.email || '',
      'Present Address - Division': app.presentAddress?.division || '',
      'Present Address - District': app.presentAddress?.district || '',
      'Present Address - Upazila/Thana': app.presentAddress?.upazila || '',
      'Present Address - Post Office': app.presentAddress?.post || '',
      'Present Address - Village/Road': app.presentAddress?.village || '',
      'Permanent Address - Division': app.permanentAddress?.division || '',
      'Permanent Address - District': app.permanentAddress?.district || '',
      'Permanent Address - Upazila/Thana': app.permanentAddress?.upazila || '',
      'Permanent Address - Post Office': app.permanentAddress?.post || '',
      'Permanent Address - Village/Road': app.permanentAddress?.village || '',
      'Qualification 1 Exam': app.qualifications?.[0]?.examName || 'SSC',
      'Qualification 1 Group': app.qualifications?.[0]?.divisionOrGroup || '',
      'Qualification 1 Board': app.qualifications?.[0]?.board || '',
      'Qualification 1 Passing Year': app.qualifications?.[0]?.passingYear || '',
      'Qualification 1 GPA': app.qualifications?.[0]?.gpa || '',
      'Qualification 2 Exam': app.qualifications?.[1]?.examName || '',
      'Qualification 2 Group': app.qualifications?.[1]?.divisionOrGroup || '',
      'Qualification 2 Board': app.qualifications?.[1]?.board || '',
      'Qualification 2 Passing Year': app.qualifications?.[1]?.passingYear || '',
      'Qualification 2 GPA': app.qualifications?.[1]?.gpa || '',
      'Additional Skills': app.additionalSkills || '',
      'Reason / Motivation': app.reason || '',
      'Pledge Accepted': app.pledgeAccepted ? 'Yes' : 'No',
      'Guardian Consent Accepted': app.guardianConsentAccepted ? 'Yes' : 'No',
      'Photo Attached': app.avatarUrl ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadet_Applicants');

    // Generate buffer & trigger download
    XLSX.writeFile(workbook, `NGDC_BNCC_Applicants_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Add to Selected List
  const handleAddSelectedCadet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSelectedRoll.trim() || !newSelectedName.trim()) return;

    if (addApplicant) {
      addApplicant({
        fullName: newSelectedName.trim(),
        collegeRoll: newSelectedRoll.trim(),
        department: newSelectedDept.trim() || 'General Science',
        session: '2024-2025',
        phone: '+880 1700-000000',
        email: 'cadet@example.com',
        bloodGroup: 'B+',
        heightFeet: '5',
        heightInches: '7',
        weightKg: '62',
        reason: 'Selected as probationary recruit for the platoon.',
        status: 'Shortlisted',
      });
    }

    setNewSelectedRoll('');
    setNewSelectedName('');
    setNewSelectedDept('');
  };

  // Signatories Handlers
  const handleSaveSignatories = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecruitmentSignatories(signatoriesForm);
    setSignatoriesSaved(true);
    setTimeout(() => setSignatoriesSaved(false), 2500);
  };

  const handleResetSignatories = () => {
    if (confirm('Reset recruitment form signatories to default platoon officers?')) {
      resetRecruitmentSignatories();
      setSignatoriesSaved(true);
      setTimeout(() => setSignatoriesSaved(false), 2000);
    }
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentText.trim()) return;
    setSignatoriesForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachmentText.trim()],
    }));
    setNewAttachmentText('');
  };

  const handleRemoveAttachment = (index: number) => {
    setSignatoriesForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  // Filtered applicants
  const filteredApplicants = applicantList.filter((app) => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.collegeRoll || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.phone || '').includes(searchQuery);

    const matchesStatus =
      statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedApplicants = applicantList.filter((a) => a.status === 'Selected' || a.status === 'Shortlisted');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <UserPlus className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Cadet Recruitment & Selection Hub
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Publish circulars, review recruit applications, export records directly to Excel (.xlsx), and publish selected cadet rolls.
          </p>
        </div>

        {/* Action Button: Export to Excel */}
        <button
          onClick={handleExportToExcel}
          className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#1c1c18]" />
          <span>Export All to Excel (.xlsx)</span>
        </button>
      </div>

      {/* Recruitment Enrollment Status & Master On/Off Switch */}
      <div
        id="card-recruitment-enrollment-toggle"
        className={`p-5 rounded-3xl border transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isEnrollmentActive
            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
            : 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                isEnrollmentActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <h3 className="font-bold text-sm sm:text-base text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <span>Recruitment Enrollment:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isEnrollmentActive
                    ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200'
                }`}
              >
                {isEnrollmentActive ? 'ON (Open)' : 'OFF (Closed)'}
              </span>
            </h3>
          </div>
          <p className="text-xs text-[#524d40] dark:text-[#aca596]">
            {isEnrollmentActive
              ? 'Enrollment is active. Students can fill out and submit the cadet admission form online.'
              : 'Enrollment is currently turned OFF. Public visitors will see: "Currently the recuitment is closed any query contact to Platoon HQ".'}
          </p>
        </div>

        {/* Big Switch Button */}
        <button
          type="button"
          id="btn-toggle-recruitment-enrollment"
          onClick={handleToggleEnrollment}
          className={`shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs ${
            isEnrollmentActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isEnrollmentActive ? (
            <>
              <XCircle className="w-4 h-4" />
              <span>Turn Recruitment OFF (Close Enrolment)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Turn Recruitment ON (Open Enrolment)</span>
            </>
          )}
        </button>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-[#f0eee8] dark:bg-[#141311] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
        <button
          onClick={() => setActiveSubtab('applicants')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'applicants'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Applicants Pool ({applicantList.length})
        </button>
        <button
          onClick={() => setActiveSubtab('selectedList')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'selectedList'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Selected Cadet List ({selectedApplicants.length})
        </button>
        <button
          onClick={() => setActiveSubtab('announcement')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'announcement'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Recruitment Circular & Eligibility
        </button>
        <button
          onClick={() => setActiveSubtab('signatories')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'signatories'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Yearly Form Signatories
        </button>
      </div>

      {/* SUBTAB 1: APPLICANTS POOL */}
      {activeSubtab === 'applicants' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fcf9f3] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7c7767]" />
              <input
                type="text"
                placeholder="Search applicant by name, roll, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f6f3ed] dark:bg-[#141311] p-1 rounded-xl border border-[#cdc6b3]/50 dark:border-[#423e35] text-xs">
                {(['All', 'Selected', 'Pending', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#eedc82] text-[#1c1c18]'
                        : 'text-[#695c4e] dark:text-[#aca596]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f6f3ed] dark:bg-[#161512] border-b border-[#cdc6b3]/50 dark:border-[#423e35] text-[#555042] dark:text-[#aca596] font-bold">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">College Roll</th>
                    <th className="py-3 px-4">Department & Session</th>
                    <th className="py-3 px-4">Physical / Blood</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdc6b3]/30 dark:divide-[#333]">
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#7c7767]">
                        No applicants found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((app, appIdx) => (
                      <tr key={app.id ? `applicant-${app.id}-${appIdx}` : `applicant-${appIdx}`} className="hover:bg-[#f6f3ed]/60 dark:hover:bg-[#23211c]/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
                            {app.fullName}
                          </span>
                          <span className="text-[10px] text-[#7c7767]">Applied: {app.appliedAt}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">
                          {app.collegeRoll}
                        </td>
                        <td className="py-3 px-4 text-[#555042] dark:text-[#cdc6b3]">
                          <div>{app.department}</div>
                          <div className="text-[10px] text-[#7c7767]">{app.session}</div>
                        </td>
                        <td className="py-3 px-4 text-[#555042] dark:text-[#cdc6b3]">
                          <div>{app.height} • {app.weight}</div>
                          <span className="inline-block text-[10px] font-mono font-bold bg-[#eedc82]/30 text-[#6b5e10] px-1.5 rounded">
                            {app.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#555042] dark:text-[#cdc6b3]">
                          <div>{app.phone}</div>
                          <div className="text-[10px] text-[#7c7767]">{app.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.status === 'Selected'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* A4 PDF Slip Download / Print */}
                            <button
                              onClick={() => setPrintingApplicant(app)}
                              title="Download / Print A4 PDF Application Slip"
                              className="p-1.5 rounded-lg text-[#6b5e10] dark:text-[#eedc82] hover:bg-[#eedc82]/20 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Application */}
                            <button
                              onClick={() => setEditingApplicant(app)}
                              title="Update / Edit Application Data"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/10 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Select Candidate */}
                            <button
                              onClick={() => updateApplicantStatus(app.id, 'Selected')}
                              title="Select Candidate"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateApplicantStatus(app.id, 'Rejected')}
                              title="Reject Candidate"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete recruitment application for "${app.fullName}"? This action cannot be undone.`)) {
                                  deleteApplicant(app.id);
                                }
                              }}
                              title="Delete Application"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SELECTED CADET LIST */}
      {activeSubtab === 'selectedList' && (
        <div className="space-y-4">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-5 rounded-3xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Official Selected Cadet Roll Notice</span>
                </h3>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                  This list will appear on the public recruitment page and notice board under &quot;Final Selected Cadets&quot;.
                </p>
              </div>
            </div>

            {/* Quick Add Selected Cadet */}
            <form onSubmit={handleAddSelectedCadet} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <input
                type="text"
                required
                placeholder="College Roll / Cadet ID (e.g. 24018)"
                value={newSelectedRoll}
                onChange={(e) => setNewSelectedRoll(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
              <input
                type="text"
                required
                placeholder="Cadet Full Name"
                value={newSelectedName}
                onChange={(e) => setNewSelectedName(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
              <input
                type="text"
                placeholder="Department (e.g. English)"
                value={newSelectedDept}
                onChange={(e) => setNewSelectedDept(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
              <button
                type="submit"
                className="japandi-btn-primary text-xs py-2 px-3 font-bold cursor-pointer"
              >
                + Add to Selected Roll
              </button>
            </form>

            <div className="divide-y divide-[#cdc6b3]/30 dark:divide-[#333] pt-2">
              {selectedApplicants.map((sel, idx) => (
                <div key={sel.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#eedc82] text-[#1c1c18] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                        {sel.fullName}
                      </span>
                      <span className="text-[#7c7767] ml-2 font-mono">
                        (Roll: {sel.collegeRoll})
                      </span>
                      <span className="text-[#7c7767] ml-2">
                        • {sel.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateApplicantStatus(sel.id, 'Pending')}
                      className="japandi-btn-secondary text-[11px] py-1 px-2 cursor-pointer"
                    >
                      Move to Pending
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ANNOUNCEMENT & ELIGIBILITY */}
      {activeSubtab === 'announcement' && (
        <form
          onSubmit={handleSaveAnnouncement}
          className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs max-w-3xl"
        >
          <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
            <h3 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Recruitment Circular & Eligibility Criteria</span>
            </h3>
            {announcementSaved && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Updated!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecOpen"
              checked={announcementForm.isActive}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })}
              className="rounded text-[#6b5e10]"
            />
            <label htmlFor="isRecOpen" className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
              Recruitment is Currently Active & Open for Public Applications
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Circular Title
              </label>
              <input
                type="text"
                required
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Batch Tag
              </label>
              <input
                type="text"
                required
                value={announcementForm.batch}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, batch: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>
          </div>

          {/* Timeframe Workflow Box */}
          <div className="p-4 rounded-2xl bg-[#eedc82]/20 border border-[#eedc82]/60 space-y-3">
            <h4 className="font-bold text-xs text-[#6b5e10] dark:text-[#eedc82] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Recruitment Timeframe Workflow (Announcement Window)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Announcement Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={announcementForm.startDate || ''}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, startDate: e.target.value })}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Application Closing Deadline (End Date & Time)
                </label>
                <input
                  type="datetime-local"
                  value={announcementForm.endDate || ''}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, endDate: e.target.value, deadline: e.target.value })}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
              Description & Welcome Note
            </label>
            <textarea
              rows={3}
              value={announcementForm.description}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Eligibility Criteria */}
          <div className="text-xs space-y-2">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
              Eligibility Criteria
            </label>
            <div className="space-y-1.5">
              {(announcementForm.eligibilityCriteria || []).map((crit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={crit}
                    onChange={(e) => {
                      const updated = [...(announcementForm.eligibilityCriteria || [])];
                      updated[idx] = e.target.value;
                      setAnnouncementForm({ ...announcementForm, eligibilityCriteria: updated });
                    }}
                    className="flex-grow bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddCriterion('New eligibility requirement')}
              className="text-[11px] font-bold text-[#6b5e10] dark:text-[#eedc82] hover:underline cursor-pointer pt-1"
            >
              + Add Requirement Bullet
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="japandi-btn-primary text-xs py-2.5 px-5 font-bold cursor-pointer"
            >
              Save Recruitment Circular
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 4: YEARLY FORM SIGNATORIES */}
      {activeSubtab === 'signatories' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#38342c] p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cdc6b3]/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                    <Building className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Yearly Form Signatories & Official Document Settings
                  </h3>
                </div>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1">
                  Configure the official signatories that appear on Page 2 of the printable recruit admission form (Countersigned Platoon Commander, Senior Cadet, and Form Provider). Update annually when leadership changes.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPrintBlankModal(true)}
                  className="japandi-btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Preview Blank Form</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSignatories}
                  className="p-2 rounded-xl text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-300 dark:border-gray-700 transition-colors"
                  title="Reset to default platoon officers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {signatoriesSaved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-bold animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>Signatories configuration updated and saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSignatories} className="space-y-6 text-xs text-[#1c1c18] dark:text-[#fcfbf7]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Countersigned Officer */}
                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6b5e10] dark:bg-[#eedc82]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                      1. Countersigned Authority (Platoon Commander)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1">Rank & Officer Full Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.countersignedName || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedName: e.target.value })}
                        placeholder="e.g. PUO Md. Abdul Matin"
                        className="japandi-input w-full font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Personal No / P-No: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedPNo || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedPNo: e.target.value })}
                          placeholder="e.g. P-8193"
                          className="japandi-input w-full font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Battalion: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedBattalion || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedBattalion: e.target.value })}
                          placeholder="e.g. 31 BNCC Battalion"
                          className="japandi-input w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Regiment: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedRegiment || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedRegiment: e.target.value })}
                          placeholder="e.g. Mahasthan Regiment"
                          className="japandi-input w-full"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Platoon Appointment / Title: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedTitle || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedTitle: e.target.value })}
                          placeholder="e.g. Platoon Commander"
                          className="japandi-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Institution Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.countersignedInstitution || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedInstitution: e.target.value })}
                        placeholder="e.g. New Govt. Degree College, Rajshahi"
                        className="japandi-input w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Official Signature / Seal Image:
                      </label>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2">
                        Upload Platoon Commander's signature or stamp to automatically appear on the official 2-page recruitment slip.
                      </p>
                      <CloudinaryUploader
                        value={signatoriesForm.countersignedSignatureUrl || ''}
                        onChange={(url) => setSignatoriesForm({ ...signatoriesForm, countersignedSignatureUrl: url })}
                        onUploadComplete={(url) => setSignatoriesForm({ ...signatoriesForm, countersignedSignatureUrl: url })}
                        folder="bncc_signatures"
                        label="Upload Commander Signature"
                        helpText="PNG/JPG with transparent or white background"
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Platoon Senior Cadet */}
                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6b5e10] dark:bg-[#eedc82]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                      2. Signature of Platoon Senior Cadet
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1">Rank & Cadet Full Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.seniorCadetRankAndName || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetRankAndName: e.target.value })}
                        placeholder="e.g. Cadet Sergeant Touhid"
                        className="japandi-input w-full font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Cadet ID / No (Optional):</label>
                        <input
                          type="text"
                          value={signatoriesForm.seniorCadetNo || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetNo: e.target.value })}
                          placeholder="e.g. CDT-2022-04"
                          className="japandi-input w-full font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Battalion: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.seniorCadetBattalion || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetBattalion: e.target.value })}
                          placeholder="e.g. 31 BNCC Battalion"
                          className="japandi-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Regiment: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.seniorCadetRegiment || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetRegiment: e.target.value })}
                        placeholder="e.g. Mahasthan Regiment"
                        className="japandi-input w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Institution Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.seniorCadetInstitution || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetInstitution: e.target.value })}
                        placeholder="e.g. New Govt. Degree College, Rajshahi"
                        className="japandi-input w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Senior Cadet Signature Image:
                      </label>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2">
                        Upload Senior Cadet's signature to appear on the official 2-page recruitment slip.
                      </p>
                      <CloudinaryUploader
                        value={signatoriesForm.seniorCadetSignatureUrl || ''}
                        onChange={(url) => setSignatoriesForm({ ...signatoriesForm, seniorCadetSignatureUrl: url })}
                        onUploadComplete={(url) => setSignatoriesForm({ ...signatoriesForm, seniorCadetSignatureUrl: url })}
                        folder="bncc_signatures"
                        label="Upload Senior Cadet Signature"
                        helpText="PNG/JPG with transparent or white background"
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Form Provider & Attachments Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                    3. Signature of Form Provider Block
                  </h4>
                  <div>
                    <label className="font-bold block mb-1">Heading / Designation Label:</label>
                    <input
                      type="text"
                      value={signatoriesForm.formProviderTitle || ''}
                      onChange={(e) => setSignatoriesForm({ ...signatoriesForm, formProviderTitle: e.target.value })}
                      placeholder="Signature of Form Provider:"
                      className="japandi-input w-full"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Appears on the left signatory column above the date line.
                    </span>
                  </div>
                </div>

                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                    4. Required Attachments List (Printed on Page 2)
                  </h4>
                  <ul className="space-y-1.5">
                    {(signatoriesForm.attachments || []).map((att, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-white dark:bg-[#1e1d19] p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-[11px]">
                        <span>{idx + 1}. {att}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newAttachmentText}
                      onChange={(e) => setNewAttachmentText(e.target.value)}
                      placeholder="Add attachment (e.g. 02 Passport Photos)"
                      className="japandi-input flex-1 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="japandi-btn-secondary px-3 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="border border-dashed border-gray-400 p-4 rounded-2xl bg-white dark:bg-[#1e1d19] text-black dark:text-white space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Live Preview: Page 2 Official Signatures Block
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-black pt-3">
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <span className="font-bold block">{signatoriesForm.formProviderTitle || 'Signature of Form Provider:'}</span>
                    <span className="text-gray-500 text-[9px]">Date: ........................</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <span className="font-bold uppercase text-[9px] block">Countersigned:</span>
                    <span className="font-bold block text-[10px]">{signatoriesForm.countersignedName}</span>
                    <span className="block font-mono text-[9px]">{signatoriesForm.countersignedPNo}</span>
                    <span className="block text-[9px]">{signatoriesForm.countersignedBattalion}</span>
                    <span className="block text-[9px]">{signatoriesForm.countersignedRegiment}</span>
                    <span className="font-semibold block text-[9px]">{signatoriesForm.countersignedTitle}</span>
                    <span className="block text-[8px] text-gray-500">{signatoriesForm.countersignedInstitution}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <span className="font-bold text-[9px] block">Signature of Platoon Senior Cadet:</span>
                    <span className="font-bold block text-[10px] mt-0.5">{signatoriesForm.seniorCadetRankAndName}</span>
                    {signatoriesForm.seniorCadetNo ? <span className="block font-mono text-[9px]">{signatoriesForm.seniorCadetNo}</span> : null}
                    <span className="block text-[9px]">{signatoriesForm.seniorCadetBattalion}</span>
                    <span className="block text-[9px]">{signatoriesForm.seniorCadetRegiment}</span>
                    <span className="block text-[8px] text-gray-500">{signatoriesForm.seniorCadetInstitution}</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#cdc6b3]/50">
                <button
                  type="submit"
                  className="japandi-btn-primary px-6 py-2.5 font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Yearly Signatories
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT APPLICANT MODAL */}
      {editingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Update Applicant: {editingApplicant.fullName}</span>
                </h3>
                <p className="text-[11px] font-mono text-[#7c7767] mt-0.5">
                  Token: {editingApplicant.token} • Applied on {editingApplicant.appliedAt}
                </p>
              </div>
              <button
                onClick={() => setEditingApplicant(null)}
                className="text-[#7c7767] hover:text-[#1c1c18] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateRecruitmentApplicant(editingApplicant.id, editingApplicant);
                setEditingApplicant(null);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.fullName}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, fullName: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    College Roll No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.collegeRoll}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, collegeRoll: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Department / Class
                  </label>
                  <input
                    type="text"
                    value={editingApplicant.department}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, department: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={editingApplicant.session}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, session: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Phone Contact No.
                  </label>
                  <input
                    type="tel"
                    value={editingApplicant.phone}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, phone: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingApplicant.email}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, email: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Height (Ft/In)
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={editingApplicant.heightFeet}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, heightFeet: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center"
                    />
                    <input
                      type="number"
                      value={editingApplicant.heightInches}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, heightInches: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={editingApplicant.weightKg}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, weightKg: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Blood Group
                  </label>
                  <select
                    value={editingApplicant.bloodGroup}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, bloodGroup: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg, bgIdx) => (
                      <option key={`bg-opt-${bgIdx}-${bg}`} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Enrolment Decision / Status
                </label>
                <select
                  value={editingApplicant.status}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, status: e.target.value as any })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl font-bold"
                >
                  <option value="Pending">Pending Evaluation</option>
                  <option value="Shortlisted">Shortlisted for Physical Test</option>
                  <option value="Selected">Selected / Approved Cadet</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Reason / Motivation
                </label>
                <textarea
                  rows={2}
                  value={editingApplicant.reason}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, reason: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#cdc6b3]/50">
                <button
                  type="button"
                  onClick={() => setEditingApplicant(null)}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 PRINTABLE APPLICATION SLIP MODAL */}
      {printingApplicant && (
        <RecruitmentApplicationSlipA4
          applicant={printingApplicant}
          announcement={announcementForm}
          formFields={recruitmentFields}
          onClose={() => setPrintingApplicant(null)}
        />
      )}

      {/* BLANK FORM PREVIEW MODAL */}
      {printBlankModal && (
        <RecruitmentApplicationSlipA4
          isBlank={true}
          announcement={announcementForm}
          signatories={signatoriesForm}
          onClose={() => setPrintBlankModal(false)}
        />
      )}
    </div>
  );
};
