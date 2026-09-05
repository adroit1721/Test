import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  ShieldCheck,
  Server,
  Upload,
} from 'lucide-react';
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  resetSupabaseInstance,
  SUPABASE_CADETS_SQL_SCHEMA,
  SUPABASE_SITE_SETTINGS_SQL_SCHEMA,
  fetchCadetsFromSupabase,
} from '../../utils/supabaseClient';
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
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [cloudinaryName, setCloudinaryName] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');

  const [activeTab, setActiveTab] = useState<'supabase' | 'cloudinary' | 'schema'>('supabase');
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>(
    { type: 'idle', message: '' }
  );

  const [testingCloudinary, setTestingCloudinary] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>(
    { type: 'idle', message: '' }
  );

  const [copiedSchema, setCopiedSchema] = useState(false);

  // Load existing settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const sbConfig = getSupabaseConfig();
      setSupabaseUrl(sbConfig.supabaseUrl);
      setSupabaseKey(sbConfig.supabaseAnonKey);

      const clConfig = getCloudinaryConfig();
      setCloudinaryName(clConfig.cloudName);
      setCloudinaryPreset(clConfig.uploadPreset);

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
          message:
            'Connected to Supabase endpoint, but could not query "cadets" table. Please ensure the table exists using the SQL Schema tab.',
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
    navigator.clipboard.writeText(SUPABASE_CADETS_SQL_SCHEMA);
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
              <h3 className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] text-base">Database &amp; Cloud Storage Configuration</h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                Supabase Postgres for Cadet Data &amp; Cloudinary for Image Uploads
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#7c7767] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Tab Navigation */}
        <div className="flex border-b border-[#cdc6b3]/40 dark:border-[#423e35] px-5 bg-white dark:bg-[#1a1915]">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'supabase'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Postgres DB</span>
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
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'schema'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82]'
                : 'border-transparent text-[#7c7767] dark:text-[#aca596] hover:text-[#1c1c18]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Postgres SQL Schema</span>
          </button>
        </div>
        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                <div>
                  <span className="font-bold block">Cadet Directory Database Persistence:</span>
                  Enter your Supabase Project URL and Public Anon Key. All Cadet Corner additions, edits, and deletions will synchronize automatically with your Supabase Postgres database.
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzproject.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Supabase Anon / Public API Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82] font-mono"
                />
              </div>
              {supabaseStatus.message && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  supabaseStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                    : supabaseStatus.type === 'error'
                    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
                >
                  {supabaseStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : supabaseStatus.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                  )}
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
                  <span>Save &amp; Test Supabase Connection</span>
                </button>
              </div>
            </div>
          )}
          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#f6f3ed] dark:bg-[#141411] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl text-xs text-[#695c4e] dark:text-[#aca596] flex items-start gap-2.5">
                <Cloud className="w-4 h-4 shrink-0 mt-0.5 text-[#6b5e10] dark:text-[#eedc82]" />
                <div>
                  <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">Cloudinary CDN Image Hosting:</span>
                  Uploads images directly to Cloudinary using an unsigned upload preset. Used for Cadet Profile avatars, Recruitment Header/Footer banners, and photo memories.
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Cloudinary Cloud Name</label>
                <input
                  type="text"
                  placeholder="e.g. dxyz123abc"
                  value={cloudinaryName}
                  onChange={(e) => setCloudinaryName(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Unsigned Upload Preset</label>
                <input
                  type="text"
                  placeholder="e.g. ngdc_bncc_preset"
                  value={cloudinaryPreset}
                  onChange={(e) => setCloudinaryPreset(e.target.value)}
                  className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eedc82]"
                />
                <p className="text-[10px] text-[#7c7767] dark:text-[#aca596] mt-1">
                  In Cloudinary Console &rarr; Settings &rarr; Upload &rarr; Add upload preset &rarr; set Signing Mode to <strong>Unsigned</strong>.
                </p>
              </div>
              {cloudinaryStatus.message && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                  Copy and paste this SQL into your Supabase Dashboard &rarr; SQL Editor to create the <code>cadets</code> table:
                </p>
                <button onClick={handleCopySchema} className="japandi-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-bold">
                  {copiedSchema ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-[#141411] text-[#fcfbf7] rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 border border-[#423e35]">
                {SUPABASE_CADETS_SQL_SCHEMA}
                {SUPABASE_SITE_SETTINGS_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
