import React, { useState } from 'react';
import { ParsedDataset } from '../types';
import { Table, CheckCircle2, AlertTriangle, ArrowRight, Layers, FileSpreadsheet } from 'lucide-react';

interface RawPreviewTableProps {
  dataset: ParsedDataset;
  onProceedToReview: () => void;
  onReset: () => void;
}

export const RawPreviewTable: React.FC<RawPreviewTableProps> = ({
  dataset,
  onProceedToReview,
  onReset
}) => {
  const [previewLimit, setPreviewLimit] = useState(10);
  const { filename, headerRowIndex, headerNames, cleanedRows, summaryRows, totalRowsCount, raw2D } = dataset;

  const displayRows = cleanedRows.slice(0, previewLimit);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {/* Header Notification Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Parsed Successfully
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                {filename}
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Parsed <b>{totalRowsCount}</b> clean data rows across <b>{headerNames.length}</b> columns.
              {headerRowIndex > 0 && (
                <span className="ml-1 text-indigo-600 dark:text-indigo-400 font-medium">
                  Auto-skipped top {headerRowIndex} metadata/title row(s).
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
            >
              Upload Different File
            </button>
            <button
              onClick={onProceedToReview}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
              <span>Review Detected Columns</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Intelligence stats pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Detected Header Row</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Row #{headerRowIndex + 1} ({headerNames.length} column headers)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Clean Data Rows</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {totalRowsCount} valid transactions
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Excluded Totals / Blank Rows</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {summaryRows.length} summary total row(s) isolated
            </span>
          </div>
        </div>
      </div>

      {/* Raw Data Preview Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Raw Data Preview Table (Showing first {displayRows.length} of {totalRowsCount} rows)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show rows:</span>
            <select
              value={previewLimit}
              onChange={(e) => setPreviewLimit(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 font-semibold text-slate-400 dark:text-slate-500 w-12 text-center border-r border-slate-200 dark:border-slate-700">
                  #
                </th>
                {headerNames.map((col, idx) => (
                  <th
                    key={idx}
                    className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {displayRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 text-center bg-slate-50/50 dark:bg-slate-800/20 border-r border-slate-200 dark:border-slate-800">
                    {rIdx + 1}
                  </td>
                  {headerNames.map((_, cIdx) => (
                    <td
                      key={cIdx}
                      className="py-2.5 px-4 whitespace-nowrap border-r border-slate-100 dark:border-slate-800/50"
                    >
                      {row[cIdx] !== undefined && row[cIdx] !== '' ? (
                        String(row[cIdx])
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 italic">null</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summaryRows.length > 0 && (
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                <b>Isolated Summary Row:</b> Found "{summaryRows[0].rowData.filter(Boolean).slice(0, 2).join(' ')}" at bottom of file. This totals row was automatically excluded from charts so sums remain accurate.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
