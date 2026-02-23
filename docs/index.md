---
title: Home
layout: home
nav_order: 0
nav_exclude: true
---

<div class="hero">
  <h1 class="hero-title">TradeFlow</h1>
  <p class="hero-tagline">Your personal trading journal with AI-powered insights — built for serious traders who value privacy and performance.</p>
  <div class="btn-row">
    <a href="{{ site.baseurl }}/getting-started/installation" class="btn btn-primary fs-5">Get Started</a>
    <a href="https://github.com/archReactor04/TradeFlow" class="btn fs-5">View on GitHub</a>
  </div>
  <div class="stats-row">
    <div>
      <span class="stat-value">100%</span>
      <span class="stat-label">Local Storage</span>
    </div>
    <div>
      <span class="stat-value">9+</span>
      <span class="stat-label">Features</span>
    </div>
    <div>
      <span class="stat-value">3</span>
      <span class="stat-label">Platforms</span>
    </div>
    <div>
      <span class="stat-value">$0</span>
      <span class="stat-label">Cost</span>
    </div>
  </div>
</div>

**TradeFlow** is a privacy-first trading journal that runs entirely in your browser. All data stays on your device using IndexedDB — no cloud accounts, no subscriptions, no data leaving your machine. Available as a web app or native desktop app via Electron.

---

<p class="section-heading">Features</p>

<div class="feature-grid">
  <div class="feature-card">
    <span class="card-icon">📊</span>
    <h3>Dashboard</h3>
    <p>Real-time P&amp;L, win rate, profit factor, calendar heatmap, and interactive performance charts.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">📋</span>
    <h3>Trade Log</h3>
    <p>Full CRUD with inline editing, multi-column filtering, tagging, and bulk operations including delete.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">🏦</span>
    <h3>Multiple Accounts</h3>
    <p>Track different brokers or strategies independently with per-account analytics and filtering.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">🎯</span>
    <h3>Strategies</h3>
    <p>Tag trades by your custom strategies and compare win rate, P&amp;L, and consistency across them.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">📥</span>
    <h3>Bulk Import</h3>
    <p>Import broker CSVs from TopstepX and Tradovate. Merge scale-out fills into single trades with take-profit levels.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">🤖</span>
    <h3>AI Mentor Mode</h3>
    <p>Built-in tools for trading mentors to manage students, review trades, and provide structured coaching.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">🧠</span>
    <h3>Jesse AI</h3>
    <p>Integrated AI chat powered by OpenAI that analyzes your journal data and chart images for actionable insights.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">💾</span>
    <h3>Export &amp; Backup</h3>
    <p>CSV export and full ZIP backup with one-click restore. Your data is always portable.</p>
  </div>
  <div class="feature-card">
    <span class="card-icon">🖥️</span>
    <h3>Desktop App</h3>
    <p>Native macOS, Windows, and Linux application via Electron. Runs fully offline.</p>
  </div>
</div>

---

<p class="section-heading">Documentation</p>

<div class="section-grid">
  <a href="{{ site.baseurl }}/getting-started/installation" class="section-card">
    <div class="card-body">
      <span class="card-icon">🚀</span>
      <h3>Getting Started</h3>
      <p>Installation, desktop app setup, and configuration options.</p>
    </div>
    <div class="card-footer">Read More →</div>
  </a>
  <a href="{{ site.baseurl }}/features/dashboard" class="section-card">
    <div class="card-body">
      <span class="card-icon">⚡</span>
      <h3>Features</h3>
      <p>Dashboard, Trade Log, Accounts, Strategies, AI Mentor, and more.</p>
    </div>
    <div class="card-footer">Read More →</div>
  </a>
  <a href="{{ site.baseurl }}/guides/csv-import" class="section-card">
    <div class="card-body">
      <span class="card-icon">📖</span>
      <h3>Guides</h3>
      <p>CSV import, backup/restore, and mentor setup walkthroughs.</p>
    </div>
    <div class="card-footer">Read More →</div>
  </a>
  <a href="{{ site.baseurl }}/technical/architecture" class="section-card">
    <div class="card-body">
      <span class="card-icon">🔧</span>
      <h3>Technical Reference</h3>
      <p>Architecture, data storage internals, and Electron details.</p>
    </div>
    <div class="card-footer">Read More →</div>
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

Open [http://localhost:5173](http://localhost:5173) in your browser.

![Dashboard]({{ site.baseurl }}/assets/img/dashboard.png)
