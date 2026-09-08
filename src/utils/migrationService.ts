import {
  fetchCadetsFromAppwrite,
  fetchSiteSettingsFromAppwrite,
  upsertCadetToAppwrite,
  upsertSiteSettingToAppwrite,
  isAppwriteConfigured,
  getAppwriteDatabases,
  getAppwriteConfig,
} from './appwriteClient';
import { CadetUserAccount } from '../types';

export interface MigrationProgress {
  stage: 'idle' | 'checking' | 'migrating_settings' | 'migrating_cadets' | 'verifying' | 'completed' | 'error';
  message: string;
  settingsTotal: number;
  settingsProcessed: number;
  cadetsTotal: number;
  cadetsProcessed: number;
  errorDetails?: string;
}

export async function testAppwriteSetup(): Promise<{
  connected: boolean;
  databaseFound: boolean;
  settingsColFound: boolean;
  cadetsColFound: boolean;
  error?: string;
}> {
  if (!isAppwriteConfigured()) {
    return {
      connected: false,
      databaseFound: false,
      settingsColFound: false,
      cadetsColFound: false,
      error: 'Appwrite is not configured. Please check your Project ID and Endpoint.',
    };
  }

  const db = getAppwriteDatabases();
  if (!db) {
    return {
      connected: false,
      databaseFound: false,
      settingsColFound: false,
      cadetsColFound: false,
      error: 'Could not initialize Appwrite database client.',
    };
  }

  const config = getAppwriteConfig();
  let databaseFound = false;
  let settingsColFound = false;
  let cadetsColFound = false;

  // 1. Check site_settings collection
  try {
    await db.listDocuments(config.databaseId, config.settingsCollectionId, []);
    databaseFound = true;
    settingsColFound = true;
  } catch (err: any) {
    if (err?.code === 404) {
      return {
        connected: true,
        databaseFound: false,
        settingsColFound: false,
        cadetsColFound: false,
        error: `Database "${config.databaseId}" or Collection "${config.settingsCollectionId}" not found.`,
      };
    }
  }

  // 2. Check cadets collection
  try {
    await db.listDocuments(config.databaseId, config.cadetsCollectionId, []);
    databaseFound = true;
    cadetsColFound = true;
  } catch (err: any) {
    if (err?.code === 404) {
      return {
        connected: true,
        databaseFound: true,
        settingsColFound: true,
        cadetsColFound: false,
        error: `Cadets collection "${config.cadetsCollectionId}" not found.`,
      };
    }
  }

  return {
    connected: true,
    databaseFound,
    settingsColFound,
    cadetsColFound,
  };
}

/**
 * Sync / Backup local data to Appwrite Cloud
 */
export async function syncLocalToAppwrite(
  onProgress: (progress: MigrationProgress) => void
): Promise<boolean> {
  const update = (partial: Partial<MigrationProgress>) => {
    onProgress({
      stage: 'idle',
      message: '',
      settingsTotal: 0,
      settingsProcessed: 0,
      cadetsTotal: 0,
      cadetsProcessed: 0,
      ...partial,
    });
  };

  try {
    update({ stage: 'checking', message: 'Testing Appwrite Cloud connectivity...' });
    const check = await testAppwriteSetup();
    if (!check.connected || !check.databaseFound) {
      throw new Error(check.error || 'Appwrite Cloud database or collections not accessible.');
    }

    // 1. Read local storage settings
    update({ stage: 'migrating_settings', message: 'Reading local site settings...' });
    const localSettings: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ngdc_') && !key.includes('cadet_users')) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              localSettings[key] = JSON.parse(val);
            } catch {
              localSettings[key] = val;
            }
          }
        }
      }
    }

    const settingsEntries = Object.entries(localSettings);
    const settingsTotal = settingsEntries.length;
    let settingsProcessed = 0;

    if (check.settingsColFound && settingsTotal > 0) {
      update({
        stage: 'migrating_settings',
        message: `Syncing ${settingsTotal} settings to Appwrite Cloud...`,
        settingsTotal,
        settingsProcessed: 0,
      });

      for (const [key, value] of settingsEntries) {
        try {
          await upsertSiteSettingToAppwrite(key, value);
        } catch (e) {
          console.warn(`Failed to sync setting "${key}":`, e);
        }
        settingsProcessed++;
        update({
          stage: 'migrating_settings',
          message: `Synced ${settingsProcessed}/${settingsTotal} settings...`,
          settingsTotal,
          settingsProcessed,
        });
      }
    }

    // 2. Read local cadets
    update({ stage: 'migrating_cadets', message: 'Reading local cadets...' });
    let cadets: CadetUserAccount[] = [];
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('ngdc_cadet_users_v8') || localStorage.getItem('ngdc_cadet_users');
        if (local) cadets = JSON.parse(local);
      } catch {}
    }

    const cadetsTotal = cadets.length;
    let cadetsProcessed = 0;

    if (check.cadetsColFound && cadetsTotal > 0) {
      update({
        stage: 'migrating_cadets',
        message: `Syncing ${cadetsTotal} cadet records to Appwrite Cloud...`,
        settingsTotal,
        settingsProcessed,
        cadetsTotal,
        cadetsProcessed: 0,
      });

      for (const cadet of cadets) {
        try {
          await upsertCadetToAppwrite(cadet);
        } catch (e) {
          console.warn(`Failed to sync cadet "${cadet.cadetNo}":`, e);
        }
        cadetsProcessed++;
        update({
          stage: 'migrating_cadets',
          message: `Synced ${cadetsProcessed}/${cadetsTotal} cadets...`,
          settingsTotal,
          settingsProcessed,
          cadetsTotal,
          cadetsProcessed,
        });
      }
    }

    // 3. Verification
    update({
      stage: 'verifying',
      message: 'Verifying data in Appwrite Cloud...',
      settingsTotal,
      settingsProcessed,
      cadetsTotal,
      cadetsProcessed,
    });

    const verifySettings = check.settingsColFound ? await fetchSiteSettingsFromAppwrite() : {};
    const verifyCadets = check.cadetsColFound ? await fetchCadetsFromAppwrite() : [];

    const verifiedSettingsCount = Object.keys(verifySettings || {}).length;
    const verifiedCadetsCount = (verifyCadets || []).length;

    update({
      stage: 'completed',
      message: `Complete! Appwrite now hosts ${verifiedSettingsCount} site settings and ${verifiedCadetsCount} cadet profiles.`,
      settingsTotal,
      settingsProcessed,
      cadetsTotal,
      cadetsProcessed,
    });

    return true;
  } catch (err: any) {
    update({
      stage: 'error',
      message: `Sync failed: ${err?.message || err}`,
      errorDetails: err?.message || String(err),
    });
    return false;
  }
}

// Alias for backwards compatibility
export const runMigration = syncLocalToAppwrite;
