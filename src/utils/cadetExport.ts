import * as XLSX from 'xlsx';
import { CadetUserAccount } from '../types';

/**
 * Format currently serving cadets with all registration form fields
 */
function formatServingCadetForExport(c: CadetUserAccount) {
  return {
    'Cadet No. (Login ID)': c.cadetNo || '',
    'Login Password': c.password || '',
    'Full Name (English)': c.name || '',
    'Full Name (Bangla)': c.nameBangla || '',
    'Platoon': c.platoon || c.category || '',
    'Section': c.section || '',
    'Rank': c.rank || '',
    'Batch': c.batch || '',
    'Gender': c.gender || '',
    'Blood Group': c.bloodGroup || '',
    'Date of Birth': c.dob || '',
    'Religion': c.religion || 'Islam',
    'Class': c.className || '',
    'Department': c.department || '',
    'Father Name (English)': c.fatherName || '',
    'Father Name (Bangla)': c.fatherNameBangla || '',
    'Mother Name (English)': c.motherName || '',
    'Mother Name (Bangla)': c.motherNameBangla || '',
    'Contact Number (Self)': c.phone || '',
    'Guardian Phone': c.guardianPhone || '',
    'Email Address': c.email || '',
    'Present Address': c.presentAddress || '',
    'Permanent Address': c.permanentAddress || '',
    'Additional Skills': c.additionalSkills || '',
    'Achievements & Camps': c.achievements || '',
    'Status': c.status || 'Active',
    'Approval Status': c.isApproved ? 'Approved' : 'Pending Approval',
    'Joining Date': c.joiningDate || '',
  };
}

/**
 * Format Ex-cadets alumni with all registration form fields
 */
function formatExCadetForExport(c: CadetUserAccount) {
  return {
    'Cadet No. (Login ID)': c.cadetNo || '',
    'Login Password': c.password || '',
    'Full Name (English)': c.name || '',
    'Full Name (Bangla)': c.nameBangla || '',
    'Rank': c.rank || '',
    'Batch': c.batch || '',
    'Current Status / Job': c.currentJob || '',
    'Gender': c.gender || '',
    'Blood Group': c.bloodGroup || '',
    'Date of Birth': c.dob || '',
    'Religion': c.religion || 'Islam',
    'Contact Number (Self)': c.phone || '',
    'Email Address': c.email || '',
    'Social Media Profile': c.socialMedia || '',
    'Present Address': c.presentAddress || '',
    'Permanent Address': c.permanentAddress || '',
    'Additional Skills': c.additionalSkills || '',
    'Achievements & Camps': c.achievements || '',
    'Status': c.status || 'Alumni',
    'Approval Status': c.isApproved ? 'Approved' : 'Pending Approval',
  };
}

/**
 * Download Cadet Data as Excel (.xlsx) or CSV (.csv)
 * Supported types: 'serving' (Currently serving cadets) or 'ex' (Ex-cadets alumni)
 */
export function downloadCadetsFile(
  allCadets: CadetUserAccount[],
  type: 'serving' | 'ex',
  format: 'xlsx' | 'csv' = 'xlsx'
): void {
  const filtered = allCadets.filter((c) => {
    const isEx = c.cadetType === 'Ex-cadet' || c.category === 'Ex-cadets';
    return type === 'ex' ? isEx : !isEx;
  });

  if (filtered.length === 0) {
    alert(`No ${type === 'serving' ? 'currently serving' : 'ex-cadet'} records found to export.`);
    return;
  }

  const rows = type === 'serving'
    ? filtered.map(formatServingCadetForExport)
    : filtered.map(formatExCadetForExport);

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String((r as any)[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = type === 'serving' ? 'Serving Cadets' : 'Ex-Cadets';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `NGDC_BNCC_${type === 'serving' ? 'Serving_Cadets' : 'Ex_Cadets'}_${dateStr}.${format}`;

  XLSX.writeFile(workbook, filename, { bookType: format });
}
