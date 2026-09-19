import React, { useEffect, useState } from 'react';
import { Cloud, Download, ExternalLink, Eye, EyeOff, LoaderCircle, Save, Upload, X } from 'lucide-react';
import { GITHUB_GIST_ID_KEY, GITHUB_GIST_TOKEN_KEY } from '../utils/gistSync';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose, onExport, onImport }) => {
  const [token, setToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<'export' | 'import' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToken(localStorage.getItem(GITHUB_GIST_TOKEN_KEY) || '');
      setGistId(localStorage.getItem(GITHUB_GIST_ID_KEY) || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveConnection = () => {
    setSaving(true);
    const normalizedToken = token.trim();
    const normalizedGistId = gistId.trim();
    if (normalizedToken) localStorage.setItem(GITHUB_GIST_TOKEN_KEY, normalizedToken);
    else localStorage.removeItem(GITHUB_GIST_TOKEN_KEY);
    if (normalizedGistId) localStorage.setItem(GITHUB_GIST_ID_KEY, normalizedGistId);
    else localStorage.removeItem(GITHUB_GIST_ID_KEY);
    setSaving(false);
  };

  const run = async (nextAction: 'export' | 'import') => {
    saveConnection();
    setAction(nextAction);
    try {
      await (nextAction === 'export' ? onExport() : onImport());
    } finally {
      setAction(null);
      setGistId(localStorage.getItem(GITHUB_GIST_ID_KEY) || '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="cloud-sync-title">
      <button className="absolute inset-0 bg-neutral-950/45" aria-label="Close cloud sync settings" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 text-white"><Cloud className="w-5 h-5" /></div>
            <div>
              <h2 id="cloud-sync-title" className="font-bold text-neutral-900">Cloud Sync</h2>
              <p className="text-xs text-neutral-500 mt-1">Manually back up or restore your portfolio with a private GitHub Gist.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-xs font-semibold text-neutral-700">
            GitHub personal access token
            <div className="relative mt-1.5">
              <input value={token} onChange={(e) => setToken(e.target.value)} type={showToken ? 'text' : 'password'} placeholder="ghp_..." autoComplete="off" className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-neutral-700" />
              <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500" aria-label={showToken ? 'Hide token' : 'Show token'}>{showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <span className="mt-1.5 block font-normal text-neutral-500">Use a classic token with <code>gist</code> scope, or a fine-grained token with Gists read/write access. Stored only in this browser.</span>
          </label>

          <label className="block text-xs font-semibold text-neutral-700">
            Gist ID <span className="font-normal text-neutral-400">(optional until your first export)</span>
            <input value={gistId} onChange={(e) => setGistId(e.target.value)} placeholder="Paste an existing Gist ID to restore across browsers" className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700" />
            {gistId.trim() && (
              <a
                href={`https://gist.github.com/${encodeURIComponent(gistId.trim())}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-medium text-indigo-700 hover:text-indigo-900 hover:underline underline-offset-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View backup on GitHub Gist
              </a>
            )}
          </label>

          <button type="button" onClick={saveConnection} disabled={saving || action !== null} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Save connection details</button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-neutral-100 pt-5">
          <button onClick={() => run('export')} disabled={action !== null} className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
            {action === 'export' ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {action === 'export' ? 'Exporting…' : 'Export to Cloud'}
          </button>
          <button onClick={() => run('import')} disabled={action !== null} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60">
            {action === 'import' ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {action === 'import' ? 'Importing…' : 'Import from Cloud'}
          </button>
        </div>
      </div>
    </div>
  );
};
