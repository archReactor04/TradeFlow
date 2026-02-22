---
title: Welcome to TradeFlow
nav_order: 1
---

# TradeFlow

**TradeFlow** is a powerful, privacy-first trading journal and analytics platform designed for active traders in stocks, futures, and options markets. It runs entirely in your browser (or as a standalone desktop app) with all data stored locally on your device — no cloud accounts, no subscriptions, no data leaving your machine.

## What TradeFlow Does

TradeFlow helps you **log, analyze, and improve** your trading performance through:

- **Comprehensive Trade Logging** — Record every trade with full details: entry/exit prices, position sizes, P&L, fees, commissions, tags, strategies, take-profit levels, and chart screenshots.
- **Visual Analytics Dashboard** — Interactive charts, calendar heatmaps, KPI cards, and strategy breakdowns that reveal patterns in your trading.
- **AI-Powered Insights (Jesse AI)** — An integrated AI trading coach powered by OpenAI that analyzes your journal data and chart images, identifies behavioral patterns, and provides actionable feedback.
- **Broker CSV Import** — Bulk import trades from TopstepX and Tradovate with automatic position reconstruction and P&L calculation.
- **Mentor Mode** — Built-in tools for trading mentors to manage students, review their trades, and provide structured coaching.
- **Export and Backup** — Full data portability with CSV exports and ZIP database snapshots that can be restored to any TradeFlow instance.

## Key Highlights

- **100% Local Storage** — All data lives in your browser's IndexedDB. Nothing is sent to any server (except your optional OpenAI API calls).
- **Desktop App** — Available as a native desktop application for macOS, Windows, and Linux via Electron.
- **Open Source** — Fully open source. Inspect the code, contribute, or self-host.
- **Zero Configuration** — Works out of the box. Just `npm install` and `npm run dev`.

## Quick Start

```bash
git clone https://github.com/archReactor04/TradeFlow.git
cd TradeFlow
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Screenshots

![Dashboard]({{ site.baseurl }}/assets/img/dashboard.png)

*The Dashboard provides an at-a-glance view of your trading performance with KPI cards, a calendar heatmap, and interactive charts.*

## Next Steps

- [Installation Guide]({{ site.baseurl }}/getting-started/installation) — Detailed setup instructions
- [Features Overview]({{ site.baseurl }}/features/dashboard) — Explore all features
- [Desktop App]({{ site.baseurl }}/getting-started/desktop-app) — Build a standalone app for macOS/Windows/Linux
