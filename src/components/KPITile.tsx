import React from 'react';
import { ChartConfig, ParsedDataset } from '../types';
import { parseNumericValue } from '../lib/inferColumnTypes';
import { TrendingUp, DollarSign, IndianRupee, Hash, Layers, Trash2, Edit2 } from 'lucide-react';

interface KPITileProps {
  card: ChartConfig;
  dataset: ParsedDataset;
  isEditing?: boolean;
  onDeleteCard?: (id: string) => void;
  onEditCard?: (card: ChartConfig) => void;
}

export const KPITile: React.FC<KPITileProps> = ({
  card,
  dataset,
  isEditing,
  onDeleteCard,
  onEditCard
}) => {
  const { kpiConfig, title } = card;
  const { cleanedRows, columns } = dataset;

  let calculatedValue = 0;
  let formattedDisplay = '0';
  let currencySymbol = '';

  if (kpiConfig) {
    const { numericColIndex, aggregation, format } = kpiConfig;

    if (numericColIndex === -1 || aggregation === 'count') {
      // Row Count
      calculatedValue = cleanedRows.length;
      formattedDisplay = calculatedValue.toLocaleString();
    } else {
      const colMeta = columns.find(c => c.index === numericColIndex);
      if (colMeta?.hasCurrencySymbol) {
        currencySymbol = colMeta.currencySymbol || '₹';
      }

      const numValues: number[] = [];
      cleanedRows.forEach(row => {
        const cell = row[numericColIndex];
        const { num } = parseNumericValue(cell);
        if (num !== null) {
          numValues.push(num);
        }
      });

      if (numValues.length > 0) {
        if (aggregation === 'sum') {
          calculatedValue = numValues.reduce((a, b) => a + b, 0);
        } else if (aggregation === 'avg') {
          calculatedValue = numValues.reduce((a, b) => a + b, 0) / numValues.length;
        } else if (aggregation === 'min') {
          calculatedValue = Math.min(...numValues);
        } else if (aggregation === 'max') {
          calculatedValue = Math.max(...numValues);
        }
      }

      // Format string
      if (format === 'currency' || currencySymbol) {
        formattedDisplay = `${currencySymbol} ${calculatedValue.toLocaleString('en-IN', {
          maximumFractionDigits: 2
        })}`;
      } else {
        formattedDisplay = calculatedValue.toLocaleString('en-IN', {
          maximumFractionDigits: 2
        });
      }
    }
  }

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Edit Overlay Controls when in Edit Mode */}
      {isEditing && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
          {onEditCard && (
            <button
              onClick={() => onEditCard(card)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
              title="Edit Card"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteCard && (
            <button
              onClick={() => onDeleteCard(card.id)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition"
              title="Delete Card"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            {kpiConfig?.aggregation === 'count' ? (
              <Hash className="w-4 h-4" />
            ) : currencySymbol ? (
              currencySymbol === '₹' ? <IndianRupee className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formattedDisplay}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {kpiConfig?.aggregation === 'count' ? 'Data Rows' : `${kpiConfig?.aggregation?.toUpperCase()} Metric`}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Cleaned Data
        </span>
      </div>
    </div>
  );
};
