import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { ChartConfig, ParsedDataset } from '../types';
import { parseNumericValue, parseFlexibleDate, cleanCellString } from '../lib/inferColumnTypes';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Trash2, Edit2, Move, ArrowUpDown } from 'lucide-react';

interface ChartCardProps {
  card: ChartConfig;
  dataset: ParsedDataset;
  isEditing?: boolean;
  onDeleteCard?: (id: string) => void;
  onEditCard?: (card: ChartConfig) => void;
  onUpdateCardType?: (id: string, newType: ChartConfig['type']) => void;
}

// Executive color palette for presentation-grade visuals
const PALETTE = [
  '#4f46e5', // indigo-600
  '#0d9488', // teal-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#8b5cf6', // violet-600
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#ea580c'  // orange-600
];

export const ChartCard: React.FC<ChartCardProps> = ({
  card,
  dataset,
  isEditing,
  onDeleteCard,
  onEditCard,
  onUpdateCardType
}) => {
  const { title, type, groupByColIndex, metricColIndex, aggregation = 'sum', topN = 10 } = card;
  const { cleanedRows, columns } = dataset;

  const groupByCol = groupByColIndex !== undefined ? columns.find(c => c.index === groupByColIndex) : undefined;
  const metricCol = metricColIndex !== undefined ? columns.find(c => c.index === metricColIndex) : undefined;

  const currencySymbol = metricCol?.currencySymbol || '';

  // Process and aggregate dataset for charting
  const processData = () => {
    if (groupByColIndex === undefined || metricColIndex === undefined) return [];

    const groupMap = new Map<string, { sum: number; count: number; dateObj?: Date }>();

    cleanedRows.forEach(row => {
      const groupRaw = row[groupByColIndex];
      const metricRaw = row[metricColIndex];

      let key = cleanCellString(groupRaw);

      if (!key) key = '(Blank / Unspecified)';

      // If grouping by date, format date nicely
      let dateObj: Date | undefined = undefined;
      if (groupByCol?.confirmedType === 'date') {
        const d = parseFlexibleDate(key);
        if (d) {
          dateObj = d;
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          
          let bucket = card.timeBucket;
          if (!bucket) {
            bucket = 'daily';
          }

          if (bucket === 'daily') {
            const dayStr = String(d.getDate()).padStart(2, '0');
            key = `${dayStr} ${months[d.getMonth()]}`;
          } else if (bucket === 'yearly') {
            key = `${d.getFullYear()}`;
          } else {
            key = `${months[d.getMonth()]} ${d.getFullYear()}`;
          }
        }
      }

      const { num } = parseNumericValue(metricRaw);
      const val = num !== null ? num : 0;

      if (!groupMap.has(key)) {
        groupMap.set(key, { sum: 0, count: 0, dateObj });
      }

      const existing = groupMap.get(key)!;
      existing.sum += val;
      existing.count += 1;
    });

    let result = Array.from(groupMap.entries()).map(([name, stats]) => {
      const value = aggregation === 'avg' ? stats.sum / stats.count : stats.sum;
      return {
        name,
        value: parseFloat(value.toFixed(2)),
        count: stats.count,
        dateObj: stats.dateObj
      };
    });

    // Sort appropriately
    if (groupByCol?.confirmedType === 'date') {
      result.sort((a, b) => {
        if (a.dateObj && b.dateObj) return a.dateObj.getTime() - b.dateObj.getTime();
        return a.name.localeCompare(b.name);
      });
    } else {
      // Sort by metric descending
      result.sort((a, b) => b.value - a.value);
      if (topN && result.length > topN) {
        result = result.slice(0, topN);
      }
    }

    return result;
  };

  const chartData = processData();

  // Value Formatter helper
  const formatValue = (val: number) => {
    if (currencySymbol) {
      return `${currencySymbol} ${val.toLocaleString('en-IN')}`;
    }
    return val.toLocaleString('en-IN');
  };

  const handleTypeSwitch = (newType: ChartConfig['type']) => {
    if (onUpdateCardType) {
      onUpdateCardType(card.id, newType);
    } else if (onEditCard) {
      onEditCard({ ...card, type: newType });
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Card Header with Title, Spec & Chart Type Switcher */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>By <b>{groupByCol?.name || 'Category'}</b></span>
              <span>•</span>
              <span>Metric: <b>{metricCol?.name || 'Value'} ({aggregation})</b></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Chart Type Switcher Pills */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleTypeSwitch('bar')}
                className={`p-1 rounded-md transition ${
                  type === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Switch to Bar Chart"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTypeSwitch('area')}
                className={`p-1 rounded-md transition ${
                  type === 'area' || type === 'line'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Switch to Trend Line / Area Chart"
              >
                <LineIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTypeSwitch('pie')}
                className={`p-1 rounded-md transition ${
                  type === 'pie'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Switch to Donut / Pie Chart"
              >
                <PieIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Edit / Delete Buttons when in Edit Mode */}
            {isEditing && (
              <div className="flex items-center gap-1">
                {onEditCard && (
                  <button
                    onClick={() => onEditCard(card)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    title="Edit Card Configuration"
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
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 mt-2">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
            <span>No numeric data available for this chart configuration</span>
          </div>
        ) : type === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [formatValue(Number(val)), metricCol?.name || 'Value']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : type === 'line' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [formatValue(Number(val)), metricCol?.name || 'Value']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : type === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id={`grad_${card.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [formatValue(Number(val)), metricCol?.name || 'Value']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#grad_${card.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : type === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={4}
                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [formatValue(Number(val)), metricCol?.name || 'Value']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
};
