import React from 'react';
import { ColumnMeta, ColumnType, ParsedDataset } from '../types';
import {
  Calendar,
  Hash,
  Tag,
  AlignLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  IndianRupee,
  DollarSign,
  Fingerprint
} from 'lucide-react';

interface ColumnReviewTableProps {
  dataset: ParsedDataset;
  columns: ColumnMeta[];
  onUpdateColumnType: (index: number, newType: ColumnType) => void;
  onGenerateDashboard: () => void;
  onBackToPreview: () => void;
}

export const ColumnReviewTable: React.FC<ColumnReviewTableProps> = ({
  dataset,
  columns,
  onUpdateColumnType,
  onGenerateDashboard,
  onBackToPreview
}) => {
  const getTypeBadge = (type: ColumnType) => {
    switch (type) {
      case 'date':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
            <Calendar className="w-3.5 h-3.5" />
            Date
          </span>
        );
      case 'numeric':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
            <Hash className="w-3.5 h-3.5" />
            Numeric / Currency
          </span>
        );
      case 'categorical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
            <Tag className="w-3.5 h-3.5" />
            Category / Dimension
          </span>
        );
      case 'identifier':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
            <Fingerprint className="w-3.5 h-3.5" />
            Identifier / Key
          </span>
        );
      case 'text':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <AlignLeft className="w-3.5 h-3.5" />
            Free Text
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Step 2 of 3: Confirm Column Types</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Review Smart Column Type Inference
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              DashForge analyzed <b>{columns.length} columns</b>. Review the inferred types below or override any column before generating auto-charts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPreview}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
            >
              Back to Raw Data
            </button>
            <button
              onClick={onGenerateDashboard}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Executive Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Columns Grid / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Detected Column Mapping ({columns.length} Total Columns)
          </h3>
          <span className="text-xs text-slate-500">
            You can override any type using the dropdown selectors
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {columns.map((col) => (
            <div
              key={col.index}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
            >
              {/* Column Name & Samples */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                    {col.index + 1}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
                    {col.name}
                  </h4>
                  {col.hasCurrencySymbol && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                      {col.currencySymbol === '₹' ? <IndianRupee className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                      Currency ({col.currencySymbol})
                    </span>
                  )}
                </div>

                {/* Sample values preview */}
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-400">Sample Values:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {col.sampleValues.slice(0, 4).map((v, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unique count & Confidence */}
              <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <span className="block text-[11px] text-slate-400">Unique Values</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {col.uniqueCount} / {col.totalCount}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400">Inference Match</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(col.confidence * 100)}% Confidence
                  </span>
                </div>

                {/* Type Badge & Selector */}
                <div className="flex items-center gap-2">
                  <div>{getTypeBadge(col.confirmedType)}</div>

                  <select
                    value={col.confirmedType}
                    onChange={(e) => onUpdateColumnType(col.index, e.target.value as ColumnType)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="numeric">Numeric / Currency</option>
                    <option value="date">Date</option>
                    <option value="categorical">Category / Grouping</option>
                    <option value="identifier">Identifier / Key</option>
                    <option value="text">Free Text</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
