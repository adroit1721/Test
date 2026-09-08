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
 * Supported types: 'all' (Combined Roster), 'serving' (Currently serving cadets), or 'ex' (Ex-cadets alumni)
 */
export function downloadCadetsFile(
  allCadets: CadetUserAccount[],
  type: 'all' | 'serving' | 'ex' = 'all',
  format: 'xlsx' | 'csv' = 'xlsx'
): void {
  const servingList = allCadets.filter((c) => c.cadetType !== 'Ex-cadet' && c.category !== 'Ex-cadets');
  const exList = allCadets.filter((c) => c.cadetType === 'Ex-cadet' || c.category === 'Ex-cadets');

  if (type === 'serving' && servingList.length === 0) {
    alert('No currently serving cadet records found to export.');
    return;
  }
  if (type === 'ex' && exList.length === 0) {
    alert('No ex-cadet alumni records found to export.');
    return;
  }
  if (type === 'all' && allCadets.length === 0) {
    alert('No cadet records found to export.');
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const workbook = XLSX.utils.book_new();

  const createSheetWithWidths = (rows: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...rows.map((r) => String((r as any)[key] || '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
    });
    worksheet['!cols'] = colWidths;
    return worksheet;
  };

  if (type === 'all') {
    if (format === 'xlsx') {
      if (servingList.length > 0) {
        const servingRows = servingList.map(formatServingCadetForExport);
        XLSX.utils.book_append_sheet(workbook, createSheetWithWidths(servingRows), 'Serving Cadets');
      }
      if (exList.length > 0) {
        const exRows = exList.map(formatExCadetForExport);
        XLSX.utils.book_append_sheet(workbook, createSheetWithWidths(exRows), 'Ex-Cadets Alumni');
      }
      const filename = `NGDC_BNCC_All_Cadets_${dateStr}.xlsx`;
      XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
      return;
    } else {
      // CSV format for all cadets
      const combinedRows = allCadets.map((c) => {
        const isEx = c.cadetType === 'Ex-cadet' || c.category === 'Ex-cadets';
        return isEx ? formatExCadetForExport(c) : formatServingCadetForExport(c);
      });
      const worksheet = createSheetWithWidths(combinedRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Cadets');
      const filename = `NGDC_BNCC_All_Cadets_${dateStr}.csv`;
      XLSX.writeFile(workbook, filename, { bookType: 'csv' });
      return;
    }
  }

  const targetList = type === 'serving' ? servingList : exList;
  const rows = type === 'serving'
    ? targetList.map(formatServingCadetForExport)
    : targetList.map(formatExCadetForExport);

  const worksheet = createSheetWithWidths(rows);
  const sheetName = type === 'serving' ? 'Serving Cadets' : 'Ex-Cadets';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const filename = `NGDC_BNCC_${type === 'serving' ? 'Serving_Cadets' : 'Ex_Cadets'}_${dateStr}.${format}`;
  XLSX.writeFile(workbook, filename, { bookType: format });
}
