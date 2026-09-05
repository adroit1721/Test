import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CadetUserAccount } from '../types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): { supabaseUrl: string; supabaseAnonKey: string } {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('ngdc_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('ngdc_supabase_anon_key') || '' : '';

  let finalUrl = (envUrl || localUrl || '').trim();
  // Supabase JS client automatically appends /rest/v1 for database queries.
  // If the user accidentally provided the full REST URL, strip it to prevent 404s.
  if (finalUrl.endsWith('/rest/v1')) {
    finalUrl = finalUrl.replace('/rest/v1', '');
  }
  if (finalUrl.endsWith('/rest/v1/')) {
    finalUrl = finalUrl.replace('/rest/v1/', '');
  }
  if (finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, -1);
  }

  return {
    supabaseUrl: finalUrl,
    supabaseAnonKey: (envKey || localKey || '').trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

/**
 * Reset client instance if config changed
 */
export function resetSupabaseInstance(): void {
  supabaseInstance = null;
}

/**
 * Format CadetUserAccount into Supabase Postgres database record
 */
function mapCadetToSupabaseRecord(cadet: CadetUserAccount) {
  return {
    id: cadet.id,
    cadet_no: cadet.cadetNo,
    password: cadet.password || '',
    name: cadet.name,
    category: cadet.category || 'Male Platoon',
    section: cadet.section || 'Section 01',
    rank: cadet.rank || 'Cadet',
    gender: cadet.gender || 'Male',
    appointment: cadet.appointment || 'Cadet',
    platoon: cadet.platoon || cadet.category || 'Male Platoon',
    batch: cadet.batch || 'Batch 24',
    college_id: cadet.collegeId || '',
    department: cadet.department || '',
    blood_group: cadet.bloodGroup || 'B+',
    phone: cadet.phone || '',
    email: cadet.email || '',
    joining_date: cadet.joiningDate || '',
    attendance_percentage: cadet.attendancePercentage ?? 100,
    parades_attended: cadet.paradesAttended ?? 0,
    total_parades: cadet.totalParades ?? 0,
    status: cadet.status || 'Active',
    cadet_type: cadet.cadetType || 'Current',
    is_approved: cadet.isApproved !== undefined ? cadet.isApproved : true,
    avatar_url: cadet.avatarUrl || '',
    custom_fields: (cadet as any).customFields || {},
    updated_at: new Date().toISOString(),
  };
}

/**
 * Format Supabase Postgres row back into CadetUserAccount
 */
function mapSupabaseRecordToCadet(row: any): CadetUserAccount {
  return {
    id: row.id,
    cadetNo: row.cadet_no || '',
    password: row.password || '',
    name: row.name || '',
    category: row.category || 'Male Platoon',
    section: row.section || 'Section 01',
    rank: row.rank || 'Cadet',
    gender: row.gender || 'Male',
    appointment: row.appointment || 'Cadet',
    platoon: row.platoon || row.category || 'Male Platoon',
    batch: row.batch || 'Batch 24',
    collegeId: row.college_id || '',
    department: row.department || '',
    bloodGroup: row.blood_group || 'B+',
    phone: row.phone || '',
    email: row.email || '',
    joiningDate: row.joining_date || '',
    attendancePercentage: row.attendance_percentage ?? 100,
    paradesAttended: row.parades_attended ?? 0,
    totalParades: row.total_parades ?? 0,
    campsAttended: [],
    certificates: [],
    status: row.status || 'Active',
    cadetType: row.cadet_type || 'Current',
    isApproved: row.is_approved !== false,
    avatarUrl: row.avatar_url || '',
    ...(row.custom_fields ? { customFields: row.custom_fields } : {}),
  };
}

/**
 * Fetch all cadets from Supabase Postgres database
 */
export async function fetchCadetsFromSupabase(): Promise<CadetUserAccount[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('cadets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch cadets error:', error.message);
      return null;
    }

    if (Array.isArray(data)) {
      return data.map(mapSupabaseRecordToCadet);
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Insert or update a cadet in Supabase Postgres
 */
export async function upsertCadetToSupabase(cadet: CadetUserAccount): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const record = mapCadetToSupabaseRecord(cadet);
    const { error } = await client
      .from('cadets')
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert failed:', err);
    return false;
  }
}

/**
 * Delete a cadet from Supabase Postgres
 */
export async function deleteCadetFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('cadets')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete failed:', err);
    return false;
  }
}

/**
 * SQL Schema for easy execution in Supabase SQL editor
 */
export const SUPABASE_CADETS_SQL_SCHEMA = `
-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS cadets (
  id TEXT PRIMARY KEY,
  cadet_no TEXT NOT NULL,
  password TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Male Platoon',
  section TEXT DEFAULT 'Section 01',
  rank TEXT NOT NULL DEFAULT 'Cadet',
  gender TEXT DEFAULT 'Male',
  appointment TEXT DEFAULT 'Cadet',
  platoon TEXT DEFAULT 'Male Platoon',
  batch TEXT DEFAULT 'Batch 24',
  college_id TEXT,
  department TEXT,
  blood_group TEXT DEFAULT 'B+',
  phone TEXT,
  email TEXT,
  joining_date TEXT,
  attendance_percentage INTEGER DEFAULT 100,
  parades_attended INTEGER DEFAULT 0,
  total_parades INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  cadet_type TEXT DEFAULT 'Current',
  is_approved BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create open policy for authorized portal read/write:
ALTER TABLE cadets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Cadets" ON cadets FOR SELECT USING (true);
CREATE POLICY "Public Manage Cadets" ON cadets FOR ALL USING (true);
`;
