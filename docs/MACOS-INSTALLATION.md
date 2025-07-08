# Installation Instructions for macOS

If you see "App can't be opened because it's from an unidentified developer" or the app appears "damaged":

## Method 1: Remove Quarantine (Recommended)

This is the most effective method for GitHub releases:

```bash
# Option A: Remove quarantine from the DMG before mounting
xattr -d com.apple.quarantine ~/Downloads/Libreverse.Desktop-*.dmg

# Option B: Remove quarantine from installed app
sudo xattr -cr "/Applications/Libreverse Desktop.app"
```

## Method 2: Right-Click Method

1. Download the `.dmg` file
2. Double-click to mount it
3. **Right-click** on the app → **Open**
4. Click **Open** in the dialog that appears
5. The app will launch and be trusted for future runs

## Method 3: System Preferences Method

1. Go to **System Preferences** → **Security & Privacy**
2. Under the **General** tab, you'll see a message about the blocked app
3. Click **Open Anyway**

## Why This Happens

- The app is built on GitHub Actions (different machine)
- It's not code-signed with an Apple Developer Certificate
- macOS Gatekeeper blocks unsigned apps from unknown sources with quarantine attributes
- Your locally built version works because macOS trusts local builds

## Security Note

This app is safe - it's just unsigned. The source code is open and available for review.
