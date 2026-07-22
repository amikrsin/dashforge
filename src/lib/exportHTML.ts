import { ParsedDataset, ChartConfig } from '../types';

export function exportDashboardToHTML(
  dataset: ParsedDataset,
  cards: ChartConfig[],
  dashboardTitle: string
): void {
  const { columns, cleanedRows } = dataset;

  // Prepare metadata for embedding
  const embeddedColumns = columns.map(c => ({
    index: c.index,
    name: c.name,
    confirmedType: c.confirmedType,
    hasCurrencySymbol: c.hasCurrencySymbol,
    currencySymbol: c.currencySymbol,
    uniqueCount: c.uniqueCount
  }));

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(dashboardTitle)} - DashForge Executive Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen pb-12 antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Header matching DashForge Navbar -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
          D
        </div>
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            DashForge <span class="text-slate-400 font-normal">/ Executive Report</span>
          </h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Cleaned Data: <b id="row-count-badge">${cleanedRows.length}</b> Rows</span>
        </div>
        <div class="text-xs text-slate-400 font-medium hidden md:block">
          Exported ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
  </header>

  <!-- Title Banner -->
  <div class="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-5">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">${escapeHtml(dashboardTitle)}</h2>
        <p class="text-xs text-slate-500 mt-1">Interactive offline dashboard powered by DashForge engine</p>
      </div>
    </div>
  </div>

  <main class="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">

    <!-- Interactive Filters Panel -->
    <section class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          <span class="text-sm font-bold text-slate-900">Interactive Filters</span>
          <span class="text-xs text-slate-400 font-normal">(Updates KPIs, Charts & Table live)</span>
        </div>
        <button id="reset-filters-btn" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Reset Filters
        </button>
      </div>

      <div id="filter-controls-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Dynamic Filter Controls inserted via JS -->
      </div>
    </section>

    <!-- Cards Grid (KPIs & Charts) -->
    <section id="cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Dynamic KPI Tiles & Chart Cards rendered via JS -->
    </section>

    <!-- Interactive Data Table -->
    <section class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            Dataset Records
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Filtered dataset records • Click column headers to sort</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <input
              type="text"
              id="table-search-input"
              placeholder="Search in records..."
              class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            <tr id="table-header-row">
              <!-- Headers inserted via JS -->
            </tr>
          </thead>
          <tbody id="table-body-rows" class="divide-y divide-slate-100">
            <!-- Data Rows inserted via JS -->
          </tbody>
        </table>
      </div>
      <div id="table-pagination" class="flex items-center justify-between text-xs text-slate-500 pt-2">
        <!-- Pagination controls -->
      </div>
    </section>

  </main>

  <!-- Embedded Dashboard Logic & Data Script -->
  <script>
    const COLUMNS = ${JSON.stringify(embeddedColumns)};
    const RAW_ROWS = ${JSON.stringify(cleanedRows)};
    const CARDS = ${JSON.stringify(cards)};
    
    let filteredRows = [...RAW_ROWS];
    let chartInstances = {};
    let sortColumnIndex = -1;
    let sortDirection = 'asc';
    let currentPage = 1;
    const PAGE_SIZE = 25;

    // Helper: Parse Date Flexible
    function parseFlexibleDate(val) {
      if (!val) return null;
      const str = String(val).trim();
      
      // 1. DD-MMM-YYYY e.g. 22-Apr-2025
      const ddmmmyyyy = /^(\\d{1,2})[-/\\s]([A-Za-z]{3})[-/\\s](\\d{4})$/.exec(str);
      if (ddmmmyyyy) {
        const day = parseInt(ddmmmyyyy[1], 10);
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        const month = months.indexOf(ddmmmyyyy[2].toLowerCase());
        const year = parseInt(ddmmmyyyy[3], 10);
        if (month !== -1) return new Date(year, month, day);
      }

      // 2. YYYY-MM-DD
      const yyyymmdd = /^(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})$/.exec(str);
      if (yyyymmdd) {
        return new Date(parseInt(yyyymmdd[1], 10), parseInt(yyyymmdd[2], 10) - 1, parseInt(yyyymmdd[3], 10));
      }

      // 3. DD-MM-YYYY or DD/MM/YYYY
      const ddmmyyyy = /^(\\d{1,2})[-/](\\d{1,2})[-/](\\d{4})$/.exec(str);
      if (ddmmyyyy) {
        const p1 = parseInt(ddmmyyyy[1], 10);
        const p2 = parseInt(ddmmyyyy[2], 10);
        const year = parseInt(ddmmyyyy[3], 10);
        let day = p1, month = p2 - 1;
        if (p1 > 12) { day = p1; month = p2 - 1; }
        else if (p2 > 12) { day = p2; month = p1 - 1; }
        return new Date(year, month, day);
      }

      const parsed = Date.parse(str);
      if (!isNaN(parsed)) return new Date(parsed);
      return null;
    }

    // Helper: Clean Number
    function parseCleanNumber(val) {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      const clean = String(val).replace(/[^0-9.-]+/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    }

    // Formatters
    function formatValue(num, format, symbol) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      const formatted = num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      if (format === 'currency' || symbol) {
        return (symbol || '₹') + ' ' + formatted;
      }
      return formatted;
    }

    // Initialize Filter UI
    function initFilters() {
      const container = document.getElementById('filter-controls-container');
      container.innerHTML = '';

      // Date Column Filters
      const dateCols = COLUMNS.filter(c => c.confirmedType === 'date');
      dateCols.forEach(col => {
        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-1';
        wrapper.innerHTML = \`
          <label class="block text-xs font-bold text-slate-700">\${escapeHtml(col.name)} Range</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="date" id="date-min-\${col.index}" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl w-full focus:outline-none focus:border-indigo-500 bg-white" />
            <input type="date" id="date-max-\${col.index}" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl w-full focus:outline-none focus:border-indigo-500 bg-white" />
          </div>
        \`;
        container.appendChild(wrapper);
      });

      // Categorical Column Filters
      const catCols = COLUMNS.filter(c => c.confirmedType === 'categorical' && c.uniqueCount <= 50);
      catCols.forEach(col => {
        const uniqueVals = new Set();
        RAW_ROWS.forEach(r => {
          const v = r[col.index];
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            uniqueVals.add(String(v).trim());
          }
        });
        const sortedVals = Array.from(uniqueVals).sort();

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-1';
        
        let optionsHtml = '<option value="">All ' + escapeHtml(col.name) + 's</option>';
        sortedVals.forEach(v => {
          optionsHtml += '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>';
        });

        wrapper.innerHTML = \`
          <label class="block text-xs font-bold text-slate-700">\${escapeHtml(col.name)}</label>
          <select id="cat-filter-\${col.index}" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl w-full bg-white focus:outline-none focus:border-indigo-500">
            \${optionsHtml}
          </select>
        \`;
        container.appendChild(wrapper);
      });

      // Attach Event Listeners
      container.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', applyFilters);
      });

      document.getElementById('reset-filters-btn').addEventListener('click', () => {
        container.querySelectorAll('input').forEach(i => i.value = '');
        container.querySelectorAll('select').forEach(s => s.value = '');
        document.getElementById('table-search-input').value = '';
        applyFilters();
      });

      document.getElementById('table-search-input').addEventListener('input', applyFilters);
    }

    function applyFilters() {
      const searchVal = document.getElementById('table-search-input').value.toLowerCase().trim();

      filteredRows = RAW_ROWS.filter(row => {
        // Global search
        if (searchVal) {
          const matchesSearch = row.some(cell => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(searchVal));
          if (!matchesSearch) return false;
        }

        // Date Filters
        const dateCols = COLUMNS.filter(c => c.confirmedType === 'date');
        for (let col of dateCols) {
          const minEl = document.getElementById('date-min-' + col.index);
          const maxEl = document.getElementById('date-max-' + col.index);
          if (minEl && minEl.value) {
            const minD = new Date(minEl.value);
            const cellD = parseFlexibleDate(row[col.index]);
            if (cellD && cellD < minD) return false;
          }
          if (maxEl && maxEl.value) {
            const maxD = new Date(maxEl.value);
            maxD.setHours(23, 59, 59, 999);
            const cellD = parseFlexibleDate(row[col.index]);
            if (cellD && cellD > maxD) return false;
          }
        }

        // Categorical Filters
        const catCols = COLUMNS.filter(c => c.confirmedType === 'categorical' && c.uniqueCount <= 50);
        for (let col of catCols) {
          const sel = document.getElementById('cat-filter-' + col.index);
          if (sel && sel.value) {
            const cellVal = String(row[col.index] || '').trim();
            if (cellVal !== sel.value) return false;
          }
        }

        return true;
      });

      document.getElementById('row-count-badge').innerText = filteredRows.length;
      currentPage = 1;

      renderDashboardCards();
      renderTable();
    }

    // Render Cards & Charts
    function renderDashboardCards() {
      const container = document.getElementById('cards-container');
      
      // Cleanup existing Chart.js instances
      Object.values(chartInstances).forEach(inst => inst.destroy());
      chartInstances = {};

      container.innerHTML = '';

      CARDS.forEach(card => {
        if (card.type === 'kpi') {
          const tile = document.createElement('div');
          tile.className = 'bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition duration-200';
          
          let kpiVal = 0;
          const colIdx = card.kpiConfig?.numericColIndex ?? card.metricColIndex ?? 0;
          const colMeta = COLUMNS.find(c => c.index === colIdx);
          const agg = card.kpiConfig?.aggregation || card.aggregation || 'sum';

          if (agg === 'count') {
            kpiVal = filteredRows.length;
          } else {
            const nums = filteredRows.map(r => parseCleanNumber(r[colIdx])).filter(n => !isNaN(n));
            if (nums.length > 0) {
              if (agg === 'sum') kpiVal = nums.reduce((a, b) => a + b, 0);
              else if (agg === 'avg') kpiVal = nums.reduce((a, b) => a + b, 0) / nums.length;
              else if (agg === 'min') kpiVal = Math.min(...nums);
              else if (agg === 'max') kpiVal = Math.max(...nums);
            }
          }

          const fmt = card.kpiConfig?.format || (colMeta?.hasCurrencySymbol ? 'currency' : 'number');
          const currencySymbol = colMeta?.currencySymbol || (colMeta?.hasCurrencySymbol ? '₹' : '');
          const formattedText = formatValue(kpiVal, fmt, currencySymbol);

          let iconSvg = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>';
          if (agg === 'count') {
            iconSvg = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>';
          } else if (currencySymbol) {
            iconSvg = '<span class="font-bold text-sm">' + escapeHtml(currencySymbol) + '</span>';
          }

          tile.innerHTML = \`
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  \${escapeHtml(card.title)}
                </span>
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  \${iconSvg}
                </div>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 tracking-tight">
                \${formattedText}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                \${agg === 'count' ? 'Data Rows' : agg.toUpperCase() + ' Metric'}
              </span>
              <span class="text-emerald-600 font-semibold flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Cleaned Data
              </span>
            </div>
          \`;
          container.appendChild(tile);
        } else {
          // Visual Chart Card matching ChartCard.tsx
          const cardDiv = document.createElement('div');
          cardDiv.className = 'bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition duration-200';
          
          const groupIdx = card.groupByColIndex ?? 0;
          const metricIdx = card.metricColIndex ?? 0;
          const groupCol = COLUMNS.find(c => c.index === groupIdx);
          const metricCol = COLUMNS.find(c => c.index === metricIdx);
          const agg = card.aggregation || 'sum';

          const canvasId = 'chart_canvas_' + card.id;
          cardDiv.innerHTML = \`
            <div class="mb-4">
              <h3 class="font-bold text-slate-900 text-base">
                \${escapeHtml(card.title)}
              </h3>
              <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>By <b>\${escapeHtml(groupCol ? groupCol.name : 'Category')}</b></span>
                <span>•</span>
                <span>Metric: <b>\${escapeHtml(metricCol ? metricCol.name : 'Value')} (\${agg})</b></span>
              </div>
            </div>
            <div class="relative h-64 w-full">
              <canvas id="\${canvasId}"></canvas>
            </div>
          \`;
          container.appendChild(cardDiv);

          // Build Chart Data
          setTimeout(() => {
            buildAndMountChart(card, canvasId);
          }, 0);
        }
      });
    }

    function buildAndMountChart(card, canvasId) {
      const canvasEl = document.getElementById(canvasId);
      if (!canvasEl) return;

      const groupIdx = card.groupByColIndex ?? 0;
      const metricIdx = card.metricColIndex ?? 0;
      const groupCol = COLUMNS.find(c => c.index === groupIdx);
      const metricCol = COLUMNS.find(c => c.index === metricIdx);
      const agg = card.aggregation || 'sum';

      const map = new Map();

      filteredRows.forEach(row => {
        let key = row[groupIdx] !== null && row[groupIdx] !== undefined ? String(row[groupIdx]).trim() : '(Blank)';
        
        // Date formatting if group column is date
        if (groupCol && groupCol.confirmedType === 'date') {
          const d = parseFlexibleDate(key);
          if (d) {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const bucket = card.timeBucket || 'daily';
            if (bucket === 'daily') {
              key = String(d.getDate()).padStart(2, '0') + ' ' + months[d.getMonth()];
            } else if (bucket === 'yearly') {
              key = String(d.getFullYear());
            } else {
              key = months[d.getMonth()] + ' ' + d.getFullYear();
            }
          }
        }

        const numVal = parseCleanNumber(row[metricIdx]);
        if (!map.has(key)) {
          map.set(key, { count: 0, sum: 0, values: [] });
        }
        const item = map.get(key);
        item.count += 1;
        item.sum += numVal;
        item.values.push(numVal);
      });

      let items = Array.from(map.entries()).map(([k, v]) => {
        let val = v.sum;
        if (agg === 'avg') val = v.count > 0 ? v.sum / v.count : 0;
        else if (agg === 'count') val = v.count;
        return { label: k, value: val };
      });

      if (card.topN && card.topN > 0 && card.type !== 'area' && card.type !== 'line') {
        items.sort((a, b) => b.value - a.value);
        items = items.slice(0, card.topN);
      }

      const labels = items.map(i => i.label);
      const values = items.map(i => i.value);

      const ctx = canvasEl.getContext('2d');
      const palette = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#64748b'];

      let chartType = card.type === 'pie' ? 'doughnut' : (card.type === 'area' ? 'line' : card.type);

      chartInstances[card.id] = new Chart(ctx, {
        type: chartType,
        data: {
          labels: labels,
          datasets: [{
            label: metricCol ? metricCol.name : 'Value',
            data: values,
            backgroundColor: card.type === 'pie' ? palette : (card.type === 'area' ? 'rgba(79, 70, 229, 0.15)' : '#4f46e5'),
            borderColor: '#4f46e5',
            borderWidth: 2,
            fill: card.type === 'area',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: card.type === 'pie', position: 'bottom' }
          },
          scales: card.type === 'pie' ? {} : {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
          }
        }
      });
    }

    // Table Rendering & Sorting
    function renderTable() {
      const headerTr = document.getElementById('table-header-row');
      headerTr.innerHTML = '';

      COLUMNS.forEach(col => {
        const th = document.createElement('th');
        th.className = 'px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition';
        const isSorted = sortColumnIndex === col.index;
        const arrow = isSorted ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : '';
        th.innerHTML = escapeHtml(col.name) + '<span class="text-indigo-600 font-bold">' + arrow + '</span>';
        th.addEventListener('click', () => {
          if (sortColumnIndex === col.index) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            sortColumnIndex = col.index;
            sortDirection = 'asc';
          }
          sortFilteredRows();
          renderTable();
        });
        headerTr.appendChild(th);
      });

      // Rows
      const tbody = document.getElementById('table-body-rows');
      tbody.innerHTML = '';

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const paginated = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

      if (paginated.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="\${COLUMNS.length}" class="px-4 py-8 text-center text-slate-400">No matching records found.</td></tr>\`;
      } else {
        paginated.forEach(row => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-slate-50 transition';
          COLUMNS.forEach(col => {
            const td = document.createElement('td');
            td.className = 'px-4 py-2.5 whitespace-nowrap';
            const val = row[col.index];
            td.innerText = val !== null && val !== undefined ? String(val) : '-';
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
      }

      // Pagination Controls
      const paginationContainer = document.getElementById('table-pagination');
      const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1;
      paginationContainer.innerHTML = \`
        <div>Showing \${filteredRows.length > 0 ? startIndex + 1 : 0} to \${Math.min(startIndex + PAGE_SIZE, filteredRows.length)} of \${filteredRows.length} entries</div>
        <div class="flex items-center gap-2">
          <button id="prev-page-btn" \${currentPage === 1 ? 'disabled' : ''} class="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 font-medium">Prev</button>
          <span>Page <b>\${currentPage}</b> of \${totalPages}</span>
          <button id="next-page-btn" \${currentPage >= totalPages ? 'disabled' : ''} class="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 font-medium">Next</button>
        </div>
      \`;

      document.getElementById('prev-page-btn')?.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderTable(); }
      });
      document.getElementById('next-page-btn')?.addEventListener('click', () => {
        if (currentPage < totalPages) { currentPage++; renderTable(); }
      });
    }

    function sortFilteredRows() {
      if (sortColumnIndex < 0) return;
      const colMeta = COLUMNS.find(c => c.index === sortColumnIndex);
      
      filteredRows.sort((a, b) => {
        const valA = a[sortColumnIndex];
        const valB = b[sortColumnIndex];

        if (colMeta && colMeta.confirmedType === 'numeric') {
          const numA = parseCleanNumber(valA);
          const numB = parseCleanNumber(valB);
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Startup
    window.addEventListener('DOMContentLoaded', () => {
      initFilters();
      applyFilters();
    });
  </script>
</body>
</html>`;

  function escapeHtml(str: string): string {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Trigger Download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const sanitizedTitle = dashboardTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'dashboard';
  a.href = url;
  a.download = `${sanitizedTitle}_interactive_report.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
