---
sidebar_position: 1
title: Architecture
---

# Architecture Overview

TradeFlow is a single-page application (SPA) built with modern web technologies. All logic runs client-side — there is no backend server.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18 | Component-based UI |
| **Build Tool** | Vite 6 | Fast dev server and production bundling |
| **Routing** | React Router DOM 6 | Client-side navigation (HashRouter) |
| **Data Layer** | Dexie.js 4 + IndexedDB | Local persistent storage |
| **State** | Dexie React Hooks (`useLiveQuery`) | Reactive data binding |
| **Charts** | Recharts | Area charts, bar charts |
| **UI Components** | shadcn/ui + Radix UI | Accessible, composable primitives |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **Icons** | Lucide React | Consistent icon set |
| **AI** | OpenAI API (direct fetch) | Chat completions with streaming |
| **Markdown** | react-markdown + @tailwindcss/typography | AI response rendering |
| **Export** | JSZip | ZIP backup creation and reading |
| **Desktop** | Electron 40 | Native app packaging |

## Application Structure

```
src/
├── main.jsx                  # Entry point, seeds database
├── App.jsx                   # Router setup (HashRouter), auth provider
├── Layout.jsx                # Sidebar navigation, page wrapper
├── db.js                     # Dexie database schema (5 versions)
├── db-seed.js                # Initial seed data
├── pages.config.js           # Page routing map
│
├── pages/
│   ├── Dashboard.jsx         # KPIs, calendar, charts
│   ├── TradeLog.jsx          # Trade CRUD, filters, export
│   ├── Accounts.jsx          # Account management
│   ├── Strategies.jsx        # Strategy management
│   ├── BulkImport.jsx        # CSV import, backup restore
│   ├── AIChat.jsx            # Jesse AI chat interface
│   └── Mentor.jsx            # Mentor mode (students + review)
│
├── stores/
│   ├── useTradeStore.js      # Trade CRUD + computed stats
│   ├── useAccountStore.js    # Account CRUD
│   ├── useStrategyStore.js   # Strategy CRUD
│   ├── useStudentStore.js    # Student CRUD (cascading delete)
│   ├── useStudentTradeStore.js    # Per-student trades + stats
│   └── useStudentStrategyStore.js # Per-student strategies
│
├── lib/
│   ├── openai.js             # OpenAI API integration
│   ├── trade-context.js      # Build trade summary for AI context
│   ├── trade-utils.js        # Duration calculation, formatting
│   ├── broker-parsers.js     # TopstepX + Tradovate CSV parsers
│   ├── image-utils.js        # Client-side image compression
│   ├── export-utils.js       # CSV + ZIP export
│   └── import-utils.js       # ZIP import (merge-only)
│
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── TradeFlowLogo.jsx     # App logo SVG
│   └── JesseIcon.jsx         # AI chat icon
│
└── index.css                 # Tailwind + custom styles
```

## Data Flow

```
User Action
    ↓
React Component (pages/)
    ↓
Store Hook (stores/)
    ↓
Dexie.js API
    ↓
IndexedDB (browser)
    ↓
useLiveQuery (reactive)
    ↓
UI Re-renders
```

All data flows through Dexie.js to IndexedDB. The `useLiveQuery` hook from `dexie-react-hooks` provides reactive queries — when data changes in IndexedDB, any component using a live query for that data automatically re-renders.

## Routing

TradeFlow uses `HashRouter` from React Router DOM. This means URLs look like `http://localhost:5173/#/TradeLog` rather than `http://localhost:5173/TradeLog`. Hash-based routing is required for:

- **Electron production builds** — which load via the `file://` protocol where the History API doesn't work
- **Static file hosting** — where there's no server to handle fallback routes

## Build Targets

| Target | Command | Output |
|--------|---------|--------|
| Web (dev) | `npm run dev` | Vite dev server on port 5173 |
| Web (prod) | `npm run build` | Static files in `dist/` |
| Desktop (dev) | `npm run electron:dev` | Vite + Electron concurrent |
| Desktop (prod) | `npm run electron:build` | Platform-specific installer in `release/` |
