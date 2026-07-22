import React, { useState } from 'react';
import { ChartConfig, ChartType, ColumnMeta, ParsedDataset } from '../types';
import { X, Check, BarChart3, LineChart, PieChart, TrendingUp, PlusCircle } from 'lucide-react';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ParsedDataset;
  initialCard?: ChartConfig | null;
  onSaveCard: (card: ChartConfig) => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  dataset,
  initialCard,
  onSaveCard
}) => {
  const { columns } = dataset;

  const dateCols = columns.filter(c => c.confirmedType === 'date');
  const numericCols = columns.filter(c => c.confirmedType === 'numeric');
  const catCols = columns.filter(c => c.confirmedType === 'categorical' || c.confirmedType === 'date' || c.confirmedType === 'text');

  const [title, setTitle] = useState(initialCard?.title || '');
  const [type, setType] = useState<ChartType>(initialCard?.type || 'bar');
  const [groupByColIndex, setGroupByColIndex] = useState<number>(
    initialCard?.groupByColIndex ?? (catCols[0]?.index ?? 0)
  );
  const [metricColIndex, setMetricColIndex] = useState<number>(
    initialCard?.metricColIndex ?? (numericCols[0]?.index ?? 0)
  );
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>(
    initialCard?.aggregation || 'sum'
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for this card.');
      return;
    }

    const newCard: ChartConfig = {
      id: initialCard?.id || `card_${Date.now()}`,
      title,
      type,
      groupByColIndex: type === 'kpi' ? undefined : groupByColIndex,
      metricColIndex: metricColIndex,
      aggregation,
      kpiConfig: type === 'kpi' ? {
        numericColIndex: metricColIndex,
        aggregation,
        format: columns.find(c => c.index === metricColIndex)?.hasCurrencySymbol ? 'currency' : 'number'
      } : undefined,
      position: initialCard?.position ?? 99
    };

    onSaveCard(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
          {initialCard ? 'Edit Dashboard Card' : 'Add New Dashboard Card'}
        </h3>

        <div className="space-y-4 text-sm">
          {/* Card Title */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Card Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Regional Sales Summary"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          {/* Chart Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Visual Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'kpi', label: 'KPI Tile', icon: TrendingUp },
                { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
                { id: 'area', label: 'Trend Line', icon: LineChart },
                { id: 'pie', label: 'Donut / Pie', icon: PieChart }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as ChartType)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grouping Dimension (Not for KPI) */}
          {type !== 'kpi' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Group By (Dimension Column)
              </label>
              <select
                value={groupByColIndex}
                onChange={(e) => setGroupByColIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                {columns.map((c) => (
                  <option key={c.index} value={c.index}>
                    {c.name} ({c.confirmedType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Metric Column */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Metric Value Column
            </label>
            <select
              value={metricColIndex}
              onChange={(e) => setMetricColIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              {numericCols.map((c) => (
                <option key={c.index} value={c.index}>
                  {c.name}
                </option>
              ))}
              <option value={-1}>[ Row Count ]</option>
            </select>
          </div>

          {/* Aggregation */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aggregation Method
            </label>
            <div className="flex gap-3">
              {(['sum', 'avg', 'count'] as const).map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase">
                  <input
                    type="radio"
                    name="agg"
                    checked={aggregation === method}
                    onChange={() => setAggregation(method)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{method === 'sum' ? 'Sum / Total' : method === 'avg' ? 'Average' : 'Count'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
