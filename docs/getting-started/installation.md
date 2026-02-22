---
title: Installation
nav_order: 1
parent: Getting Started
---

# Installation

TradeFlow is a client-side web application built with React and Vite. Getting it running takes just a few commands.

## Prerequisites

- **Node.js** version 18 or higher ([download](https://nodejs.org/))
- **npm** (included with Node.js)
- **Git** ([download](https://git-scm.com/))

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/archReactor04/TradeFlow.git
cd TradeFlow
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including React, Vite, Dexie (IndexedDB), Recharts, and the UI component library.

### 3. Start the Development Server

```bash
npm run dev
```

The app will start on **http://localhost:5173**. Open this URL in your browser.

:::tip Fixed Port
TradeFlow is configured to always use port 5173. This is important because IndexedDB (where all your data is stored) is scoped to the origin — if the port changes, you would see a fresh database.
:::

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run electron:dev` | Start in Electron development mode |
| `npm run electron:build` | Build standalone desktop application |

## Production Build

To create an optimized production build:

```bash
npm run build
```

The output goes to the `dist/` directory. You can serve it with any static file server:

```bash
npm run preview
```

## Browser Compatibility

TradeFlow works in all modern browsers that support IndexedDB:

- Chrome / Chromium (recommended)
- Firefox
- Safari
- Edge

{: .note }
> **Note**
> TradeFlow uses IndexedDB for data persistence. All your trade data, accounts, strategies, and settings are stored locally in the browser. Clearing browser data will remove your TradeFlow data — use the [Export & Backup]({{ site.baseurl }}/guides/export-backup) feature to protect your data.

## Next Steps

- [Desktop App]({{ site.baseurl }}/desktop-app) — Package TradeFlow as a standalone desktop application
- [Configuration]({{ site.baseurl }}/configuration) — Set up the AI assistant and other settings
