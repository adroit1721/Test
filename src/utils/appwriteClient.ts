import { Client, Databases, Storage, ID, Query } from 'appwrite';
import { CadetUserAccount } from '../types';

// Defensive safety guard: prevent uncaught InvalidStateError when sending on a WebSocket that is CONNECTING/CLOSING
if (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined') {
  try {
    const originalSend = window.WebSocket.prototype.send;
    window.WebSocket.prototype.send = function (data: any) {
      if (this.readyState === window.WebSocket.OPEN) {
        return originalSend.call(this, data);
      }
      // Silently prevent crash if socket is still in CONNECTING or CLOSING state
    };
  } catch {}
}

let appwriteClientInstance: Client | null = null;
let appwriteDatabasesInstance: Databases | null = null;

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  projectName?: string;
  databaseId: string;
  settingsCollectionId: string;
  cadetsCollectionId: string;
}

export function getAppwriteConfig(): AppwriteConfig {
  const metaEnv = (import.meta as any).env || {};

  const DEFAULT_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
  const DEFAULT_PROJECT_ID = '6a9fb005002b81b05e45';
  const DEFAULT_PROJECT_NAME = 'ngdc_bncc';
  const DEFAULT_DATABASE_ID = 'ngdc_db';
  const DEFAULT_SETTINGS_COLLECTION_ID = 'site_settings';
  const DEFAULT_CADETS_COLLECTION_ID = 'cadets';

  let endpoint = metaEnv.VITE_APPWRITE_ENDPOINT || DEFAULT_ENDPOINT;
  let projectId = metaEnv.VITE_APPWRITE_PROJECT_ID || DEFAULT_PROJECT_ID;
  let projectName = metaEnv.VITE_APPWRITE_PROJECT_NAME || DEFAULT_PROJECT_NAME;
  let databaseId = metaEnv.VITE_APPWRITE_DATABASE_ID || DEFAULT_DATABASE_ID;
  let settingsCollectionId = metaEnv.VITE_APPWRITE_SETTINGS_COLLECTION_ID || DEFAULT_SETTINGS_COLLECTION_ID;
  let cadetsCollectionId = metaEnv.VITE_APPWRITE_CADETS_COLLECTION_ID || DEFAULT_CADETS_COLLECTION_ID;

  if (typeof window !== 'undefined') {
    try {
      const localEndpoint = localStorage.getItem('ngdc_appwrite_endpoint');
      const localProjectId = localStorage.getItem('ngdc_appwrite_project_id');
      const localProjectName = localStorage.getItem('ngdc_appwrite_project_name');
      const localDatabaseId = localStorage.getItem('ngdc_appwrite_database_id');
      const localSettingsCol = localStorage.getItem('ngdc_appwrite_settings_col');
      const localCadetsCol = localStorage.getItem('ngdc_appwrite_cadets_col');

      if (localEndpoint) endpoint = localEndpoint;
      if (localProjectId) projectId = localProjectId;
      if (localProjectName) projectName = localProjectName;
      if (localDatabaseId) databaseId = localDatabaseId;
      if (localSettingsCol) settingsCollectionId = localSettingsCol;
      if (localCadetsCol) cadetsCollectionId = localCadetsCol;
    } catch {}
  }

  return {
    endpoint: endpoint.trim(),
    projectId: projectId.trim(),
    projectName: projectName.trim(),
    databaseId: databaseId.trim(),
    settingsCollectionId: settingsCollectionId.trim(),
    cadetsCollectionId: cadetsCollectionId.trim(),
  };
}

export function isAppwriteConfigured(): boolean {
  const config = getAppwriteConfig();
  return Boolean(config.endpoint && config.projectId && config.databaseId);
}

export function getAppwriteClient(): Client | null {
  if (appwriteClientInstance) return appwriteClientInstance;
  const config = getAppwriteConfig();
  if (config.endpoint && config.projectId) {
    try {
      const client = new Client();
      client.setEndpoint(config.endpoint);
      client.setProject(config.projectId);
      appwriteClientInstance = client;
      return client;
    } catch (err) {
      console.warn('Failed to initialize Appwrite Client:', err);
      return null;
    }
  }
  return null;
}

export function getAppwriteDatabases(): Databases | null {
  if (appwriteDatabasesInstance) return appwriteDatabasesInstance;
  const client = getAppwriteClient();
  if (client) {
    appwriteDatabasesInstance = new Databases(client);
    return appwriteDatabasesInstance;
  }
  return null;
}

export function resetAppwriteInstance(): void {
  appwriteClientInstance = null;
  appwriteDatabasesInstance = null;
}

/**
 * Appwrite document IDs must be valid ASCII [a-zA-Z0-9_.-], <= 36 characters,
 * and cannot start with a leading special character.
 */
export function sanitizeDocumentId(key: string): string {
  let clean = String(key || '')
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, '_');
  // Remove leading special characters
  clean = clean.replace(/^[^a-zA-Z0-9]+/, '');
  if (!clean) clean = `doc_${Math.random().toString(36).substring(2, 9)}`;
  return clean.slice(0, 36);
}

/**
 * Map CadetUserAccount into Appwrite document data
 */
export function mapCadetToAppwriteDocument(cadet: CadetUserAccount) {
  // Store raw cadet record without duplicating heavy base64 avatars
  const rawWithoutAvatar = { ...cadet };
  delete (rawWithoutAvatar as any).avatarUrl;

  return {
    cadet_no: cadet.cadetNo || '',
    name: cadet.name || '',
    rank: cadet.rank || 'Cadet',
    category: cadet.category || 'Male Platoon',
    section: cadet.section || 'Section 01',
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
    attendance_percentage: Number(cadet.attendancePercentage ?? 100),
    parades_attended: Number(cadet.paradesAttended ?? 0),
    total_parades: Number(cadet.totalParades ?? 0),
    status: cadet.status === 'Pending Approval' || cadet.isApproved === false ? 'Pending Approval' : (cadet.status || 'Active'),
    cadet_type: cadet.cadetType || 'Current',
    is_approved: !(cadet.status === 'Pending Approval' || cadet.isApproved === false),
    avatar_url: cadet.avatarUrl && cadet.avatarUrl.length < 2048 && !cadet.avatarUrl.startsWith('data:') ? cadet.avatarUrl : '',
    raw_data: JSON.stringify(rawWithoutAvatar),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Map Appwrite document back to CadetUserAccount
 */
export function mapAppwriteDocumentToCadet(doc: any): CadetUserAccount {
  let raw: Partial<CadetUserAccount> = {};
  if (doc.raw_data) {
    try {
      raw = typeof doc.raw_data === 'string' ? JSON.parse(doc.raw_data) : doc.raw_data;
    } catch {}
  }

  // Strictly identify if this account is pending approval
  const isPending =
    doc.status === 'Pending Approval' ||
    raw.status === 'Pending Approval' ||
    doc.is_approved === false ||
    doc.is_approved === 'false' ||
    raw.isApproved === false;

  const resolvedStatus = isPending
    ? 'Pending Approval'
    : ((doc.status || raw.status || 'Active') as 'Active' | 'Under Training' | 'Alumni');
  const resolvedIsApproved = !isPending;

  return {
    id: doc.$id || raw.id || ID.unique(),
    cadetNo: doc.cadet_no || raw.cadetNo || '',
    password: raw.password || '',
    name: doc.name || raw.name || '',
    nameBangla: raw.nameBangla || '',
    fatherName: raw.fatherName || '',
    fatherNameBangla: raw.fatherNameBangla || '',
    motherName: raw.motherName || '',
    motherNameBangla: raw.motherNameBangla || '',
    dob: raw.dob || '',
    religion: raw.religion || 'Islam',
    className: raw.className || '11th',
    category: doc.category || raw.category || 'Male Platoon',
    section: doc.section || raw.section || 'Section 01',
    rank: doc.rank || raw.rank || 'Cadet',
    gender: doc.gender || raw.gender || 'Male',
    appointment: doc.appointment || raw.appointment || 'Cadet',
    platoon: doc.platoon || raw.platoon || 'Male Platoon',
    batch: doc.batch || raw.batch || 'Batch 24',
    collegeId: doc.college_id || raw.collegeId || '',
    department: doc.department || raw.department || '',
    bloodGroup: doc.blood_group || raw.bloodGroup || 'B+',
    presentAddress: raw.presentAddress || '',
    permanentAddress: raw.permanentAddress || '',
    phone: doc.phone || raw.phone || '',
    guardianPhone: raw.guardianPhone || '',
    email: doc.email || raw.email || '',
    currentJob: raw.currentJob || '',
    socialMedia: raw.socialMedia || '',
    additionalSkills: raw.additionalSkills || '',
    achievements: raw.achievements || '',
    joiningDate: doc.joining_date || raw.joiningDate || '',
    attendancePercentage: doc.attendance_percentage ?? raw.attendancePercentage ?? 100,
    paradesAttended: doc.parades_attended ?? raw.paradesAttended ?? 0,
    totalParades: doc.total_parades ?? raw.totalParades ?? 0,
    campsAttended: raw.campsAttended || [],
    certificates: raw.certificates || [],
    status: resolvedStatus,
    cadetType: doc.cadet_type || raw.cadetType || 'Current',
    isApproved: resolvedIsApproved,
    avatarUrl: doc.avatar_url || raw.avatarUrl || '',
    customFields: raw.customFields,
  };
}

/**
 * Fetch all cadets from Appwrite Cloud
 */
export async function fetchCadetsFromAppwrite(): Promise<CadetUserAccount[] | null> {
  const db = getAppwriteDatabases();
  if (!db) return null;
  const config = getAppwriteConfig();

  try {
    const res = await db.listDocuments(config.databaseId, config.cadetsCollectionId, [
      Query.limit(500),
      Query.orderDesc('updated_at'),
    ]);
    if (res && Array.isArray(res.documents)) {
      return res.documents.map(mapAppwriteDocumentToCadet);
    }
    return null;
  } catch (err: any) {
    console.warn('Appwrite fetch cadets failed:', err?.message || err);
    return null;
  }
}

/**
 * Upsert cadet to Appwrite Cloud
 */
export async function upsertCadetToAppwrite(cadet: CadetUserAccount): Promise<boolean> {
  const db = getAppwriteDatabases();
  if (!db) return false;
  const config = getAppwriteConfig();

  const docId = sanitizeDocumentId(cadet.id || `cadet_${cadet.cadetNo || ID.unique()}`);
  const data = mapCadetToAppwriteDocument(cadet);

  try {
    // Try updating first
    try {
      await db.updateDocument(config.databaseId, config.cadetsCollectionId, docId, data);
      return true;
    } catch (updateErr: any) {
      // 404 means document does not exist yet -> create it
      if (updateErr?.code === 404 || updateErr?.type === 'document_not_found') {
        await db.createDocument(config.databaseId, config.cadetsCollectionId, docId, data);
        return true;
      }
      throw updateErr;
    }
  } catch (err: any) {
    console.warn(`Appwrite upsert cadet ${cadet.cadetNo} failed:`, err?.message || err);
    return false;
  }
}

/**
 * Delete cadet from Appwrite Cloud
 */
export async function deleteCadetFromAppwrite(id: string, _cadetNo?: string): Promise<boolean> {
  const db = getAppwriteDatabases();
  if (!db) return false;
  const config = getAppwriteConfig();

  let success = false;
  const docId = sanitizeDocumentId(id);

  try {
    await db.deleteDocument(config.databaseId, config.cadetsCollectionId, docId);
    success = true;
  } catch (err: any) {
    // If deleted already or not found, proceed
    if (err?.code === 404) success = true;
  }

  return success;
}

/**
 * Fetch all site settings from Appwrite Cloud
 */
export async function fetchSiteSettingsFromAppwrite(): Promise<Record<string, any> | null> {
  const db = getAppwriteDatabases();
  if (!db) return null;
  const config = getAppwriteConfig();

  try {
    const res = await db.listDocuments(config.databaseId, config.settingsCollectionId, [
      Query.limit(500),
    ]);

    if (res && Array.isArray(res.documents)) {
      const map: Record<string, any> = {};
      for (const doc of res.documents) {
        const key = doc.key || doc.$id;
        try {
          map[key] = typeof doc.value === 'string' ? JSON.parse(doc.value) : doc.value;
        } catch {
          map[key] = doc.value;
        }
      }
      return map;
    }
    return null;
  } catch (err: any) {
    console.warn('Appwrite fetch site settings failed:', err?.message || err);
    return null;
  }
}

/**
 * Upsert a site setting in Appwrite Cloud
 */
export async function upsertSiteSettingToAppwrite(key: string, value: any): Promise<boolean> {
  const db = getAppwriteDatabases();
  if (!db) return false;
  const config = getAppwriteConfig();

  const docId = sanitizeDocumentId(key);
  const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
  const payload = {
    key,
    value: stringifiedValue,
    updated_at: new Date().toISOString(),
  };

  try {
    try {
      await db.updateDocument(config.databaseId, config.settingsCollectionId, docId, payload);
      return true;
    } catch (updateErr: any) {
      if (updateErr?.code === 404 || updateErr?.type === 'document_not_found') {
        await db.createDocument(config.databaseId, config.settingsCollectionId, docId, payload);
        return true;
      }
      throw updateErr;
    }
  } catch (err: any) {
    console.warn(`Appwrite upsert setting ${key} failed:`, err?.message || err);
    return false;
  }
}

/**
 * Subscribe to Appwrite updates.
 * Uses resilient REST polling to synchronize remote updates (site_settings & cadets collection)
 * without relying on Appwrite Cloud's unstable/restricted WebSocket realtime endpoints
 * which cause disconnect reconnect loops and InvalidStateError.
 */
export function subscribeToAppwriteUpdates(
  onUpdate: (event: { collection: string; payload: any; action: string }) => void
): () => void {
  if (!isAppwriteConfigured()) return () => {};

  let isDisposed = false;
  const lastSeenSettingsHash: Record<string, string> = {};
  const lastSeenCadetsHash: Record<string, string> = {};

  const getCadetFingerprint = (c: CadetUserAccount) => {
    return `${c.id}#${c.cadetNo}#${c.name}#${c.rank}#${c.category}#${c.platoon}#${c.section}#${c.status}#${c.isApproved}#${c.appointment}#${(c.avatarUrl || '').slice(0, 50)}`;
  };

  const pollCloud = async () => {
    if (isDisposed) return;
    try {
      const [settings, cadets] = await Promise.all([
        fetchSiteSettingsFromAppwrite().catch(() => null),
        fetchCadetsFromAppwrite().catch(() => null),
      ]);

      if (isDisposed) return;

      // 1. Sync site settings changes
      if (settings) {
        Object.entries(settings).forEach(([key, value]) => {
          const valStr = typeof value === 'string' ? value : JSON.stringify(value);
          if (lastSeenSettingsHash[key] !== undefined && lastSeenSettingsHash[key] !== valStr) {
            onUpdate({
              collection: 'site_settings',
              payload: { key, value },
              action: 'update',
            });
          }
          lastSeenSettingsHash[key] = valStr;
        });
      }

      // 2. Sync individual cadets changes
      if (cadets && Array.isArray(cadets)) {
        cadets.forEach((c) => {
          if (!c || !c.id) return;
          const fp = getCadetFingerprint(c);
          if (lastSeenCadetsHash[c.id] !== undefined && lastSeenCadetsHash[c.id] !== fp) {
            onUpdate({
              collection: 'cadets',
              payload: {
                ...mapCadetToAppwriteDocument(c),
                $id: c.id,
                id: c.id,
              },
              action: 'update',
            });
          }
          lastSeenCadetsHash[c.id] = fp;
        });
      }
    } catch {
      // Quietly ignore network blips
    }
  };

  // Seed initial hashes quietly
  Promise.all([
    fetchSiteSettingsFromAppwrite().catch(() => null),
    fetchCadetsFromAppwrite().catch(() => null),
  ]).then(([settings, cadets]) => {
    if (isDisposed) return;
    if (settings) {
      Object.entries(settings).forEach(([key, value]) => {
        lastSeenSettingsHash[key] = typeof value === 'string' ? value : JSON.stringify(value);
      });
    }
    if (cadets && Array.isArray(cadets)) {
      cadets.forEach((c) => {
        if (!c || !c.id) return;
        lastSeenCadetsHash[c.id] = getCadetFingerprint(c);
      });
    }
  }).catch(() => {});

  // Poll every 3.5 seconds in the background for snappy cross-device updates
  const intervalId = setInterval(pollCloud, 3500);

  return () => {
    isDisposed = true;
    clearInterval(intervalId);
  };
}

/**
 * Appwrite Schema Setup Guide and Instructions
 */
export const APPWRITE_SETUP_GUIDE = {
  databaseId: 'ngdc_db',
  collections: [
    {
      id: 'site_settings',
      name: 'Site Settings',
      permissions: 'Role "Any" -> Read, Create, Update, Delete',
      attributes: [
        { key: 'key', type: 'String', size: 128, required: true },
        { key: 'value', type: 'String', size: 1000000, required: true },
        { key: 'updated_at', type: 'String', size: 64, required: false },
      ],
    },
    {
      id: 'cadets',
      name: 'Cadets',
      permissions: 'Role "Any" -> Read, Create, Update, Delete',
      attributes: [
        { key: 'cadet_no', type: 'String', size: 64, required: true },
        { key: 'name', type: 'String', size: 128, required: true },
        { key: 'rank', type: 'String', size: 64, required: false, default: 'Cadet' },
        { key: 'category', type: 'String', size: 64, required: false, default: 'Male Platoon' },
        { key: 'section', type: 'String', size: 64, required: false, default: 'Section 01' },
        { key: 'gender', type: 'String', size: 32, required: false, default: 'Male' },
        { key: 'appointment', type: 'String', size: 64, required: false, default: 'Cadet' },
        { key: 'platoon', type: 'String', size: 64, required: false },
        { key: 'batch', type: 'String', size: 64, required: false },
        { key: 'college_id', type: 'String', size: 64, required: false },
        { key: 'department', type: 'String', size: 128, required: false },
        { key: 'blood_group', type: 'String', size: 16, required: false, default: 'B+' },
        { key: 'phone', type: 'String', size: 32, required: false },
        { key: 'email', type: 'String', size: 128, required: false },
        { key: 'joining_date', type: 'String', size: 64, required: false },
        { key: 'attendance_percentage', type: 'Integer', required: false, default: 100 },
        { key: 'parades_attended', type: 'Integer', required: false, default: 0 },
        { key: 'total_parades', type: 'Integer', required: false, default: 0 },
        { key: 'status', type: 'String', size: 32, required: false, default: 'Active' },
        { key: 'cadet_type', type: 'String', size: 32, required: false, default: 'Current' },
        { key: 'is_approved', type: 'Boolean', required: false, default: true },
        { key: 'avatar_url', type: 'String', size: 50000, required: false },
        { key: 'raw_data', type: 'String', size: 1000000, required: false },
        { key: 'updated_at', type: 'String', size: 64, required: false },
      ],
    },
  ],
};
