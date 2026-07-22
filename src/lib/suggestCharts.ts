import { ChartConfig, ColumnMeta, ParsedDataset } from '../types';
import { parseFlexibleDate, cleanCellString } from './inferColumnTypes';

export function generateChartSuggestions(dataset: ParsedDataset): ChartConfig[] {
  const kpiCards: ChartConfig[] = [];
  const chartCards: ChartConfig[] = [];
  const { columns, cleanedRows } = dataset;

  const dateCols = columns.filter(c => c.confirmedType === 'date');
  const numericCols = columns.filter(c => c.confirmedType === 'numeric');
  const catCols = columns.filter(c => c.confirmedType === 'categorical');

  let cardIdCounter = 1;

  // Primary numeric column (preferably total sales or highest value sum)
  const primaryNumeric = numericCols.find(c =>
    /total|sales|amount|revenue|taxable|value/i.test(c.name)
  ) || numericCols[0];

  // Secondary numeric column (e.g. tax, gst, quantity)
  const secondaryNumeric = numericCols.find(c => c.index !== primaryNumeric?.index);

  // 1. KPI Cards (up to 4 clean executive KPI tiles)
  if (primaryNumeric) {
    kpiCards.push({
      id: `card_${cardIdCounter++}`,
      title: `Total ${primaryNumeric.name}`,
      type: 'kpi',
      metricColIndex: primaryNumeric.index,
      kpiConfig: {
        numericColIndex: primaryNumeric.index,
        aggregation: 'sum',
        format: primaryNumeric.hasCurrencySymbol ? 'currency' : 'number'
      },
      position: kpiCards.length
    });

    kpiCards.push({
      id: `card_${cardIdCounter++}`,
      title: `Average ${primaryNumeric.name}`,
      type: 'kpi',
      metricColIndex: primaryNumeric.index,
      kpiConfig: {
        numericColIndex: primaryNumeric.index,
        aggregation: 'avg',
        format: primaryNumeric.hasCurrencySymbol ? 'currency' : 'number'
      },
      position: kpiCards.length
    });
  }

  // Row Count KPI
  kpiCards.push({
    id: `card_${cardIdCounter++}`,
    title: 'Total Transactions / Invoices',
    type: 'kpi',
    kpiConfig: {
      numericColIndex: -1,
      aggregation: 'count',
      format: 'number'
    },
    position: kpiCards.length
  });

  if (secondaryNumeric) {
    kpiCards.push({
      id: `card_${cardIdCounter++}`,
      title: `Total ${secondaryNumeric.name}`,
      type: 'kpi',
      metricColIndex: secondaryNumeric.index,
      kpiConfig: {
        numericColIndex: secondaryNumeric.index,
        aggregation: 'sum',
        format: secondaryNumeric.hasCurrencySymbol ? 'currency' : 'number'
      },
      position: kpiCards.length
    });
  }

  // 2. Time-Series Line / Area Chart
  if (dateCols.length > 0 && primaryNumeric) {
    const dateCol = dateCols[0];

    // Compute date range across dataset
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    cleanedRows.forEach(row => {
      const rawVal = row[dateCol.index];
      if (rawVal) {
        const d = parseFlexibleDate(cleanCellString(rawVal));
        if (d) {
          if (!minDate || d.getTime() < minDate.getTime()) minDate = d;
          if (!maxDate || d.getTime() > maxDate.getTime()) maxDate = d;
        }
      }
    });

    let timeBucket: 'daily' | 'monthly' = 'daily';
    if (minDate && maxDate) {
      const diffDays = Math.abs(maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
      timeBucket = diffDays <= 60 ? 'daily' : 'monthly';
    }

    chartCards.push({
      id: `card_${cardIdCounter++}`,
      title: `${primaryNumeric.name} Trend over Time`,
      type: 'area',
      groupByColIndex: dateCol.index,
      metricColIndex: primaryNumeric.index,
      aggregation: 'sum',
      timeBucket,
      position: chartCards.length
    });
  }

  // 3. Category Top-N Bar Chart
  const primaryCat = catCols.find(c =>
    /customer|vendor|client|zone|region|category|status|product/i.test(c.name)
  ) || catCols[0];

  if (primaryCat && primaryNumeric) {
    chartCards.push({
      id: `card_${cardIdCounter++}`,
      title: `Top ${primaryCat.name}s by ${primaryNumeric.name}`,
      type: 'bar',
      groupByColIndex: primaryCat.index,
      metricColIndex: primaryNumeric.index,
      aggregation: 'sum',
      topN: 8,
      position: chartCards.length
    });
  }

  // 4. Donut / Pie Charts for ALL Categorical columns with <= 8 unique values (e.g. Category, Payment Status, Region)
  const smallCatCols = catCols.filter(c => c.uniqueCount > 1 && c.uniqueCount <= 8);

  for (const cat of smallCatCols) {
    if (chartCards.length >= 6) break;

    // Add pie chart if one doesn't exist for this column yet
    const alreadyExists = chartCards.some(c => c.type === 'pie' && c.groupByColIndex === cat.index);
    if (!alreadyExists && primaryNumeric) {
      chartCards.push({
        id: `card_${cardIdCounter++}`,
        title: `${primaryNumeric.name} Share by ${cat.name}`,
        type: 'pie',
        groupByColIndex: cat.index,
        metricColIndex: primaryNumeric.index,
        aggregation: 'sum',
        position: chartCards.length
      });
    }
  }

  // Cap initial auto suggestions to 4 KPI tiles and up to 6 visual chart cards
  return [...kpiCards.slice(0, 4), ...chartCards.slice(0, 6)];
}

