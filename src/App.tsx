import React, { useState } from 'react';
import { ColumnMeta, ColumnType, ParsedDataset, ChartConfig } from './types';
import { parseFileContent } from './lib/parseFile';
import { generateChartSuggestions } from './lib/suggestCharts';
import { exportDashboardToPDF } from './lib/exportPDF';
import { exportDashboardToHTML } from './lib/exportHTML';
import { UploadZone } from './components/UploadZone';
import { RawPreviewTable } from './components/RawPreviewTable';
import { ColumnReviewTable } from './components/ColumnReviewTable';
import { ExportBar } from './components/ExportBar';
import { DashboardGrid } from './components/DashboardGrid';
import { CardEditorModal } from './components/CardEditorModal';
import { ShareModal } from './components/ShareModal';
import { Sparkles, CheckCircle2, Circle, FileText, BarChart2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'upload' | 'raw_preview' | 'review' | 'dashboard'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [cards, setCards] = useState<ChartConfig[]>([]);
  const [dashboardTitle, setDashboardTitle] = useState<string>('Executive Sales & Revenue Dashboard');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<ChartConfig | null>(null);

  // 1. Handle File Upload or Sample Data load
  const handleFileSelected = async (fileOrContent: File | string, filename: string) => {
    setIsLoading(true);
    setParseError(null);
    try {
      const parsed = await parseFileContent(fileOrContent, filename);
      setDataset(parsed);
      setColumns(parsed.columns);
      setDashboardTitle(`${parsed.filename.replace(/\.[^/.]+$/, '')} Dashboard`);
      setStep('raw_preview');
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse file.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Column Type Override
  const handleUpdateColumnType = (index: number, newType: ColumnType) => {
    setColumns(prev =>
      prev.map(c => (c.index === index ? { ...c, confirmedType: newType } : c))
    );
  };

  // 3. Generate Dashboard Charts
  const handleGenerateDashboard = () => {
    if (!dataset) return;
    const updatedDataset: ParsedDataset = {
      ...dataset,
      columns: columns
    };
    setDataset(updatedDataset);
    const suggestedCards = generateChartSuggestions(updatedDataset);
    setCards(suggestedCards);
    setStep('dashboard');
  };

  // 4. Card Editing / Deleting / Reordering (M4)
  const handleDeleteCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  const handleUpdateCardType = (id: string, newType: ChartConfig['type']) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, type: newType } : c)));
  };

  const handleOpenEditCard = (card: ChartConfig) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleOpenAddCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (card: ChartConfig) => {
    setCards(prev => {
      const exists = prev.some(c => c.id === card.id);
      if (exists) {
        return prev.map(c => (c.id === card.id ? card : c));
      } else {
        return [...prev, card];
      }
    });
  };

  const handleMoveCard = (id: string, direction: 'up' | 'down') => {
    setCards(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // 5. PDF & HTML Export (M5)
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      await exportDashboardToPDF('dashboard-export-container', dashboardTitle);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      setExportError(err?.message || 'Failed to export PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportHTML = () => {
    if (!dataset) return;
    try {
      exportDashboardToHTML(dataset, cards, dashboardTitle);
    } catch (err: any) {
      console.error('HTML Export Error:', err);
      setExportError(err?.message || 'Failed to export HTML report.');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setDataset(null);
    setColumns([]);
    setCards([]);
    setIsEditing(false);
  };

  // Milestone Step Indicator
  const milestones = [
    { key: 'upload', name: 'Upload & Parse', num: '1' },
    { key: 'raw_preview', name: 'Raw Data Preview', num: '1.5' },
    { key: 'review', name: 'Inference & Type UI', num: '2' },
    { key: 'dashboard', name: 'Auto-Render & Edit', num: '3' },
  ];

  const getStepIndex = (s: string) => {
    if (s === 'upload') return 0;
    if (s === 'raw_preview') return 1;
    if (s === 'review') return 2;
    if (s === 'dashboard') return 3;
    return 0;
  };

  const currentStepIdx = getStepIndex(step);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div>
        {/* Top Professional Navigation Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
              D
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              DashForge <span className="text-slate-400 font-normal">/ Generator</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 py-5">
                Builder Workspace
              </span>
              <span onClick={handleReset} className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer py-5 transition">
                Reset Upload
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                AI
              </div>
            </div>
          </div>
        </header>

        {/* Milestone Progress Banner */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-2.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6 whitespace-nowrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Milestone Flow:
              </span>
              {milestones.map((m, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={m.key} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                        isPassed
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isPassed ? '✓' : m.num}
                    </div>
                    <span
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isPassed
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {m.name}
                    </span>
                    {idx < milestones.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-700 ml-1">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <main className="pb-16">
          {step === 'upload' && (
            <UploadZone
              onFileSelected={handleFileSelected}
              isLoading={isLoading}
              error={parseError}
            />
          )}

          {step === 'raw_preview' && dataset && (
            <RawPreviewTable
              dataset={dataset}
              onProceedToReview={() => setStep('review')}
              onReset={handleReset}
            />
          )}

          {step === 'review' && dataset && (
            <ColumnReviewTable
              dataset={dataset}
              columns={columns}
              onUpdateColumnType={handleUpdateColumnType}
              onGenerateDashboard={handleGenerateDashboard}
              onBackToPreview={() => setStep('raw_preview')}
            />
          )}

          {step === 'dashboard' && dataset && (
            <>
              <ExportBar
                title={dashboardTitle}
                onUpdateTitle={setDashboardTitle}
                isEditing={isEditing}
                onToggleEditMode={() => setIsEditing(!isEditing)}
                onExportPDF={handleExportPDF}
                onExportHTML={handleExportHTML}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onOpenAddCardModal={handleOpenAddCard}
                onReset={handleReset}
                isExportingPDF={isExportingPDF}
                exportError={exportError}
                exportSuccess={exportSuccess}
                onClearError={() => setExportError(null)}
              />

              <DashboardGrid
                cards={cards}
                dataset={dataset}
                isEditing={isEditing}
                onDeleteCard={handleDeleteCard}
                onEditCard={handleOpenEditCard}
                onUpdateCardType={handleUpdateCardType}
                onMoveCard={handleMoveCard}
                onOpenAddCardModal={handleOpenAddCard}
              />

              <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                dashboardTitle={dashboardTitle}
              />

              {isCardModalOpen && (
                <CardEditorModal
                  isOpen={isCardModalOpen}
                  onClose={() => setIsCardModalOpen(false)}
                  dataset={dataset}
                  initialCard={editingCard}
                  onSaveCard={handleSaveCard}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Professional Status Bar (Footer) */}
      <footer className="h-8 bg-slate-900 text-slate-400 text-[10px] font-mono px-4 sm:px-8 flex items-center justify-between shrink-0 border-t border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <span>SESSION: DASH_ENGINE_READY</span>
          <span className="hidden sm:inline">PARSER: PAPAPARSE_V5.3 / SHEETJS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-300 font-semibold">SYSTEM READY</span>
        </div>
      </footer>
    </div>
  );
}

