---
title: Configuration
nav_order: 3
parent: Getting Started
---

# Configuration

TradeFlow works out of the box with zero configuration. The only optional setup is connecting an OpenAI API key for the Jesse AI assistant.

## Jesse AI (OpenAI API Key)

To use the AI trading coach, you need an OpenAI API key:

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. In TradeFlow, navigate to **Jesse AI** in the sidebar
4. Click the **gear icon** in the top-right of the chat panel
5. Paste your API key and click Save

:::info Key Storage
Your API key is stored locally in your browser's IndexedDB under the `settings` table. It is never sent anywhere except directly to OpenAI's API when you send a message. It is not stored in any file on disk or transmitted to any other server.
:::

## AI Model Selection

TradeFlow supports three OpenAI models. You can switch between them in the Jesse AI settings panel:

| Model | Best For |
|-------|----------|
| **GPT-5.2** | Default. Best balance of capability and cost for trade analysis |
| **GPT-5.2 Pro** | Deeper reasoning for complex multi-trade analysis |
| **GPT-5 Mini** | Faster responses for quick questions |

## Vite Dev Server Port

TradeFlow is configured to always run on **port 5173**. This is set in `vite.config.js`:

```javascript
server: {
  port: 5173,
  strictPort: true,
}
```

This ensures your IndexedDB data persists between sessions, since browser storage is scoped to the origin (protocol + hostname + port).

## Data Location

All TradeFlow data is stored in **IndexedDB** under the database name `TradeFlowDB`. The physical storage location depends on your browser:

- **Chrome (macOS)**: `~/Library/Application Support/Google/Chrome/Default/IndexedDB/`
- **Chrome (Windows)**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\IndexedDB\`
- **Firefox**: `~/.mozilla/firefox/<profile>/storage/default/`
- **Electron App**: Inside the app's user data directory

{: .warning }
> **Warning**
> Clearing your browser's site data will delete your TradeFlow database. Always maintain backups using the [Export & Backup]({{ site.baseurl }}/guides/export-backup) feature.

## Seed Data

On first launch, TradeFlow seeds the database with sample trades, accounts, and strategies so the dashboard isn't empty. This data can be freely modified or deleted through the UI.
