# TradeFlow

> A local-first trading journal with AI-powered insights — built for serious traders who value privacy and performance.

![Dashboard](docs/assets/img/dashboard.png)

---

## What is TradeFlow?

TradeFlow is a **privacy-first** trading journal that runs entirely in your browser. All your data is stored locally on your device using IndexedDB — no cloud accounts, no subscriptions, no data leaving your machine.

Available as a **web app** or a native **desktop app** for macOS, Windows, and Linux via Electron.

---

## Features

- **Dashboard** — Real-time P&L, win rate, profit factor, calendar heatmap, and interactive charts
- **Trade Log** — Full CRUD with inline editing, multi-column filtering, tagging, and bulk operations
- **Multiple Accounts** — Track different brokers or strategies independently with per-account analytics
- **Strategies** — Tag and compare trades by your custom strategies
- **Bulk Import** — Broker CSV import (TopstepX, Tradovate) with scale-out merge support
- **AI Mentor Mode** — AI-powered trade coaching and behavioral pattern detection
- **Jesse AI** — Integrated AI chat powered by OpenAI that analyzes your journal and chart images
- **Export & Backup** — CSV export and full ZIP backup/restore
- **Desktop App** — Native macOS, Windows, and Linux app via Electron

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

### Run locally

```bash
git clone https://github.com/archReactor04/TradeFlow.git
cd TradeFlow
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build desktop app

```bash
npm run electron:build
```

The packaged app and `.dmg`/`.exe` installer will be output to `release/`.

---

## Documentation

Full documentation is available at:

**[https://archreactor04.github.io/TradeFlow/](https://archreactor04.github.io/TradeFlow/)**

Docs are built with [Jekyll](https://jekyllrb.com/) using the [just-the-docs](https://just-the-docs.com/) theme and live in the [`docs/`](./docs) folder of this repository.

| Section | Description |
|:--------|:------------|
| [Getting Started](https://archreactor04.github.io/TradeFlow/getting-started/installation) | Installation, desktop app setup, configuration |
| [Features](https://archreactor04.github.io/TradeFlow/features/dashboard) | Dashboard, Trade Log, Accounts, Strategies, and more |
| [Guides](https://archreactor04.github.io/TradeFlow/guides/csv-import) | CSV import, export/backup, mentor setup |
| [Technical Reference](https://archreactor04.github.io/TradeFlow/technical/architecture) | Architecture, data storage, Electron internals |

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack Query |
| Database | IndexedDB via Dexie.js |
| Charts | Recharts |
| Desktop | Electron |
| AI | OpenAI API |

---

## Project Structure

```
TradeFlow/
├── src/
│   ├── pages/          # Dashboard, TradeLog, Accounts, Strategies, BulkImport, AIChat, Mentor
│   ├── components/     # Shared UI components (shadcn/ui + custom)
│   ├── stores/         # Zustand stores (trades, accounts, strategies)
│   ├── lib/            # Utilities (broker parsers, export, import, AI)
│   └── db.js           # Dexie.js IndexedDB schema
├── electron/
│   ├── main.js         # Electron main process
│   └── preload.js      # Preload script
├── docs/               # Jekyll documentation site
└── build/              # Electron app icons
```

---

## License

MIT — free to use, modify, and distribute.
