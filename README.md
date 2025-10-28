# Libreverse Desktop

ARCHIVED - work has started on a new desktop app that's more tightly integrated: A desktop application for connecting to Libreverse instances built with Electron.

## Features

- Connect to any Libreverse instance by entering its URL
- Recent instances list for quick access
- Clean, modern user interface
- Cross-platform support (Windows, macOS, Linux)
- Secure webview integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

## Development

To run in development mode:
```bash
npm run dev
```

## Building

To build the application for distribution:
```bash
npm run build
```

## Usage

1. Launch the application
2. Enter the URL of your Libreverse instance (e.g., `https://your-instance.com`)
3. Click "Connect" or press Enter
4. The Libreverse webapp will load in a new window
5. Recent instances are saved for quick access

## Technical Details

- Built with Electron for cross-platform desktop support
- Uses electron-store for persistent settings
- Implements security best practices for webview integration
- Handles navigation within the Libreverse instance domain
- External links open in the system's default browser

## Security

- Web security is enabled for the Libreverse instance window
- Navigation is restricted to the connected instance domain
- External links are opened in the default browser for security
