import React from 'react';
import {
  Download,
  Share2,
  Edit3,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Check,
  Eye,
  FileCode
} from 'lucide-react';

interface ExportBarProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  isEditing: boolean;
  onToggleEditMode: () => void;
  onExportPDF: () => void;
  onExportHTML: () => void;
  onOpenShareModal: () => void;
  onOpenAddCardModal: () => void;
  onReset: () => void;
  isExportingPDF?: boolean;
  exportError?: string | null;
  exportSuccess?: boolean;
  onClearError?: () => void;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  title,
  onUpdateTitle,
  isEditing,
  onToggleEditMode,
  onExportPDF,
  onExportHTML,
  onOpenShareModal,
  onOpenAddCardModal,
  onReset,
  isExportingPDF,
  exportError,
  exportSuccess,
  onClearError
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Editable Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-hidden transition px-1 py-0.5 rounded-md"
              placeholder="Dashboard Title"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
              Click title above to customize • Presentation-Grade Output
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Edit Mode Toggle */}
          <button
            onClick={onToggleEditMode}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border ${
              isEditing
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4 text-indigo-600" />}
            <span>{isEditing ? 'Done Editing' : 'Customize Cards'}</span>
          </button>

          {/* Add Card Button (visible in edit mode or always) */}
          {isEditing && (
            <button
              onClick={onOpenAddCardModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold hover:bg-indigo-100 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>+ Add Card</span>
            </button>
          )}

          {/* Export PDF */}
          <button
            onClick={onExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition hover:shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>

          {/* Export HTML */}
          <button
            onClick={onExportHTML}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-2xs transition flex items-center gap-2"
            title="Export Standalone Interactive HTML Report"
          >
            <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export HTML</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShareModal}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>Share Link</span>
          </button>

          {/* Upload New File */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Upload New Spreadsheet"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Status Feedback Banner */}
      {exportError && (
        <div className="bg-red-50 dark:bg-red-950/80 border-t border-red-200 dark:border-red-900 px-4 py-2 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span><b>PDF Export Error:</b> {exportError}</span>
          {onClearError && (
            <button onClick={onClearError} className="underline font-bold ml-2">Dismiss</button>
          )}
        </div>
      )}
      {exportSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-t border-emerald-200 dark:border-emerald-900 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span><b>PDF Generated Successfully!</b> Check your browser downloads folder.</span>
        </div>
      )}
    </div>
  );
};
