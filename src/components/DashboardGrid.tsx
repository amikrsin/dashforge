import React from 'react';
import { ChartConfig, ParsedDataset } from '../types';
import { KPITile } from './KPITile';
import { ChartCard } from './ChartCard';
import { ArrowUp, ArrowDown, PlusCircle, LayoutGrid } from 'lucide-react';

interface DashboardGridProps {
  cards: ChartConfig[];
  dataset: ParsedDataset;
  isEditing: boolean;
  onDeleteCard: (id: string) => void;
  onEditCard: (card: ChartConfig) => void;
  onUpdateCardType?: (id: string, newType: ChartConfig['type']) => void;
  onMoveCard: (id: string, direction: 'up' | 'down') => void;
  onOpenAddCardModal: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  cards,
  dataset,
  isEditing,
  onDeleteCard,
  onEditCard,
  onUpdateCardType,
  onMoveCard,
  onOpenAddCardModal
}) => {
  const kpiCards = cards.filter(c => c.type === 'kpi');
  const chartCards = cards.filter(c => c.type !== 'kpi');

  return (
    <div id="dashboard-export-container" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* KPI Cards Row */}
      {kpiCards.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Performance Indicators ({kpiCards.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiCards.map((card, idx) => (
              <div key={card.id} className="relative group">
                <KPITile
                  card={card}
                  dataset={dataset}
                  isEditing={isEditing}
                  onDeleteCard={onDeleteCard}
                  onEditCard={onEditCard}
                />
                {isEditing && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white p-1 rounded-lg shadow-md opacity-90 z-20 text-xs">
                    <button
                      onClick={() => onMoveCard(card.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:text-indigo-400 disabled:opacity-30"
                      title="Move Left/Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5 rotate-270" />
                    </button>
                    <button
                      onClick={() => onMoveCard(card.id, 'down')}
                      disabled={idx === kpiCards.length - 1}
                      className="p-1 hover:text-indigo-400 disabled:opacity-30"
                      title="Move Right/Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5 rotate-270" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Visualizations & Breakdown ({chartCards.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartCards.map((card, idx) => (
            <div key={card.id} className="relative group">
              <ChartCard
                card={card}
                dataset={dataset}
                isEditing={isEditing}
                onDeleteCard={onDeleteCard}
                onEditCard={onEditCard}
                onUpdateCardType={onUpdateCardType}
              />
              {isEditing && (
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-slate-900 text-white p-1 rounded-lg shadow-md opacity-90 z-20 text-xs">
                  <button
                    onClick={() => onMoveCard(card.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:text-indigo-400 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMoveCard(card.id, 'down')}
                    disabled={idx === chartCards.length - 1}
                    className="p-1 hover:text-indigo-400 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Card placeholder tile in edit mode */}
          {isEditing && (
            <button
              onClick={onOpenAddCardModal}
              className="h-72 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/30 transition group cursor-pointer"
            >
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 transition mb-2">
                <PlusCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Add Chart or KPI Card</span>
              <span className="text-xs text-slate-400 mt-1">Select dimension & metric column</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
