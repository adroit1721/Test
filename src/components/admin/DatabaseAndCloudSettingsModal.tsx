import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  resetSupabaseInstance,
  SUPABASE_CADETS_SQL_SCHEMA,
  SUPABASE_SITE_SETTINGS_SQL_SCHEMA,
  fetchCadetsFromSupabase,
} from '../../utils/supabaseClient';
import {
  getAppwriteConfig,
  isAppwriteConfigured,
  resetAppwriteInstance,
  APPWRITE_SETUP_GUIDE,
} from '../../utils/appwriteClient';
import { testAppwriteSetup, executeSupabaseToAppwriteMigration, MigrationProgress } from '../../utils/migrationService';
import { autoProvisionAppwrite, ProvisionLog } from '../../utils/appwriteSetupApi';
import { getCloudinaryConfig, isCloudinaryConfigured } from '../../utils/cloudinary';
import { upsertSetting } from '../../utils/siteSettings';

interface DatabaseAndCloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCadets?: () => void;
}

export const DatabaseAndCloudSettingsModal: React.FC<DatabaseAndCloudSettingsModalProps> = ({
  isOpen,
  onClose,
  onSyncCadets,
}) => {
  // Appwrite States
  const [appwriteEndpoint, setAppwriteEndpoint] = useState('https://sgp.cloud.appwrite.io/v1');
  const [appwriteProjectId, setAppwriteProjectId] = useState('6a9fb005002b81b05e45');
  const [appwriteProjectName, setAppwriteProjectName] = useState('ngdc_bncc');
  const [appwriteDatabaseId, setAppwriteDatabaseId] = useState('ngdc_db');
  const [appwriteSettingsCol, setAppwriteSettingsCol] = useState('site_settings');
  const [appwriteCadetsCol, setAppwriteCadetsCol] = useState('cadets');

  const [testingAppwrite, setTestingAppwrite] = useState(false);
  const [appwriteStatus, setAppwriteStatus] = useState<{
    type: 'idle' | 'success' | 'warning' | 'error';
    message: string;
    details?: string;
  }>({ type: 'idle', message: '' });

  // Auto Provisioning via API Key
  const [apiKey, setApiKey] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionLogs, setProvisionLogs] = useState<ProvisionLog[]>([]);
  const [provisionResult, setProvisionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Migration States
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);

  // Supabase States
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Cloudinary States
  const [cloudinaryName, setCloudinaryName] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const [activeTab, setActiveTab] = useState<'appwrite' | 'migration' | 'supabase' | 'cloudinary' | 'appwrite_guide' | 'schema'>('appwrite');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Load configuration
  useEffect(() => {
    if (isOpen) {
      const awConfig = getAppwriteConfig();
      setAppwriteEndpoint(awConfig.endpoint);
      setAppwriteProjectId(awConfig.projectId);
      setAppwriteProjectName(awConfig.projectName || 'ngdc_bncc');
      setAppwriteDatabaseId(awConfig.databaseId);
      setAppwriteSettingsCol(awConfig.settingsCollectionId);
      setAppwriteCadetsCol(awConfig.cadetsCollectionId);

      const sbConfig = getSupabaseConfig();
      setSupabaseUrl(sbConfig.supabaseUrl);
      setSupabaseKey(sbConfig.supabaseAnonKey);

      const clConfig = getCloudinaryConfig();
      setCloudinaryName(clConfig.cloudName);
      setCloudinaryPreset(clConfig.uploadPreset);

      if (isAppwriteConfigured()) {
        setAppwriteStatus({
          type: 'success',
          message: `Appwrite Cloud configured (Project: ${awConfig.projectId})`,
        });
      }

      setSupabaseStatus({
        type: isSupabaseConfigured() ? 'success' : 'idle',
        message: isSupabaseConfigured() ? 'Supabase credentials detected.' : 'Not configured yet.',
      });

      setCloudinaryStatus({
        type: isCloudinaryConfigured() ? 'success' : 'idle',
        message: isCloudinaryConfigured() ? 'Cloudinary credentials detected.' : 'Using local fallback mode.',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAppwrite = async () => {
    localStorage.setItem('ngdc_appwrite_endpoint', appwriteEndpoint.trim());
    localStorage.setItem('ngdc_appwrite_project_id', appwriteProjectId.trim());
    localStorage.setItem('ngdc_appwrite_project_name', appwriteProjectName.trim());
    localStorage.setItem('ngdc_appwrite_database_id', appwriteDatabaseId.trim());
    localStorage.setItem('ngdc_appwrite_settings_col', appwriteSettingsCol.trim());
    localStorage.setItem('ngdc_appwrite_cadets_col', appwriteCadetsCol.trim());

    await upsertSetting('ngdc_appwrite_endpoint', appwriteEndpoint.trim());
    await upsertSetting('ngdc_appwrite_project_id', appwriteProjectId.trim());
    await upsertSetting('ngdc_appwrite_project_name', appwriteProjectName.trim());
    await upsertSetting('ngdc_appwrite_database_id', appwriteDatabaseId.trim());
    await upsertSetting('ngdc_appwrite_settings_col', appwriteSettingsCol.trim());
    await upsertSetting('ngdc_appwrite_cadets_col', appwriteCadetsCol.trim());

    resetAppwriteInstance();

    setTestingAppwrite(true);
    setAppwriteStatus({ type: 'idle', message: 'Testing Appwrite Cloud connection...' });

    try {
      const check = await testAppwriteSetup();
      if (!check.connected) {
        setAppwriteStatus({
          type: 'error',
          message: check.error || 'Could not connect to Appwrite endpoint.',
        });
      } else if (!check.databaseFound) {
        setAppwriteStatus({
          type: 'warning',
          message: `Endpoint verified, but database "${appwriteDatabaseId}" was not found. Please create it in Appwrite Console.`,
        });
      } else if (!check.settingsColFound || !check.cadetsColFound) {
        const missing = [];
        if (!check.settingsColFound) missing.push(`"${appwriteSettingsCol}"`);
        if (!check.cadetsColFound) missing.push(`"${appwriteCadetsCol}"`);
        setAppwriteStatus({
          type: 'warning',
          message: `Database "${appwriteDatabaseId}" found! However, collection(s) ${missing.join(' and ')} are not created yet. See the "Appwrite Guide" tab.`,
        });
      } else {
        setAppwriteStatus({
          type: 'success',
          message: 'All Appwrite Cloud connections and collections verified successfully!',
        });
        if (onSyncCadets) onSyncCadets();
      }
    } catch (err: any) {
      setAppwriteStatus({
        type: 'error',
        message: err?.message || 'Failed to verify Appwrite connection.',
      });
    } finally {
      setTestingAppwrite(false);
    }
  };

  const handleStartMigration = async () => {
    setMigrating(true);
    try {
      const success = await executeSupabaseToAppwriteMigration((progress) => {
        setMigrationProgress(progress);
      });
      if (success && onSyncCadets) {
        onSyncCadets();
      }
    } finally {
      setMigrating(false);
    }
  };

  const handleAutoProvision = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your Appwrite API Key to run automated setup.');
      return;
    }
    setIsProvisioning(true);
    setProvisionLogs([]);
    setProvisionResult(null);

    const res = await autoProvisionAppwrite(apiKey.trim(), (log) => {
      setProvisionLogs((prev) => [...prev, log]);
    });

    setProvisionResult(res);
    setIsProvisioning(false);

    if (res.success) {
      handleSaveAppwrite();
    }
  };

  const handleSaveSupabase = async () => {
    await upsertSetting('ngdc_supabase_url', supabaseUrl.trim());
    await upsertSetting('ngdc_supabase_anon_key', supabaseKey.trim());
    resetSupabaseInstance();

    setTestingSupabase(true);
    setSupabaseStatus({ type: 'idle', message: 'Testing Supabase connection...' });
    try {
      const res = await fetchCadetsFromSupabase();
      if (res !== null) {
        setSupabaseStatus({
          type: 'success',
          message: `Connected successfully! Found ${res.length} cadet record(s) in Postgres.`,
        });
        if (onSyncCadets) onSyncCadets();
      } else {
        setSupabaseStatus({
          type: 'error',
          message: 'Connected to Supabase endpoint, but could not query "cadets" table.',
        });
      }
    } catch (err: any) {
      setSupabaseStatus({ type: 'error', message: err?.message || 'Supabase connection failed.' });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSaveCloudinary = async () => {
    await upsertSetting('ngdc_cloudinary_cloud_name', cloudinaryName.trim());
    await upsertSetting('ngdc_cloudinary_upload_preset', cloudinaryPreset.trim());
    setCloudinaryStatus({ type: 'success', message: 'Cloudinary credentials saved!' });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_CADETS_SQL_SCHEMA + '\n\n' + SUPABASE_SITE_SETTINGS_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#fcfbf7] dark:bg-[#1c1c18] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#cdc6b3]/40 dark:border-[#423e35] bg-[#f6f3ed] dark:bg-[#141411]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eedc82]/30 flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] text-base">Database &amp; Cloud Configuration</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                Appwrite Cloud, Supabase Postgres &amp; Cloudinary CDN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7c7767] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-[#cdc6b3]/40 dark:border-[#423e35] px-5 bg-white dark:bg-[#1a1915]">
          <button
            onClick={() => setActiveTab('appwrite')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'appwrite'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Appwrite Cloud</span>
            {isAppwriteConfigured() && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'migration'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>Migration Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('appwrite_guide')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'appwrite_guide'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Appwrite Schema Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'supabase'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase</span>
            {isSupabaseConfigured() && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'cloudinary'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloudinary CDN</span>
            {isCloudinaryConfigured() && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: Appwrite Cloud */}
          {activeTab === 'appwrite' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold">Appwrite Cloud Backend Active</p>
                  <p>
                    Your Appwrite Cloud project holds real-time site configuration and the cadet directory database.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 dark:text-blue-200 space-y-1">
                  <p className="font-bold text-blue-900 dark:text-blue-100">Fix "Fetch Failed" in Appwrite Cloud (10-Second Step):</p>
                  <p className="leading-relaxed">
                    Appwrite blocks browser requests until a Web Platform is added. In your{' '}
                    <a
                      href="https://sgp.cloud.appwrite.io"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-blue-700 dark:text-blue-300 inline-flex items-center gap-0.5"
                    >
                      Appwrite Console <ExternalLink className="w-3 h-3 inline" />
                    </a>
                    : Click <strong>Overview</strong> &rarr; scroll to <strong>Platforms</strong> &rarr; click{' '}
                    <strong>+ Add Platform</strong> &rarr; <strong>Web App</strong> &rarr; Name: <code>NGDC Portal</code>{' '}
                    &rarr; Hostname: <code className="bg-blue-200 dark:bg-blue-900 px-1 py-0.5 rounded font-bold text-black dark:text-white">*</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Appwrite Endpoint
                  </label>
                  <input
                    type="text"
                    value={appwriteEndpoint}
                    onChange={(e) => setAppwriteEndpoint(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={appwriteProjectId}
                    onChange={(e) => setAppwriteProjectId(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Database ID
                  </label>
                  <input
                    type="text"
                    value={appwriteDatabaseId}
                    onChange={(e) => setAppwriteDatabaseId(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={appwriteProjectName}
                    onChange={(e) => setAppwriteProjectName(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Site Settings Collection ID
                  </label>
                  <input
                    type="text"
                    value={appwriteSettingsCol}
                    onChange={(e) => setAppwriteSettingsCol(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Cadets Collection ID
                  </label>
                  <input
                    type="text"
                    value={appwriteCadetsCol}
                    onChange={(e) => setAppwriteCadetsCol(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
              </div>

              {appwriteStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    appwriteStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                      : appwriteStatus.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200'
                      : appwriteStatus.type === 'error'
                      ? 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  {appwriteStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : appwriteStatus.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span>{appwriteStatus.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('migration')}
                  className="japandi-btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  <span>Migrate from Supabase</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppwrite}
                  disabled={testingAppwrite}
                  className="japandi-btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer"
                >
                  {testingAppwrite ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save &amp; Test Connection</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Migration Assistant */}
          {activeTab === 'migration' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  1-Click Migration: Supabase &rarr; Appwrite Cloud
                </h4>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596] leading-relaxed">
                  This tool reads all site configurations and cadet records from Supabase (or cached local storage) and
                  writes them directly into your Appwrite Cloud database (<code>{appwriteDatabaseId}</code>).
                </p>
              </div>

              {migrationProgress && (
                <div className="p-4 bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1c1c18] dark:text-[#fcfbf7]">{migrationProgress.message}</span>
                    {migrating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />}
                  </div>

                  {migrationProgress.settingsTotal > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-[#7c7767] dark:text-[#aca596] mb-1">
                        <span>Site Settings</span>
                        <span>
                          {migrationProgress.settingsProcessed} / {migrationProgress.settingsTotal}
                        </span>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{
                            width: `${(migrationProgress.settingsProcessed / migrationProgress.settingsTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {migrationProgress.cadetsTotal > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-[#7c7767] dark:text-[#aca596] mb-1">
                        <span>Cadet Profiles</span>
                        <span>
                          {migrationProgress.cadetsProcessed} / {migrationProgress.cadetsTotal}
                        </span>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{
                            width: `${(migrationProgress.cadetsProcessed / migrationProgress.cadetsTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {migrationProgress.stage === 'completed' && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{migrationProgress.message}</span>
                    </div>
                  )}

                  {migrationProgress.stage === 'error' && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{migrationProgress.message}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartMigration}
                  disabled={migrating}
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {migrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Migrating Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Migration to Appwrite</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Appwrite Schema Guide */}
          {activeTab === 'appwrite_guide' && (
            <div className="space-y-5">
              {/* Method A: Instant 1-Click Setup */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                      Method 1: Instant 1-Click Auto-Setup (Recommended)
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                    Takes 5 Seconds
                  </span>
                </div>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596] leading-relaxed">
                  Instead of manually typing 25+ attributes in Appwrite Cloud, generate a temporary API Key in your Appwrite Console, paste it below, and click <strong>Auto-Create Everything</strong>. It will automatically build Database <code>{appwriteDatabaseId}</code>, both collections (<code>{appwriteSettingsCol}</code>, <code>{appwriteCadetsCol}</code>), public permissions, and all attributes!
                </p>

                <div className="p-2.5 bg-white/70 dark:bg-black/20 rounded-xl text-[11px] text-[#555] dark:text-[#bbb] space-y-1 border border-black/5 dark:border-white/5">
                  <p className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">How to get your API Key in Appwrite:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Open your Appwrite Cloud project: <a href="https://sgp.cloud.appwrite.io" target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 underline font-medium">sgp.cloud.appwrite.io</a></li>
                    <li>Click <strong>Overview</strong> (or <strong>Project Settings</strong>) &rarr; <strong>API Keys</strong> tab &rarr; <strong>Create API Key</strong></li>
                    <li>Name it <code>setup</code>, set expiration to 1 hour, check <strong>Databases</strong> (all scopes), and click <strong>Create</strong>. Copy the key.</li>
                  </ol>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Paste Appwrite API Key:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="e.g. 9df78a64491763b0d..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                    />
                    <button
                      type="button"
                      onClick={handleAutoProvision}
                      disabled={isProvisioning || !apiKey.trim()}
                      className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isProvisioning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Building...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Auto-Create Everything</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Provision logs */}
                {provisionLogs.length > 0 && (
                  <div className="mt-2 p-3 bg-black/80 text-white rounded-xl text-[11px] font-mono max-h-36 overflow-y-auto space-y-1">
                    {provisionLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={
                          log.type === 'error'
                            ? 'text-red-400'
                            : log.type === 'warn'
                            ? 'text-amber-300'
                            : log.type === 'success'
                            ? 'text-emerald-400'
                            : 'text-gray-300'
                        }
                      >
                        {log.message}
                      </div>
                    ))}
                  </div>
                )}

                {provisionResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      provisionResult.success
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-200'
                    }`}
                  >
                    {provisionResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{provisionResult.message}</span>
                  </div>
                )}
              </div>

              {/* Method B: Step-by-Step Manual Walkthrough */}
              <div className="p-4 bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                    Method 2: Manual Setup in Appwrite Cloud Console
                  </h4>
                </div>

                <div className="text-xs text-[#555] dark:text-[#aaa] space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-[#1f1e1a] rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                    <p className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px]">1</span>
                      Step 1: Open Databases &amp; Create Database
                    </p>
                    <p className="pl-6 text-[11px]">
                      Open <a href="https://sgp.cloud.appwrite.io" target="_blank" rel="noreferrer" className="text-blue-600 underline">sgp.cloud.appwrite.io</a> &rarr; Click your project <strong>ngdc_bncc</strong> &rarr; Click <strong>Databases</strong> on the left menu &rarr; Click <strong>+ Create Database</strong> &rarr; Set Name to <code>NGDC Database</code> and Database ID to <code>ngdc_db</code>.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#1f1e1a] rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                    <p className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px]">2</span>
                      Step 2: Create the 2 Collections
                    </p>
                    <p className="pl-6 text-[11px]">
                      Inside database <code>ngdc_db</code>, click <strong>+ Create Collection</strong> twice:
                    </p>
                    <ul className="pl-10 list-disc text-[11px] space-y-1">
                      <li>First Collection &rarr; Name: <code>Site Settings</code>, ID: <code>site_settings</code></li>
                      <li>Second Collection &rarr; Name: <code>Cadets</code>, ID: <code>cadets</code></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#1f1e1a] rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                    <p className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px]">3</span>
                      Step 3: Enable Permissions on Both Collections
                    </p>
                    <p className="pl-6 text-[11px]">
                      Click on the collection (e.g. <code>site_settings</code> or <code>cadets</code>) &rarr; Click the <strong>Settings</strong> tab at the top &rarr; Scroll down to <strong>Permissions</strong>:
                    </p>
                    <ul className="pl-10 list-disc text-[11px] space-y-1">
                      <li>Click <strong>+ Add Role</strong> &rarr; Select <strong>Any</strong></li>
                      <li>Check all 4 boxes: <strong className="text-emerald-600">Create, Read, Update, Delete</strong></li>
                      <li>Click <strong>Update</strong> at the bottom right to save.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Collections Attribute Reference */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-[#1c1c18] dark:text-[#fcfbf7] uppercase tracking-wider text-[#7c7767]">
                  Collection Attributes Reference
                </h5>
                {APPWRITE_SETUP_GUIDE.collections.map((col) => (
                  <div key={col.id} className="p-4 bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#1c1c18] dark:text-[#fcfbf7]">{col.name}</span>
                        <span className="text-[11px] text-[#7c7767] dark:text-[#aca596] ml-2 font-mono">
                          (Collection ID: {col.id})
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                        {col.permissions}
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-40">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#cdc6b3]/40 dark:border-[#423e35] text-[#7c7767] dark:text-[#aca596]">
                            <th className="py-1 px-2">Attribute Key</th>
                            <th className="py-1 px-2">Type</th>
                            <th className="py-1 px-2">Size / Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#cdc6b3]/20 dark:divide-[#423e35]/40 font-mono">
                          {col.attributes.map((attr) => (
                            <tr key={attr.key}>
                              <td className="py-1 px-2 text-[#1c1c18] dark:text-[#fcfbf7]">{attr.key}</td>
                              <td className="py-1 px-2 text-amber-600 dark:text-amber-400">{attr.type}</td>
                              <td className="py-1 px-2 text-[#7c7767] dark:text-[#aca596]">
                                {attr.size ? `Size: ${attr.size}` : ''} {attr.required ? '(Required)' : '(Optional)'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Supabase Postgres */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>

              {supabaseStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    supabaseStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{supabaseStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSupabase}
                  disabled={testingSupabase}
                  className="japandi-btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer"
                >
                  {testingSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Supabase</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Cloudinary */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Cloudinary Cloud Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. dxyz123abc"
                  value={cloudinaryName}
                  onChange={(e) => setCloudinaryName(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Unsigned Upload Preset
                </label>
                <input
                  type="text"
                  placeholder="e.g. ngdc_bncc_preset"
                  value={cloudinaryPreset}
                  onChange={(e) => setCloudinaryPreset(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>
              {cloudinaryStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    cloudinaryStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{cloudinaryStatus.message}</span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCloudinary}
                  className="japandi-btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Cloudinary Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
