import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  dashboardTitle
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mockShareUrl = `${window.location.origin}/share/dash_${Math.random().toString(36).substring(2, 9)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Share Dashboard
            </h3>
            <p className="text-xs text-slate-500">
              Read-only executive view link
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Anyone with this link can view <b>"{dashboardTitle}"</b> as a live, interactive dashboard without logging in.
        </p>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            readOnly
            value={mockShareUrl}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>
            <b>Cloud Persistence Note:</b> Share links are cached locally in MVP mode. Cloud persistent sharing requires M6 backend authentication.
          </span>
        </div>
      </div>
    </div>
  );
};
