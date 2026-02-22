---
title: Home
layout: home
nav_order: 0
---

# TradeFlow Documentation

Your personal trading journal with AI-powered insights — built for serious traders who value privacy and performance.
{: .fs-6 .fw-300 }

[Get Started]({{ site.baseurl }}/intro){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/archReactor04/TradeFlow){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## What is TradeFlow?

TradeFlow is a **local-first** trading journal that runs entirely in your browser. All your data stays on your device using IndexedDB — no servers, no subscriptions, no data sharing.

### Key Highlights

- **Dashboard** — Real-time P&L, win rate, calendar heatmap, and performance charts
- **Trade Log** — Full CRUD with inline editing, filtering, tagging, and bulk operations
- **Multiple Accounts** — Track different brokers or strategies independently
- **Strategies** — Tag and analyze trades by your custom strategies
- **Bulk Import** — Paste from spreadsheets or import CSV files instantly
- **AI Mentor Mode** — Get AI-powered trade analysis and coaching
- **Jesse AI Integration** — Import algo-trading results from Jesse framework
- **Export & Backup** — CSV export and full JSON backup/restore
- **Desktop App** — Runs as a native macOS/Windows/Linux app via Electron

---

## Quick Start

```bash
git clone https://github.com/archReactor04/TradeFlow.git
cd TradeFlow
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Quick Navigation

| Section | Description |
|:--------|:------------|
| [Getting Started]({{ site.baseurl }}/getting-started/installation) | Installation, desktop app setup, configuration |
| [Features]({{ site.baseurl }}/features/dashboard) | Dashboard, Trade Log, Accounts, Strategies, and more |
| [Guides]({{ site.baseurl }}/guides/csv-import) | Step-by-step CSV import, export/backup, mentor setup |
| [Technical Reference]({{ site.baseurl }}/technical/architecture) | Architecture, data storage, Electron internals |
