# Fully Automated Auto-Update System

This document explains the fully automated update system in Libreverse Desktop.

## Overview

The app features a completely automated update system using `electron-updater`. Updates are checked, downloaded, and installed automatically without any user interaction or prompts. Users are never interrupted or asked to make decisions about updates.

## Features

- **Fully automated update checking** on app startup and periodically
- **Silent background downloads** with no user prompts
- **Automatic installation** on next app restart
- **Focus-based update checking** when app regains focus
- **Minimal UI indicators** (optional, very subtle)
- **Zero user interaction required**
- **Cross-platform support** (Windows, macOS, Linux)

## How It Works

### 1. Update Detection
- Checks for updates 3 seconds after app startup
- Rechecks every hour automatically  
- Additional check when app regains focus (throttled to 30-minute intervals)
- All checking happens silently in the background

### 2. Download Process
- When an update is available, download starts automatically
- No user prompts or confirmation dialogs
- Downloads happen in background without interrupting app usage
- Optional subtle progress indicator (can be disabled)

### 3. Installation Process
- Updates install automatically when the app is next restarted
- No user interaction required
- App automatically restarts with new version
- Previous version is safely replaced

## User Experience

### What Users See
- **App startup**: Normal app startup, no update prompts
- **Update available**: App continues working normally, download happens silently
- **Download progress**: Optional tiny progress indicator in footer (very subtle)
- **Update ready**: Optional brief notification that update will install on restart
- **Next restart**: App starts with new version automatically

### What Users Don't See
- No update available dialogs
- No download confirmation prompts  
- No restart/install prompts
- No interruptions to workflow
- No update-related buttons or controls

## Setup Requirements

### 1. GitHub Repository Setup

1. Create a GitHub repository for your app (if not already done)
2. Update the `publish` configuration in `package.json`:
   ```json
   "publish": {
     "provider": "github",
     "owner": "your-github-username",
     "repo": "libreverse-desktop"
   }
   ```

### 2. GitHub Token Setup

For publishing updates, you'll need a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Set the token as an environment variable:
   ```bash
   export GH_TOKEN="your-github-token"
   ```

### 3. Code Signing (Recommended)

For production apps, especially on macOS and Windows, code signing is recommended:

#### macOS:
- Set up Apple Developer certificates
- Configure signing in `package.json`:
  ```json
  "mac": {
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist"
  }
  ```

#### Windows:
- Obtain a code signing certificate
- Configure in `package.json`:
  ```json
  "win": {
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "password"
  }
  ```

## Building and Publishing

### Development Build
```bash
npm run dev
```
Auto-updates are disabled in development mode.

### Production Build (Local)
```bash
npm run dist
```
Creates distributable files without publishing.

### Production Build with Auto-Update Publishing
```bash
npm run publish
```
Builds and publishes to GitHub Releases for auto-updates.

## How Auto-Updates Work

### 1. Update Checking
- Automatically checks for updates 3 seconds after app startup
- Can be manually triggered via "Check for Updates" button
- Only works in production builds (not in development)

### 2. Update Download
- When an update is available, user is prompted to download
- Downloads happen in the background
- Progress is shown in the UI
- User can continue using the app during download

### 3. Update Installation
- When download completes, user is prompted to restart
- Can choose "Restart Now" or "Later"
- If "Later" is chosen, update installs on next app launch

## UI Elements

The app includes several UI elements for update management:

- **Version display**: Shows current app version in footer
- **Check for Updates button**: Manual update checking
- **Update status**: Shows checking, available, downloading, or error states
- **Progress indicator**: Shows download progress percentage

## Configuration Options

You can customize auto-update behavior in `main.js`:

```javascript
// Configure autoUpdater
autoUpdater.autoDownload = false; // Don't auto-download updates
autoUpdater.checkForUpdatesAndNotify(); // Check on startup
```

### Update Check Frequency
Currently set to check once on startup. You can add periodic checking:

```javascript
// Check for updates every hour
setInterval(() => {
  if (!process.defaultApp) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}, 60 * 60 * 1000);
```

## Security Considerations

1. **Code Signing**: Always sign your production builds
2. **HTTPS**: Updates are delivered over HTTPS via GitHub
3. **Verification**: electron-updater verifies update signatures
4. **User Consent**: Users must approve downloads and installations

## Troubleshooting

### Updates Not Working
1. Ensure you're running a production build (not development)
2. Check that GitHub repository and token are configured correctly
3. Verify that releases are published as "Latest" on GitHub
4. Check console logs for error messages

### Update Check Fails
- Verify internet connection
- Check GitHub repository access
- Ensure the app version in package.json follows semver format

### Download Issues
- Check available disk space
- Verify write permissions in app directory
- Check firewall/antivirus settings

## Release Process

1. Update version in `package.json`
2. Commit and tag the release:
   ```bash
   git add .
   git commit -m "Release v1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```
3. Build and publish:
   ```bash
   npm run publish
   ```
4. The new version will be automatically available to existing users

## Testing Updates

1. Build and publish a new version to GitHub
2. Install the previous version on a test machine
3. Launch the app and verify update checking works
4. Test the download and installation process

## Notes

- Auto-updates only work for installed applications, not portable versions
- The first version must be manually distributed
- Users need to manually install the first version that includes auto-update functionality
- Subsequent updates will be automatic
