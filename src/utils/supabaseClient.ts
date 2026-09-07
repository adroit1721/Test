import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CadetUserAccount } from '../types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): { supabaseUrl: string; supabaseAnonKey: string } {
  const metaEnv = (import.meta as any).env || {};
  const DEFAULT_SUPABASE_URL = 'https://bsncxwxkocsvjhgfsoqo.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbmN4d3hrb2NzdmpoZ2Zzb3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDYwMTgsImV4cCI6MjEwNDAyMjAxOH0.CvoMnMOy_IjJ0XiSosVkGJIPHpW7EIv0j2Mo6oDvmBQ';

  let envUrl = metaEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let envKey = metaEnv.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    try {
      const localUrl = localStorage.getItem('ngdc_supabase_url');
      const localKey = localStorage.getItem('ngdc_supabase_anon_key');
      if (localUrl) envUrl = localUrl;
      if (localKey) envKey = localKey;
    } catch {}
  }

  let finalUrl = (envUrl || '').trim();
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
    supabaseAnonKey: (envKey || '').trim(),
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
  // Store the complete full cadet record inside custom_fields.raw_cadet_data
  // so ALL registration form fields (Bangla names, parents, dob, address, etc.)
  // are persisted faithfully without data loss across sessions.
  const customFields = {
    ...((cadet as any).customFields || {}),
    raw_cadet_data: { ...cadet },
  };

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
    custom_fields: customFields,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Format Supabase Postgres row back into CadetUserAccount
 */
function mapSupabaseRecordToCadet(row: any): CadetUserAccount {
  const raw = row.custom_fields?.raw_cadet_data || {};
  return {
    id: row.id,
    cadetNo: row.cadet_no || raw.cadetNo || '',
    password: row.password || raw.password || '',
    name: row.name || raw.name || '',
    nameBangla: raw.nameBangla || '',
    fatherName: raw.fatherName || '',
    fatherNameBangla: raw.fatherNameBangla || '',
    motherName: raw.motherName || '',
    motherNameBangla: raw.motherNameBangla || '',
    dob: raw.dob || '',
    religion: raw.religion || 'Islam',
    className: raw.className || '11th',
    category: row.category || raw.category || 'Male Platoon',
    section: row.section || raw.section || 'Section 01',
    rank: row.rank || raw.rank || 'Cadet',
    gender: row.gender || raw.gender || 'Male',
    appointment: row.appointment || raw.appointment || 'Cadet',
    platoon: row.platoon || raw.platoon || row.category || 'Male Platoon',
    batch: row.batch || raw.batch || 'Batch 24',
    collegeId: row.college_id || raw.collegeId || '',
    department: row.department || raw.department || '',
    bloodGroup: row.blood_group || raw.bloodGroup || 'B+',
    presentAddress: raw.presentAddress || '',
    permanentAddress: raw.permanentAddress || '',
    phone: row.phone || raw.phone || '',
    guardianPhone: raw.guardianPhone || '',
    email: row.email || raw.email || '',
    currentJob: raw.currentJob || '',
    socialMedia: raw.socialMedia || '',
    additionalSkills: raw.additionalSkills || '',
    achievements: raw.achievements || '',
    joiningDate: row.joining_date || raw.joiningDate || '',
    attendancePercentage: row.attendance_percentage ?? raw.attendancePercentage ?? 100,
    paradesAttended: row.parades_attended ?? raw.paradesAttended ?? 0,
    totalParades: row.total_parades ?? raw.totalParades ?? 0,
    campsAttended: raw.campsAttended || [],
    certificates: raw.certificates || [],
    status: row.status || raw.status || 'Active',
    cadetType: row.cadet_type || raw.cadetType || 'Current',
    isApproved: row.is_approved !== false,
    avatarUrl: row.avatar_url || raw.avatarUrl || '',
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

/**
 * SQL Schema for site settings (Hero slides, notices, etc.)
 */
export const SUPABASE_SITE_SETTINGS_SQL_SCHEMA = `
-- Run this in your Supabase SQL Editor to create the settings table:
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create open policy for authorized portal read/write:
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Manage Settings" ON site_settings FOR ALL USING (true);
`;

/**
 * Fetch all site settings from Supabase (with localStorage cache fallback)
 */
export async function fetchSiteSettings(): Promise<Record<string, any> | null> {
  const localMap: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      const knownKeys = [
        'ngdc_principal_message',
        'ngdc_vice_principal_message',
        'ngdc_hero_slides',
        'ngdc_about_overview',
        'ngdc_bncco1_message',
        'ngdc_bncco2_message',
        'ngdc_platoon_commander_message',
        'ngdc_about_sections',
        'ngdc_cadet_ranks',
        'ngdc_trainings',
        'ngdc_training_form_fields',
        'ngdc_training_submissions',
        'ngdc_notices',
        'ngdc_blogs',
        'ngdc_memories',
        'ngdc_cadet_reg_fields',
        'ngdc_cadet_users_v8',
        'ngdc_honor_entries_3cat',
        'ngdc_contact_config',
        'ngdc_contact_messages',
        'ngdc_recruitment_open',
        'ngdc_recruitment_announcement',
        'ngdc_recruitment_title',
        'ngdc_recruitment_form_fields',
        'ngdc_recruitment_applicants',
        'ngdc_recruitment_signatories',
        'ngdc_footer_config',
        'ngdc_admin_service_pin',
      ];
      for (const k of knownKeys) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            localMap[k] = JSON.parse(item);
          } catch {
            localMap[k] = item;
          }
        }
      }
    } catch {}
  }

  const client = getSupabaseClient();
  if (!client) {
    return Object.keys(localMap).length > 0 ? localMap : null;
  }

  try {
    const { data, error } = await client.from('site_settings').select('*');
    if (error) {
      console.warn('Supabase fetch site settings error:', error.message);
      return Object.keys(localMap).length > 0 ? localMap : null;
    }

    if (Array.isArray(data)) {
      const settingsMap: Record<string, any> = { ...localMap };
      data.forEach((row) => {
        settingsMap[row.id] = row.value;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(row.id, typeof row.value === 'string' ? row.value : JSON.stringify(row.value));
          } catch {}
        }
      });
      return settingsMap;
    }
    return Object.keys(localMap).length > 0 ? localMap : null;
  } catch (err) {
    console.warn('Supabase fetch site settings failed:', err);
    return Object.keys(localMap).length > 0 ? localMap : null;
  }
}

/**
 * Insert or update a specific site setting in Supabase
 */
export async function upsertSiteSetting(id: string, value: any): Promise<boolean> {
  // 1. Immediately cache locally so data is never lost even if network or Supabase is offline
  const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(id, stringifiedValue);
    } catch (e) {
      console.warn(`localStorage cache error for ${id}:`, e);
    }
  }

  const client = getSupabaseClient();
  if (!client) return true; // Successfully saved locally

  try {
    // In site_settings table, column 'value' stores JSON string representation.
    // The table schema has columns: id (text), value (jsonb or text).
    const record = { id, value: stringifiedValue };
    const { error } = await client
      .from('site_settings')
      .upsert([record], { onConflict: 'id' });

    if (error) {
      console.warn(`Supabase upsert setting error for ${id}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Supabase upsert setting failed for ${id}:`, err);
    return false;
  }
}

/**
 * Subscribe to cadet updates via Supabase Realtime.
 * Calls `onUpdate` with the realtime payload whenever a row in the `cadets` table is updated.
 * Returns an unsubscribe function to clean up the subscription.
 */
export function subscribeToCadetUpdates(onUpdate: (payload: any) => void): () => void {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available for realtime subscription');
    return () => {};
  }
  const channel = client.channel('public:cadets')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cadets' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Subscribe to site settings updates via Supabase Realtime.
 */
export function subscribeToSiteSettingsUpdates(onUpdate: (payload: any) => void): () => void {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available for realtime subscription');
    return () => {};
  }
  const channel = client.channel('public:site_settings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}
