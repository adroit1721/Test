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
  getAppwriteConfig,
  isAppwriteConfigured,
  resetAppwriteInstance,
  APPWRITE_SETUP_GUIDE,
  fetchCadetsFromAppwrite,
  fetchSiteSettingsFromAppwrite,
} from '../../utils/appwriteClient';
import { testAppwriteSetup, syncLocalToAppwrite, MigrationProgress } from '../../utils/migrationService';
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
  const [appwriteProjectId, setAppwriteProjectId] = useState('');
  const [appwriteProjectName, setAppwriteProjectName] = useState('ngdc_bncc');
  const [appwriteDatabaseId, setAppwriteDatabaseId] = useState('ngdc_db');
  const [appwriteSettingsCol, setAppwriteSettingsCol] = useState('site_settings');
  const [appwriteCadetsCol, setAppwriteCadetsCol] = useState('cadets');
  const [testingAppwrite, setTestingAppwrite] = useState(false);
  const [appwriteStatus, setAppwriteStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Automated Provisioning States
  const [apiKey, setApiKey] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionLogs, setProvisionLogs] = useState<ProvisionLog[]>([]);
  const [provisionResult, setProvisionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync / Backup States
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<MigrationProgress | null>(null);

  // Cloudinary States
  const [cloudinaryName, setCloudinaryName] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const [activeTab, setActiveTab] = useState<'appwrite' | 'appwrite_guide' | 'cloudinary' | 'sync'>('appwrite');

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

      const clConfig = getCloudinaryConfig();
      setCloudinaryName(clConfig.cloudName);
      setCloudinaryPreset(clConfig.uploadPreset);

      if (isAppwriteConfigured()) {
        setAppwriteStatus({
          type: 'success',
          message: `Appwrite Cloud configured (Project: ${awConfig.projectId})`,
        });
      }

      setCloudinaryStatus({
        type: isCloudinaryConfigured() ? 'success' : 'idle',
        message: isCloudinaryConfigured() ? 'Cloudinary credentials detected.' : 'Using local fallback mode.',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAppwrite = async () => {
    await upsertSetting('ngdc_appwrite_endpoint', appwriteEndpoint.trim());
    await upsertSetting('ngdc_appwrite_project_id', appwriteProjectId.trim());
    await upsertSetting('ngdc_appwrite_project_name', appwriteProjectName.trim());
    await upsertSetting('ngdc_appwrite_database_id', appwriteDatabaseId.trim());
    await upsertSetting('ngdc_appwrite_settings_col', appwriteSettingsCol.trim());
    await upsertSetting('ngdc_appwrite_cadets_col', appwriteCadetsCol.trim());
    resetAppwriteInstance();

    setTestingAppwrite(true);
    setAppwriteStatus({ type: 'idle', message: 'Verifying Appwrite Cloud setup...' });
    try {
      const test = await testAppwriteSetup();
      if (test.connected && test.databaseFound && test.cadetsColFound) {
        setAppwriteStatus({
          type: 'success',
          message: `Connected successfully! Database "${appwriteDatabaseId}" and collections are online.`,
        });
        if (onSyncCadets) onSyncCadets();
      } else {
        setAppwriteStatus({
          type: 'error',
          message: test.error || 'Connected to Appwrite endpoint, but database or collections are missing.',
        });
      }
    } catch (err: any) {
      setAppwriteStatus({ type: 'error', message: err?.message || 'Appwrite connection failed.' });
    } finally {
      setTestingAppwrite(false);
    }
  };

  const handleAutoProvision = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your Appwrite API Key with full scopes.');
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

  const handleStartSync = async () => {
    setSyncing(true);
    setSyncProgress({
      stage: 'checking',
      message: 'Starting backup/sync to Appwrite Cloud...',
      settingsTotal: 0,
      settingsProcessed: 0,
      cadetsTotal: 0,
      cadetsProcessed: 0,
    });

    try {
      const success = await syncLocalToAppwrite((progress) => {
        setSyncProgress(progress);
      });

      if (success) {
        if (onSyncCadets) onSyncCadets();
      }
    } catch (err: any) {
      setSyncProgress({
        stage: 'error',
        message: 'Sync process encountered an error.',
        errorDetails: err?.message || String(err),
        settingsTotal: 0,
        settingsProcessed: 0,
        cadetsTotal: 0,
        cadetsProcessed: 0,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveCloudinary = async () => {
    await upsertSetting('ngdc_cloudinary_cloud_name', cloudinaryName.trim());
    await upsertSetting('ngdc_cloudinary_upload_preset', cloudinaryPreset.trim());
    setCloudinaryStatus({ type: 'success', message: 'Cloudinary credentials saved!' });
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
              <h3 className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] text-base">Database &amp; Cloud Storage</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                Appwrite Cloud Database &amp; Cloudinary CDN
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
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'sync'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Sync &amp; Backup</span>
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
            <span>Schema Guide</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Appwrite Endpoint
                  </label>
                  <input
                    type="text"
                    value={appwriteEndpoint}
                    onChange={(e) => setAppwriteEndpoint(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6a9fb005002b81b05e45"
                    value={appwriteProjectId}
                    onChange={(e) => setAppwriteProjectId(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Database ID
                  </label>
                  <input
                    type="text"
                    value={appwriteDatabaseId}
                    onChange={(e) => setAppwriteDatabaseId(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Settings Collection ID
                  </label>
                  <input
                    type="text"
                    value={appwriteSettingsCol}
                    onChange={(e) => setAppwriteSettingsCol(e.target.value)}
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
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
                    className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                </div>
              </div>

              {appwriteStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    appwriteStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{appwriteStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAppwrite}
                  disabled={testingAppwrite}
                  className="japandi-btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer"
                >
                  {testingAppwrite ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Test &amp; Save Appwrite</span>
                </button>
              </div>

              {/* Automated Provisioning Section */}
              <div className="mt-6 pt-5 border-t border-[#cdc6b3]/30 dark:border-[#423e35]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                    Auto-Provision Database &amp; Attributes
                  </span>
                </div>
                <p className="text-[11px] text-[#7c7767] dark:text-[#aca596] mb-3">
                  Have an Appwrite API key? Automatically create the database, collections, attributes, and public permissions.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter Appwrite API Key (Secret Key with full scopes)..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                  />
                  <button
                    type="button"
                    onClick={handleAutoProvision}
                    disabled={isProvisioning || !apiKey.trim()}
                    className="japandi-btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProvisioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{isProvisioning ? 'Provisioning...' : 'Provision Now'}</span>
                  </button>
                </div>

                {provisionLogs.length > 0 && (
                  <div className="mt-3 p-3 bg-black/90 text-green-400 font-mono text-[11px] rounded-xl max-h-40 overflow-y-auto space-y-1">
                    {provisionLogs.map((log, idx) => (
                      <div key={idx} className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-300' : ''}>
                        {log.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Sync & Backup */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Appwrite Cloud Live Synchronization</span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-300">
                  Cadets and site settings automatically synchronize to Appwrite Cloud in real time. Use this tool to force a complete re-sync or backup of all records.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#252420] border border-[#cdc6b3]/40 dark:border-[#423e35] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Push Local Data to Appwrite</h4>
                    <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
                      Uploads local cadet roster and portal configuration to Appwrite Cloud.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartSync}
                    disabled={syncing}
                    className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>

                {syncProgress && (
                  <div className="p-3 bg-[#f6f3ed] dark:bg-[#1f1e1a] rounded-xl text-xs space-y-2 border border-[#cdc6b3]/30">
                    <p className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">{syncProgress.message}</p>
                    {syncProgress.errorDetails && (
                      <p className="text-red-500 font-mono text-[11px]">{syncProgress.errorDetails}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Appwrite Schema Guide */}
          {activeTab === 'appwrite_guide' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-bold">Appwrite Cloud Setup Instructions</p>
                  <p>Follow these quick steps in your Appwrite Cloud Console to set up permissions and collections.</p>
                </div>
              </div>

              <div className="space-y-3">
                {APPWRITE_SETUP_GUIDE.collections.map((col) => (
                  <div key={col.id} className="p-3.5 bg-white dark:bg-[#252420] border border-[#cdc6b3]/40 dark:border-[#423e35] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1c1c18] dark:text-[#fcfbf7]">
                        Collection: <code className="text-amber-600">{col.id}</code> ({col.name})
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                        Permissions: Any (Read/Create/Update/Delete)
                      </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="border-b border-[#cdc6b3]/20 text-[#7c7767]">
                            <th className="py-1">Attribute Key</th>
                            <th className="py-1">Type</th>
                            <th className="py-1">Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {col.attributes.map((attr) => (
                            <tr key={attr.key} className="border-b border-[#cdc6b3]/10">
                              <td className="py-0.5 font-mono text-amber-700 dark:text-amber-300">{attr.key}</td>
                              <td className="py-0.5 text-[#7c7767]">{attr.type}</td>
                              <td className="py-0.5 text-[#7c7767]">{attr.size || '-'}</td>
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

          {/* TAB 4: Cloudinary */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Cloudinary Cloud Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. dxyz123ab"
                  value={cloudinaryName}
                  onChange={(e) => setCloudinaryName(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Upload Preset (Unsigned)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ngdc_unsigned_preset"
                  value={cloudinaryPreset}
                  onChange={(e) => setCloudinaryPreset(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>

              {cloudinaryStatus.message && (
                <div className="p-3 rounded-xl text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2">
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
                  <span>Save Cloudinary</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
