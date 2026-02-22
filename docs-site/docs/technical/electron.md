---
sidebar_position: 3
title: Electron Desktop App
---

# Electron Desktop App

TradeFlow uses Electron to provide a standalone desktop application experience while sharing the same codebase as the web version.

## Architecture

```
electron/
├── main.js       # Main process — creates BrowserWindow
└── preload.js    # Preload script — security isolation
```

### Main Process (`electron/main.js`)

The main process:
1. Creates a `BrowserWindow` (1400x900, titled "TradeFlow")
2. In **development** — loads `http://localhost:5173` (Vite dev server)
3. In **production** — loads `dist/index.html` via the `file://` protocol
4. Handles macOS app lifecycle (keeps running when windows close)

### Security Configuration

```javascript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

- **nodeIntegration disabled** — renderer process cannot access Node.js APIs
- **contextIsolation enabled** — preload scripts run in a separate context from web content

## Build Configuration

The build is configured in `package.json`:

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

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Start Vite + Electron concurrently for development |
| `npm run electron:build` | Build production web assets, then package with electron-builder |

### How `electron:dev` Works

```bash
concurrently -k "vite" "wait-on http://localhost:5173 && NODE_ENV=development electron ."
```

1. Starts Vite dev server
2. Waits for `localhost:5173` to be available
3. Launches Electron pointing at the dev server
4. Both processes are killed together when you stop

### How `electron:build` Works

```bash
vite build && electron-builder
```

1. Vite builds the production bundle to `dist/`
2. electron-builder packages `dist/` + `electron/` into a platform installer
3. Output goes to `release/`

## Platform Outputs

| Platform | Format | File |
|----------|--------|------|
| macOS | DMG | `release/TradeFlow-1.0.0-arm64.dmg` |
| Windows | NSIS Installer | `release/TradeFlow Setup 1.0.0.exe` |
| Linux | AppImage | `release/TradeFlow-1.0.0.AppImage` |

## HashRouter Requirement

The web app uses `HashRouter` instead of `BrowserRouter` for client-side routing. This is critical for Electron because:

- Production Electron loads files via the `file://` protocol
- The `file://` protocol doesn't support the HTML5 History API
- `BrowserRouter` would cause 404 errors when navigating to any route other than `/`
- `HashRouter` encodes the route in the URL hash (`index.html#/TradeLog`), which works with any protocol

## Data Storage in Electron

The Electron app uses the same IndexedDB storage mechanism, but under a different origin than the browser version:

- **Web version**: origin is `http://localhost:5173`
- **Electron version**: origin is `file://` (managed by Chromium)

This means the two versions maintain **separate databases**. Data created in the browser won't appear in the Electron app and vice versa. Use the [Export & Backup](../guides/export-backup) feature to transfer data between them.

## Adding a Custom App Icon

1. Create icon files:
   - **macOS**: `.icns` format (1024x1024 recommended)
   - **Windows**: `.ico` format (256x256 recommended)
   - **Linux**: `.png` format (512x512 recommended)

2. Place them in a `build/` directory at the project root

3. Update `package.json`:

```json
{
  "build": {
    "mac": { "target": "dmg", "icon": "build/icon.icns" },
    "win": { "target": "nsis", "icon": "build/icon.ico" },
    "linux": { "target": "AppImage", "icon": "build/icon.png" }
  }
}
```

## Code Signing

### macOS

For distribution outside the Mac App Store:

1. Obtain an Apple Developer ID certificate
2. Set environment variables:
   ```bash
   export CSC_LINK="path/to/certificate.p12"
   export CSC_KEY_PASSWORD="certificate-password"
   ```
3. For notarization, configure `afterSign` in electron-builder

Without signing, macOS displays a Gatekeeper warning on first launch.

### Windows

For EV code signing, configure the `win.certificateFile` and `win.certificatePassword` fields in the build configuration.
