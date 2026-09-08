import { fetchCadetsFromSupabase, fetchSiteSettings, isSupabaseConfigured } from './supabaseClient';
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
      if (err?.type === 'database_not_found') {
        return {
          connected: true,
          databaseFound: false,
          settingsColFound: false,
          cadetsColFound: false,
          error: `Database "${config.databaseId}" not found in your Appwrite Project. Please create database ID: ${config.databaseId}`,
        };
      }
      if (err?.type === 'collection_not_found') {
        databaseFound = true;
        settingsColFound = false;
      }
    } else {
      const msg = String(err?.message || '');
      const isFetchFailed = msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network');
      
      // Try testing via server route to see if database exists without browser CORS limits
      try {
        const serverCheck = await fetch('/api/appwrite/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: config.endpoint,
            projectId: config.projectId,
            databaseId: config.databaseId,
          }),
        });
        const sData = await serverCheck.json().catch(() => ({}));
        if (sData?.ok) {
          return {
            connected: true,
            databaseFound: true,
            settingsColFound: false,
            cadetsColFound: false,
            error: 'Appwrite database reached via server, but browser access is blocked by CORS. In Appwrite Console -> Overview -> Platforms -> Add Web App -> Set Hostname to "*".',
          };
        }
      } catch {}

      const friendlyError = isFetchFailed
        ? 'Failed to fetch (CORS). In your Appwrite Cloud Console -> Overview -> Platforms -> click "Add Platform" -> "Web App" -> set Hostname to "*".'
        : err?.message || 'Failed to connect to Appwrite Endpoint.';

      return {
        connected: false,
        databaseFound: false,
        settingsColFound: false,
        cadetsColFound: false,
        error: friendlyError,
      };
    }
  }

  // 2. Check cadets collection
  try {
    await db.listDocuments(config.databaseId, config.cadetsCollectionId, []);
    cadetsColFound = true;
  } catch (err: any) {
    if (err?.type === 'collection_not_found') {
      cadetsColFound = false;
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
 * Executes a full migration from Supabase/LocalStorage to Appwrite Cloud
 */
export async function executeSupabaseToAppwriteMigration(
  onProgress?: (progress: MigrationProgress) => void
): Promise<boolean> {
  const update = (p: Partial<MigrationProgress>) => {
    if (onProgress) {
      onProgress({
        stage: 'checking',
        message: '',
        settingsTotal: 0,
        settingsProcessed: 0,
        cadetsTotal: 0,
        cadetsProcessed: 0,
        ...p,
      });
    }
  };

  try {
    update({ stage: 'checking', message: 'Verifying Appwrite setup and connection...' });
    const check = await testAppwriteSetup();
    if (!check.connected || !check.databaseFound) {
      update({
        stage: 'error',
        message: check.error || 'Cannot proceed: Appwrite database is not ready.',
        errorDetails: check.error,
      });
      return false;
    }

    if (!check.settingsColFound && !check.cadetsColFound) {
      update({
        stage: 'error',
        message: 'Collections "site_settings" and "cadets" not found. Please create them in Appwrite Console first.',
        errorDetails: 'Missing collections in Appwrite Database',
      });
      return false;
    }

    // 1. Fetch source settings from Supabase (or cached local state)
    update({ stage: 'migrating_settings', message: 'Reading site settings from Supabase & local storage...' });
    const sourceSettings = (await fetchSiteSettings()) || {};
    const settingKeys = Object.keys(sourceSettings);
    const settingsTotal = settingKeys.length;

    let settingsProcessed = 0;
    if (check.settingsColFound && settingsTotal > 0) {
      update({
        stage: 'migrating_settings',
        message: `Migrating ${settingsTotal} site settings to Appwrite Cloud...`,
        settingsTotal,
        settingsProcessed: 0,
      });

      for (const key of settingKeys) {
        try {
          await upsertSiteSettingToAppwrite(key, sourceSettings[key]);
        } catch (e) {
          console.warn(`Failed to migrate setting "${key}":`, e);
        }
        settingsProcessed++;
        update({
          stage: 'migrating_settings',
          message: `Migrated ${settingsProcessed}/${settingsTotal} settings...`,
          settingsTotal,
          settingsProcessed,
        });
      }
    }

    // 2. Fetch source cadets
    update({ stage: 'migrating_cadets', message: 'Reading cadets from Supabase & local storage...' });
    let cadets: CadetUserAccount[] = [];
    if (isSupabaseConfigured()) {
      const sbCadets = await fetchCadetsFromSupabase();
      if (sbCadets && sbCadets.length > 0) {
        cadets = sbCadets;
      }
    }

    // Fallback to local storage if supabase returned empty
    if (cadets.length === 0 && typeof window !== 'undefined') {
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
        message: `Migrating ${cadetsTotal} cadet records to Appwrite Cloud...`,
        settingsTotal,
        settingsProcessed,
        cadetsTotal,
        cadetsProcessed: 0,
      });

      for (const cadet of cadets) {
        try {
          await upsertCadetToAppwrite(cadet);
        } catch (e) {
          console.warn(`Failed to migrate cadet "${cadet.cadetNo}":`, e);
        }
        cadetsProcessed++;
        update({
          stage: 'migrating_cadets',
          message: `Migrated ${cadetsProcessed}/${cadetsTotal} cadets...`,
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
      message: 'Verifying migrated documents in Appwrite Cloud...',
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
      message: `Migration complete! Appwrite now hosts ${verifiedSettingsCount} site settings and ${verifiedCadetsCount} cadet profiles.`,
      settingsTotal,
      settingsProcessed,
      cadetsTotal,
      cadetsProcessed,
    });

    return true;
  } catch (err: any) {
    update({
      stage: 'error',
      message: `Migration failed: ${err?.message || err}`,
      errorDetails: err?.message || String(err),
    });
    return false;
  }
}
