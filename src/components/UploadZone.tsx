import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { SAMPLE_MESSY_GST_CSV } from '../lib/sampleData';

interface UploadZoneProps {
  onFileSelected: (fileOrContent: File | string, filename: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  isLoading,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const validExts = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      alert('Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) spreadsheet.');
      return;
    }
    onFileSelected(file, file.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = () => {
    onFileSelected(SAMPLE_MESSY_GST_CSV, 'GST_Sales_Register_FY25-26_MessySample.csv');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-200/60 dark:border-indigo-800/60 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Zero-Setup Spreadsheet to Executive Dashboard</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Turn Messy Spreadsheets into <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
            Boardroom-Ready Dashboards
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Drop any CSV or Excel file. DashForge automatically handles multi-row headers, blank lines, currency symbols, and mixed dates to craft presentation-grade visual insights in seconds.
        </p>
      </div>

      {/* Main Drag-and-Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 shadow-sm bg-white dark:bg-slate-900 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
            : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Parsing & Cleansing Spreadsheet...
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Detecting headers, stripping currency symbols, and inferring column data types
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Drag and drop your spreadsheet here
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Supports <span className="font-semibold text-slate-700 dark:text-slate-300">CSV, XLSX, XLS</span> files up to 20,000 rows. Data stays 100% private inside your browser.
            </p>

            <button
              type="button"
              className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm hover:shadow-indigo-500/25 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Browse Computer File
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="font-semibold">Parsing Error</p>
            <p className="mt-0.5 text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Demo Sample Data Shortcut Box */}
      <div className="mt-8 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mt-0.5">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                No file ready right now?
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Messy Real-World Export
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Try our realistic <b>GST Sales Register</b> sample file featuring title rows, mixed dates, ₹ & $ currency symbols, commas, blank rows, and a trailing total row.
            </p>
          </div>
        </div>

        <button
          onClick={handleSampleClick}
          disabled={isLoading}
          className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition shadow-xs flex items-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 text-indigo-500 group-hover:rotate-12 transition-transform" />
          Load Demo GST Dataset
        </button>
      </div>

      {/* Trust badging & features */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-600 dark:text-slate-400 text-xs text-center border-t border-slate-200/80 dark:border-slate-800/80 pt-8">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span><b>100% Private</b> — Runs in client browser</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span><b>Smart Cleansing</b> — Auto-skips summary totals</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span><b>PDF & Share</b> — Executive boardroom output</span>
        </div>
      </div>
    </div>
  );
};
