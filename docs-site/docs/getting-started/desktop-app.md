---
title: Desktop App
nav_order: 2
parent: Getting Started
---

# Desktop Application

TradeFlow can be packaged as a standalone desktop application using Electron. This gives you a native app experience without needing a browser.

## Development Mode

To run TradeFlow as a desktop app during development:

```bash
npm run electron:dev
```

This starts the Vite dev server and launches Electron pointing at `http://localhost:5173`. Hot module replacement works normally.

## Building for Production

### macOS (.dmg)

```bash
npm run electron:build
```

This runs `vite build` followed by `electron-builder`. The output is a `.dmg` installer at:

```
release/TradeFlow-1.0.0-arm64.dmg
```

To build for a specific macOS architecture:

```bash
# Apple Silicon (M1/M2/M3)
npx electron-builder --mac --arm64

# Intel
npx electron-builder --mac --x64
```

### Windows (.exe)

On a Windows machine (or via cross-compilation):

```bash
npx electron-builder --win
```

Produces an NSIS installer at `release/TradeFlow Setup 1.0.0.exe`.

### Linux (.AppImage)

```bash
npx electron-builder --linux
```

Produces an AppImage at `release/TradeFlow-1.0.0.AppImage`.

## Build Configuration

The Electron build is configured in `package.json` under the `"build"` key:

```json
{
  "build": {
    "appId": "com.tradeflow.app",
    "productName": "TradeFlow",
    "files": ["dist/**/*", "electron/**/*"],
    "directories": { "output": "release" },
    "mac": { "target": "dmg" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

## How It Works

The Electron app loads the same production build (`dist/index.html`) that the web version uses. The app uses `HashRouter` for client-side routing, which ensures navigation works correctly with the `file://` protocol that Electron uses in production.

- **Main Process**: `electron/main.js` — creates the browser window
- **Preload Script**: `electron/preload.js` — security isolation layer
- **Security**: `nodeIntegration` is disabled and `contextIsolation` is enabled

:::info Data Sharing
The desktop app uses the same IndexedDB storage as the browser version. If you run both the web and Electron versions on the same machine, they maintain separate databases since they operate under different origins (`http://localhost:5173` vs `file://`).
:::

## Custom App Icon

To use a custom application icon, add your icon files and update `package.json`:

```json
{
  "build": {
    "mac": {
      "target": "dmg",
      "icon": "build/icon.icns"
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    }
  }
}
```

## Code Signing and Notarization

For distribution, macOS apps should be code-signed and notarized:

1. Obtain an Apple Developer certificate
2. Set the `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables
3. Configure notarization in `electron-builder` settings

Without signing, macOS will show a Gatekeeper warning when users first open the app.
