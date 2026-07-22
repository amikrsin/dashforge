import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedDataset } from '../types';
import {
  detectHeaderRowIndex,
  inferColumnTypes,
  isBlankRow,
  isSummaryRow,
  cleanCellString
} from './inferColumnTypes';

export async function parseFileContent(
  fileOrContent: File | string,
  filename: string
): Promise<ParsedDataset> {
  let raw2D: any[][] = [];

  if (typeof fileOrContent === 'string') {
    // String content (e.g. sample CSV)
    const parsed = Papa.parse(fileOrContent, {
      skipEmptyLines: false,
    });
    raw2D = parsed.data as any[][];
  } else {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const text = await fileOrContent.text();
      const parsed = Papa.parse(text, { skipEmptyLines: false });
      raw2D = parsed.data as any[][];
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await fileOrContent.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      raw2D = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    } else {
      throw new Error(`Unsupported file format .${ext}. Please upload a .csv, .xlsx, or .xls file.`);
    }
  }

  if (!raw2D || raw2D.length === 0) {
    throw new Error('File appears to be empty or unreadable.');
  }

  // 1. Detect header row
  const headerRowIdx = detectHeaderRowIndex(raw2D);
  const rawHeaders = raw2D[headerRowIdx] || [];
  const headerNames = rawHeaders.map((h: any, i: number) => {
    const s = cleanCellString(h);
    return s || `Column ${i + 1}`;
  });

  // 2. Separate data rows from blank rows and summary/totals rows
  const dataRowsRaw = raw2D.slice(headerRowIdx + 1);
  const cleanedRows: any[][] = [];
  const summaryRows: { rowIndex: number; rowData: any[] }[] = [];

  let lastValidRowCell: string[] = [];

  dataRowsRaw.forEach((row, i) => {
    if (!row || isBlankRow(row)) {
      return; // skip blank rows
    }

    if (isSummaryRow(row)) {
      summaryRows.push({ rowIndex: headerRowIdx + 1 + i, rowData: row });
      return; // exclude summary totals row from chart dataset
    }

    // Forward fill merged cell artifacts if any cell is empty in a category column
    const processedRow = [...row];
    // Pad row length to match headers length
    while (processedRow.length < headerNames.length) {
      processedRow.push('');
    }

    cleanedRows.push(processedRow);
  });

  // 3. Infer column types using heuristics module
  const columns = inferColumnTypes(headerNames, cleanedRows);

  return {
    filename,
    raw2D,
    headerRowIndex: headerRowIdx,
    headerNames,
    cleanedRows,
    summaryRows,
    totalRowsCount: cleanedRows.length,
    columns
  };
}
