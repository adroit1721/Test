// src/utils/siteSettings.ts
import { getSupabaseClient } from './supabaseClient';

/** Fetch all site settings */
export async function loadAllSettings(): Promise<Record<string, any>> {
  const client = getSupabaseClient();
  if (!client) return {};
  const { data, error } = await client.from('site_settings').select('*');
  if (error) {
    console.warn('loadAllSettings error:', error.message);
    return {};
  }
  const result: Record<string, any> = {};
  if (Array.isArray(data)) {
    data.forEach((row: any) => {
      result[row.id] = row.value;
    });
  }
  return result;
}

/** Upsert a single setting */
export async function upsertSetting(key: string, value: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('site_settings').upsert({ id: key, value }, { onConflict: 'id' });
}

/** Get a single setting */
export async function getSiteSetting(key: string): Promise<any> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from('site_settings').select('value').eq('id', key).single();
  if (error) {
    console.warn(`getSiteSetting error for ${key}:`, error.message);
    return null;
  }
  return data?.value ?? null;
}
