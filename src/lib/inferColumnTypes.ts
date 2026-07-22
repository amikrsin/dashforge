import { ColumnMeta, ColumnType } from '../types';

// Helper to clean string values
export function cleanCellString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

// Detect header row index from first 10 rows
export function detectHeaderRowIndex(raw2D: any[][]): number {
  if (!raw2D || raw2D.length === 0) return 0;
  const maxRowsToScan = Math.min(10, raw2D.length);

  let bestRowIndex = 0;
  let bestScore = -1;

  for (let r = 0; r < maxRowsToScan; r++) {
    const row = raw2D[r];
    if (!row || row.length === 0) continue;

    let nonNumCount = 0;
    let nonFilledCount = 0;
    let textCells = 0;

    for (let c = 0; c < row.length; c++) {
      const cell = cleanCellString(row[c]);
      if (cell !== '') {
        nonFilledCount++;
        // check if cell is pure number
        const isNum = !isNaN(Number(cell.replace(/[\$,₹\s]/g, '')));
        if (!isNum) {
          textCells++;
        }
      }
    }

    // Header row usually has mostly non-numeric string labels and high cell density
    const score = textCells * 2 + nonFilledCount;
    if (score > bestScore) {
      bestScore = score;
      bestRowIndex = r;
    }
  }

  return bestRowIndex;
}

// Check if a row is a summary / total row at the bottom
export function isSummaryRow(row: any[]): boolean {
  if (!row || row.length === 0) return false;
  const firstFew = row.slice(0, 3).map(c => cleanCellString(c).toLowerCase()).join(' ');
  const keywords = ['total', 'grand total', 'summary', 'subtotal', 'balance c/f', 'total / grand summary'];
  return keywords.some(kw => firstFew.includes(kw));
}

// Check if a row is essentially blank (>70% empty)
export function isBlankRow(row: any[]): boolean {
  if (!row || row.length === 0) return true;
  let filled = 0;
  for (const cell of row) {
    if (cleanCellString(cell) !== '') filled++;
  }
  return (filled / row.length) < 0.25;
}

// Multi-format date parser helper
export function parseFlexibleDate(val: string): Date | null {
  if (!val) return null;
  const cleaned = val.trim();

  // 1. DD-MMM-YYYY e.g. 22-Apr-2025 or 15/Apr/2025
  const ddmmmyyyy = /^(\d{1,2})[-/\s]([A-Za-z]{3})[-/\s](\d{4})$/.exec(cleaned);
  if (ddmmmyyyy) {
    const day = parseInt(ddmmmyyyy[1], 10);
    const year = parseInt(ddmmmyyyy[3], 10);
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthIdx = months.indexOf(ddmmmyyyy[2].toLowerCase());
    if (monthIdx !== -1) {
      const d = new Date(year, monthIdx, day);
      if (d.getFullYear() === year) return d;
    }
  }

  // 2. YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(cleaned);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year) return d;
  }

  // 3. Common Indian / European / Standard formats: DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(cleaned);
  if (ddmmyyyy) {
    const p1 = parseInt(ddmmyyyy[1], 10);
    const p2 = parseInt(ddmmyyyy[2], 10);
    const year = parseInt(ddmmyyyy[3], 10);

    // Default to DD/MM/YYYY for standard business datasets (or handle MM/DD if p1 > 12)
    let day = p1;
    let month = p2 - 1;
    if (p1 > 12) {
      day = p1;
      month = p2 - 1;
    } else if (p2 > 12) {
      day = p2;
      month = p1 - 1;
    }

    if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month, day);
      if (d.getFullYear() === year) return d;
    }
  }

  // 4. Fallback to standard Date.parse
  const direct = Date.parse(cleaned);
  if (!isNaN(direct)) {
    const d = new Date(direct);
    if (d.getFullYear() > 1900 && d.getFullYear() < 2100) return d;
  }

  return null;
}

// Clean currency / number value from text like "₹ 1,45,000.00" or "$ 1200.00"
export function parseNumericValue(val: any): { num: number | null; symbol?: string } {
  if (val === null || val === undefined || val === '') return { num: null };
  const str = String(val).trim();

  let symbol: string | undefined = undefined;
  if (str.includes('₹')) symbol = '₹';
  else if (str.includes('$')) symbol = '$';
  else if (str.includes('€')) symbol = '€';
  else if (str.includes('£')) symbol = '£';

  // If string contains letters (e.g. INV-1001, REF-99, ABC123), it is NOT a pure number
  if (/[a-zA-Z]/.test(str)) {
    return { num: null };
  }

  // Strip non-numeric characters except minus, period, and numbers
  const cleaned = str.replace(/[^0-9.-]/g, '');
  if (cleaned === '' || cleaned === '-') return { num: null };

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return { num: null };

  return { num: parsed, symbol };
}

// Main inference logic per column
export function inferColumnTypes(
  headers: string[],
  rows: any[][]
): ColumnMeta[] {
  const colCount = headers.length;
  const metas: ColumnMeta[] = [];

  for (let c = 0; c < colCount; c++) {
    const origName = headers[c] || `Column ${c + 1}`;
    const colName = origName.trim();
    const colNameLower = colName.toLowerCase();

    const sampleVals: string[] = [];
    let dateMatchCount = 0;
    let numericMatchCount = 0;
    let alphaCodeMatchCount = 0;
    let digitMatchCount = 0;
    let detectedCurrency: string | undefined = undefined;
    const uniqueVals = new Set<string>();
    let totalNonEmpty = 0;
    let nullCount = 0;

    for (let r = 0; r < rows.length; r++) {
      const rawCell = rows[r]?.[c];
      const cellStr = cleanCellString(rawCell);

      if (cellStr === '') {
        nullCount++;
        continue;
      }

      totalNonEmpty++;
      uniqueVals.add(cellStr.toLowerCase());
      if (sampleVals.length < 8) {
        sampleVals.push(cellStr);
      }

      if (/\d/.test(cellStr)) {
        digitMatchCount++;
      }

      // Check if value is alphanumeric code like INV-1001, REF_2025, 27AABCA1234F1ZB
      if (/[a-zA-Z]+.*[0-9]+|[0-9]+.*[a-zA-Z]+/.test(cellStr)) {
        alphaCodeMatchCount++;
      }

      // Check date match
      const dateObj = parseFlexibleDate(cellStr);
      if (dateObj) {
        dateMatchCount++;
      }

      // Check numeric match
      const { num, symbol } = parseNumericValue(cellStr);
      if (num !== null) {
        numericMatchCount++;
        if (symbol && !detectedCurrency) {
          detectedCurrency = symbol;
        }
      }
    }

    const dateRatio = totalNonEmpty > 0 ? dateMatchCount / totalNonEmpty : 0;
    const numericRatio = totalNonEmpty > 0 ? numericMatchCount / totalNonEmpty : 0;
    const uniqueRatio = totalNonEmpty > 0 ? uniqueVals.size / totalNonEmpty : 0;
    const alphaCodeRatio = totalNonEmpty > 0 ? alphaCodeMatchCount / totalNonEmpty : 0;
    const digitRatio = totalNonEmpty > 0 ? digitMatchCount / totalNonEmpty : 0;

    // Name hints for ID / Invoice / Code / PAN / GSTIN / SKU / Ref
    const isIdentifierName =
      /\b(inv|invoice|id|code|gstin|pan|sku|ref|reference|uuid|serial|token|receipt|order_id|tx_id|txn)\b/i.test(colNameLower) ||
      /invoice\s*(no|num|number)?|order\s*(no|num|number)?|ref\s*(no|num|number)?|id\s*(no|num|number)?|serial\s*(no|num|number)?/i.test(colNameLower);

    const isFinancialMetricName =
      /amount|sales|total|revenue|price|cost|tax|rate|fee|margin|discount|balance|paid|due|value|sum/i.test(colNameLower);

    let inferred: ColumnType = 'categorical';
    let confidence = 0.5;

    // Priority Heuristics:
    // 1. Date: >70% parse success
    if (dateRatio >= 0.7) {
      inferred = 'date';
      confidence = Math.min(1.0, dateRatio + 0.1);
    }
    // 2. Numeric: >80% numeric parse (plain numbers with no letters default to numeric/currency)
    else if (numericRatio >= 0.8) {
      inferred = 'numeric';
      confidence = Math.min(1.0, numericRatio + 0.1);
    }
    // 3. Identifier: Alphanumeric code or explicit ID column with non-numeric/code values
    else if (
      // Case A: Alphanumeric prefix/code (e.g. INV-1001, REF-99) with decent uniqueness
      (alphaCodeRatio >= 0.4 && uniqueRatio >= 0.4) ||
      // Case B: Column name explicitly suggests Identifier (Invoice No, ID, Code, SKU, Ref) AND non-numeric/code content
      (isIdentifierName && (alphaCodeRatio > 0 || uniqueRatio >= 0.4)) ||
      // Case C: High unique ratio (near 1:1) with non-numeric codes, and NOT a financial metric
      (uniqueRatio >= 0.85 && totalNonEmpty >= 3 && !detectedCurrency && !isFinancialMetricName)
    ) {
      inferred = 'identifier';
      confidence = 0.95;
    }
    // 4. Category: unique ratio < 0.5 or small number of unique items
    else if (uniqueVals.size <= 25 || uniqueRatio < 0.5) {
      inferred = 'categorical';
      confidence = 0.85;
    }
    // 5. Fallback text
    else {
      inferred = 'text';
      confidence = 0.7;
    }

    metas.push({
      index: c,
      originalName: origName,
      name: colName,
      inferredType: inferred,
      confirmedType: inferred,
      confidence: parseFloat(confidence.toFixed(2)),
      sampleValues: sampleVals,
      hasCurrencySymbol: !!detectedCurrency,
      currencySymbol: detectedCurrency,
      uniqueCount: uniqueVals.size,
      totalCount: totalNonEmpty,
      nullCount
    });
  }

  return metas;
}
