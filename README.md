# DashForge

### Turn messy spreadsheets into decision-ready dashboards — no BI tooling required.

DashForge is a self-serve, browser-based tool that converts raw CSV/Excel exports — the kind of messy, inconsistent files that come out of Tally, ERP systems, and GST reports — into clean executive dashboards. It auto-detects column types, tolerates common real-world messiness, and generates KPI tiles and charts automatically, with full manual editing and export to PDF and interactive HTML.

Built for business owners, ops managers, and merchandisers who need a boardroom-ready dashboard without spreadsheet expertise, an IT ticket, or a BI team.

<!-- 
![DashForge screenshot](./docs/screenshot-dashboard.png)
Add a screenshot of the Builder Workspace here once available.
-->

---

## ✨ Features

- **Drag-and-drop upload** — accepts `.csv`, `.xlsx`, `.xls`, parsed entirely client-side (your data never leaves the browser unless you explicitly save it)
- **Smart column detection** — automatically infers Date, Numeric/Currency, Identifier/Key, and Category/Dimension types, with a review step to override any detection
- **Handles real-world messy data**:
  - Title/metadata rows above the real header
  - Blank rows and blank cells mid-record
  - Mixed date formats (`DD-MM-YYYY`, `DD/MM/YYYY`, `DD-Mon-YYYY`)
  - Currency symbols and thousands separators (₹, $, comma/decimal variants)
  - Trailing summary/total rows (auto-isolated, excluded from chart data)
  - Inconsistent text casing in category columns
- **Auto-generated dashboard** — KPI tiles (Total, Average, Count) plus suggested charts: time-series trend, Top-N bar chart, and donut/pie breakdowns for low-cardinality categorical columns
- **Editable dashboard** — reorder cards, switch chart type in place (bar ↔ line ↔ donut) without losing the underlying data binding, add/remove cards manually
- **Export options**:
  - PDF export (presentation-ready, page-break aware)
  - Interactive HTML export — a single self-contained file with live filters, sortable table, and charts that work fully offline
  - Shareable read-only link
- **Save & reload** — lightweight auth to revisit past dashboards

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts / Chart.js |
| File Parsing | PapaParse (CSV), SheetJS/xlsx (Excel) |
| Hosting | Cloudflare Pages |
| Backend/API | Cloudflare Workers |
| Database | Cloudflare D1 (or Supabase Postgres) |
| File/Object Storage | Cloudflare R2 |
| Auth | Supabase Auth (magic link / Google OAuth) |
| PDF Export | Client-side (html2canvas + jsPDF) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Cloudflare account (for deployment) and/or Supabase project (for auth + saved dashboards) — optional for local dev, the core upload → dashboard flow works fully offline

### Local Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/dashforge.git
cd dashforge

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173` (or whichever port Vite assigns).

### Environment Variables

Create a `.env.local` file for optional backend features (auth, save/share):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=your_cloudflare_worker_url
```

### Deployment

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

## 📁 Project Structure

```
/src
  /components
    UploadZone.jsx
    ColumnReviewTable.jsx
    DashboardGrid.jsx
    ChartCard.jsx
    KPITile.jsx
    ExportBar.jsx
    ShareModal.jsx
  /lib
    parseFile.js
    inferColumnTypes.js
    suggestCharts.js
    exportPDF.js
    exportHTML.js
    api.js
  /state
    dashboardStore.js
  /pages
    Home.jsx
    DashboardEditor.jsx
    SharedDashboardView.jsx
```

## 🧪 Try It Out

Sample messy datasets are included in [`/samples`](./samples) for testing the parsing and inference engine:
- `sample_messy_sales_export.csv` — GST-style sales export (₹, mixed date formats, blank rows, trailing totals)
- `sample_messy_vendor_purchase_export.csv` — vendor purchase ledger ($, inconsistent category casing, negative adjustment rows, missing cells)

## 🗺️ Roadmap

- [ ] Natural language query bar ("show me top 5 vendors by spend")
- [ ] Multi-file merge/join on a common key
- [ ] Google Sheets live connection with scheduled refresh
- [ ] Team workspaces with shared dashboards
- [ ] Custom branding/white-label export

## 🤝 Contributing

Issues and pull requests are welcome. If you're adding a new column-type heuristic or chart suggestion rule, please include a sample messy CSV that demonstrates the case you're fixing.

## 📄 License

<!-- Choose one, e.g. MIT -->
MIT License — see [LICENSE](./LICENSE) for details.
