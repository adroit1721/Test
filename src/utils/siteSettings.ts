// src/utils/siteSettings.ts
import { getSupabaseClient } from './supabaseClient';
import {
  isAppwriteConfigured,
  fetchSiteSettingsFromAppwrite,
  upsertSiteSettingToAppwrite,
} from './appwriteClient';

/** Fetch all site settings */
export async function loadAllSettings(): Promise<Record<string, any>> {
  // 1. Try Appwrite Cloud first if configured
  if (isAppwriteConfigured()) {
    try {
      const appwriteSettings = await fetchSiteSettingsFromAppwrite();
      if (appwriteSettings && Object.keys(appwriteSettings).length > 0) {
        return appwriteSettings;
      }
    } catch (err) {
      console.warn('Appwrite loadAllSettings error:', err);
    }
  }

  // 2. Try Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('site_settings').select('*');
      if (!error && Array.isArray(data)) {
        const result: Record<string, any> = {};
        data.forEach((row: any) => {
          result[row.id] = row.value;
        });
        return result;
      }
    } catch (err) {
      console.warn('Supabase loadAllSettings error:', err);
    }
  }

  // 3. Fallback to localStorage
  const localMap: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ngdc_')) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              localMap[key] = JSON.parse(val);
            } catch {
              localMap[key] = val;
            }
          }
        }
      }
    } catch {}
  }
  return localMap;
}

/** Upsert a single setting across available storage providers */
export async function upsertSetting(key: string, value: any): Promise<void> {
  // 1. Immediate localStorage synchronous write
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}
  }

  // 2. Write to Appwrite Cloud if configured
  if (isAppwriteConfigured()) {
    upsertSiteSettingToAppwrite(key, value).catch((err) => {
      console.warn(`Failed to sync setting "${key}" to Appwrite:`, err);
    });
  }

  // 3. Dual-write to Supabase if still active
  const client = getSupabaseClient();
  if (client) {
    try {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      const record = { id: key, value: stringified };
      await client.from('site_settings').upsert([record], { onConflict: 'id' });
    } catch {}
  }
}

/** Get a single setting */
export async function getSiteSetting(key: string): Promise<any> {
  // 1. Try Appwrite Cloud
  if (isAppwriteConfigured()) {
    try {
      const all = await fetchSiteSettingsFromAppwrite();
      if (all && all[key] !== undefined) return all[key];
    } catch {}
  }

  // 2. Try Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('site_settings').select('value').eq('id', key).single();
      if (!error && data?.value !== undefined) {
        return data.value;
      }
    } catch {}
  }

  // 3. Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
    } catch {}
  }

  return null;
}
