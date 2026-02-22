---
title: Home
layout: home
nav_order: 0
---

<div class="hero" markdown="1">

# TradeFlow

<p class="tagline">Your personal trading journal with AI-powered insights — built for serious traders who value privacy and performance.</p>

<div class="btn-row">
<a href="{{ site.baseurl }}/intro" class="btn btn-primary fs-5">Get Started</a>
<a href="https://github.com/archReactor04/TradeFlow" class="btn btn-outline fs-5">View on GitHub</a>
</div>

<div class="stats-row">
<div class="stat">
<span class="stat-value">100%</span>
<span class="stat-label">Local Storage</span>
</div>
<div class="stat">
<span class="stat-value">9+</span>
<span class="stat-label">Features</span>
</div>
<div class="stat">
<span class="stat-value">3</span>
<span class="stat-label">Platforms</span>
</div>
<div class="stat">
<span class="stat-value">$0</span>
<span class="stat-label">Cost</span>
</div>
</div>

</div>

## What is TradeFlow?

TradeFlow is a **local-first** trading journal that runs entirely in your browser. All your data stays on your device using IndexedDB — no servers, no subscriptions, no data sharing. Available as a web app or native desktop app via Electron.

---

<h2 class="section-heading">Features</h2>

<div class="feature-grid">

<div class="feature-card">
<span class="card-icon">📊</span>
<h3>Dashboard</h3>
<p>Real-time P&L, win rate, profit factor, calendar heatmap, and interactive performance charts.</p>
</div>

<div class="feature-card">
<span class="card-icon">📋</span>
<h3>Trade Log</h3>
<p>Full CRUD with inline editing, multi-column filtering, tagging, and bulk operations.</p>
</div>

<div class="feature-card">
<span class="card-icon">🏦</span>
<h3>Multiple Accounts</h3>
<p>Track different brokers or strategies independently with per-account analytics.</p>
</div>

<div class="feature-card">
<span class="card-icon">🎯</span>
<h3>Strategies</h3>
<p>Tag and analyze trades by your custom strategies. Compare performance across approaches.</p>
</div>

<div class="feature-card">
<span class="card-icon">📥</span>
<h3>Bulk Import</h3>
<p>Paste from spreadsheets or import CSV files from TopstepX and Tradovate instantly.</p>
</div>

<div class="feature-card">
<span class="card-icon">🤖</span>
<h3>AI Mentor Mode</h3>
<p>Get AI-powered trade analysis, coaching feedback, and behavioral pattern detection.</p>
</div>

<div class="feature-card">
<span class="card-icon">🧠</span>
<h3>Jesse AI</h3>
<p>Integrated AI chat powered by OpenAI that analyzes your journal and chart images.</p>
</div>

<div class="feature-card">
<span class="card-icon">💾</span>
<h3>Export & Backup</h3>
<p>CSV export and full JSON/ZIP backup with one-click restore to any TradeFlow instance.</p>
</div>

<div class="feature-card">
<span class="card-icon">🖥️</span>
<h3>Desktop App</h3>
<p>Runs as a native macOS, Windows, and Linux application via Electron.</p>
</div>

</div>

---

<h2 class="section-heading">Documentation</h2>

<div class="section-grid">

<a href="{{ site.baseurl }}/getting-started/installation" class="section-card">
<span class="card-icon">🚀</span>
<h3>Getting Started</h3>
<p>Installation, desktop app setup, and configuration options.</p>
</a>

<a href="{{ site.baseurl }}/features/dashboard" class="section-card">
<span class="card-icon">⚡</span>
<h3>Features</h3>
<p>Dashboard, Trade Log, Accounts, Strategies, AI Mentor, and more.</p>
</a>

<a href="{{ site.baseurl }}/guides/csv-import" class="section-card">
<span class="card-icon">📖</span>
<h3>Guides</h3>
<p>Step-by-step walkthroughs for CSV import, backup, and mentor setup.</p>
</a>

<a href="{{ site.baseurl }}/technical/architecture" class="section-card">
<span class="card-icon">🔧</span>
<h3>Technical Reference</h3>
<p>Architecture overview, data storage internals, and Electron details.</p>
</a>

</div>

---

## Quick Start

```bash
git clone https://github.com/archReactor04/TradeFlow.git
cd TradeFlow
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

![Dashboard]({{ site.baseurl }}/assets/img/dashboard.png)
