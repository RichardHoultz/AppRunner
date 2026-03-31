# AppRunner

A React Native (Expo) iOS/iPadOS app that runs fullscreen web views — configurable locally or via remote JSON config. Supports scheduled screenshot upload for remote monitoring.

## Features

- **Fullscreen WebView** — runs any URL edge-to-edge on iPhone or iPad
- **URL Management** — add, edit, remove, and switch between named URLs
- **Remote Config** — optionally fetch URL list from a JSON endpoint
- **Screenshot Monitoring** — optionally capture and POST screenshots to a server on a configurable interval
- **Persistent Settings** — all config survives app restarts via AsyncStorage
- **Dark UI** — iOS-style dark settings screen

## Getting Started (Windows / no Mac)

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Expo Go](https://expo.dev/go) on your iPhone/iPad (for testing on device)
- A [Codemagic](https://codemagic.io) account connected to this GitHub repo (for building the IPA)
- An Apple Developer account (required for App Store / TestFlight distribution)

### Run locally for web/browser preview

```bash
npm install
npm run web
```

### Test on device (no Mac needed)

1. Install Expo Go on your iPhone or iPad
2. Run `npm start`
3. Scan the QR code with the Camera app (iOS) or Expo Go

### Build IPA via Codemagic

1. Connect this GitHub repo to Codemagic
2. Configure your **Apple Developer** credentials in Codemagic (App Store Connect API key)
3. Push to `main` — Codemagic will automatically run `codemagic.yaml` and deliver to TestFlight

## Remote Config JSON Format

Host a JSON file at any public URL and enter it in Settings → Remote Config:

```json
{
  "urls": [
    { "id": "1", "name": "Dashboard", "url": "https://example.com/dashboard" },
    { "id": "2", "name": "Status", "url": "https://example.com/status" }
  ],
  "screenshotServerUrl": "https://example.com/upload",
  "screenshotIntervalSeconds": 60,
  "screenshotEnabled": true
}
```

## Screenshot Upload

The app POSTs a `multipart/form-data` request with:

| Field | Value |
|-------|-------|
| `screenshot` | JPEG image file |
| `timestamp` | ISO 8601 datetime |
| `device` | `"AppRunner"` |

## Project Structure

```
AppRunner/
├── App.tsx                     # Entry point
├── app.json                    # Expo config
├── codemagic.yaml              # CI/CD build pipeline
├── src/
│   ├── types/index.ts          # Shared TypeScript types
│   ├── store/useAppStore.ts    # Zustand state store
│   ├── services/
│   │   ├── configService.ts    # Remote config fetcher
│   │   └── screenshotService.ts# Screenshot capture & upload
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Stack navigator
│   └── screens/
│       ├── BrowserScreen.tsx   # Fullscreen WebView
│       └── ConfigScreen.tsx    # Settings UI
```
