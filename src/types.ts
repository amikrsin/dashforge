export type ColumnType = 'date' | 'numeric' | 'categorical' | 'text' | 'identifier';

export interface ColumnMeta {
  index: number;
  originalName: string;
  name: string;
  inferredType: ColumnType;
  confirmedType: ColumnType;
  confidence: number; // 0 to 1
  sampleValues: string[];
  hasCurrencySymbol?: boolean;
  currencySymbol?: string;
  uniqueCount: number;
  totalCount: number;
  nullCount: number;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'kpi' | 'area';

export interface KPIConfig {
  numericColIndex: number;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: 'currency' | 'number' | 'percentage';
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  groupByColIndex?: number; // for categorical or date
  metricColIndex?: number;  // for numeric
  aggregation?: 'sum' | 'avg' | 'count';
  timeBucket?: 'daily' | 'monthly' | 'yearly';
  topN?: number;            // default e.g. 10
  kpiConfig?: KPIConfig;
  position: number;
}

export interface ParsedDataset {
  filename: string;
  raw2D: any[][];
  headerRowIndex: number;
  headerNames: string[];
  cleanedRows: any[][];
  summaryRows: { rowIndex: number; rowData: any[] }[];
  totalRowsCount: number;
  columns: ColumnMeta[];
}

export interface DashboardState {
  dataset: ParsedDataset | null;
  cards: ChartConfig[];
  title: string;
  isEditing: boolean;
  selectedCardId: string | null;
}
