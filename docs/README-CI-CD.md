# CI/CD Setup Guide

This document explains the automated build and release system for Libreverse Desktop.

## Overview

The project uses GitHub Actions to automatically:
- Build the application for Windows, macOS, and Linux
- Increment version numbers
- Create GitHub releases
- Publish updates for the auto-updater system

## Workflow Files

### 1. `.github/workflows/release.yml`
**Triggers**: Push to `main` branch or manual dispatch
**Purpose**: Build, version bump, and create releases

**Jobs**:
- `version-and-tag`: Increments version and creates git tags
- `build`: Builds the app on all platforms (Windows, macOS, Linux)
- `release`: Creates GitHub release with all build artifacts

### 2. `.github/workflows/build-test.yml`
**Triggers**: Pull requests and pushes to non-main branches
**Purpose**: Test builds without releasing

## Version Bumping

### Automatic Version Bumping
The system automatically determines version bump type based on commit messages:

- **Major bump**: Commit contains `BREAKING CHANGE` or `major:`
- **Minor bump**: Commit contains `feat:` or `minor:`
- **Patch bump**: All other commits (default)

Examples:
```bash
git commit -m "feat: add new feature"           # → minor bump
git commit -m "fix: resolve bug"                # → patch bump
git commit -m "major: breaking API change"      # → major bump
git commit -m "BREAKING CHANGE: new behavior"   # → major bump
```

### Manual Version Bumping
You can manually trigger a release with specific version bump:

1. **Via GitHub UI**:
   - Go to Actions → Build and Release
   - Click "Run workflow"
   - Select version bump type (patch/minor/major)

2. **Via Script** (for local development):
   ```bash
   ./bump-version.sh patch   # 1.0.0 → 1.0.1
   ./bump-version.sh minor   # 1.0.0 → 1.1.0
   ./bump-version.sh major   # 1.0.0 → 2.0.0
   ```

## Required Repository Secrets

For full functionality, set up these GitHub repository secrets:

### Code Signing (Optional but Recommended)

#### macOS Code Signing:
- `APPLE_ID`: Your Apple ID email
- `APPLE_ID_PASS`: App-specific password for Apple ID
- `CSC_LINK`: Base64 encoded .p12 certificate
- `CSC_KEY_PASSWORD`: Certificate password

#### Windows Code Signing:
- `WIN_CSC_LINK`: Base64 encoded .p12 certificate
- `WIN_CSC_KEY_PASSWORD`: Certificate password

### Required:
- `GITHUB_TOKEN`: Automatically provided by GitHub (no setup needed)

## Setup Instructions

### 1. Repository Configuration
Update the repository URLs in `package.json`:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Libreverse/libreverse-desktop.git"
  },
  "build": {
    "publish": {
      "provider": "github",
      "owner": "Libreverse",
      "repo": "libreverse-desktop"
    }
  }
}
```

### 2. Enable GitHub Actions
1. Ensure GitHub Actions are enabled in your repository settings
2. Commit and push the workflow files to your repository

### 3. First Release
1. Make any initial commits to `main` branch
2. The workflow will automatically trigger and create your first release

## Build Artifacts

Each release includes builds for all platforms:

### Windows:
- `.exe` installer (NSIS)

### macOS:
- `.dmg` disk image
- Supports both Intel (x64) and Apple Silicon (arm64)

### Linux:
- `.AppImage` (universal)
- `.deb` (Debian/Ubuntu)
- `.rpm` (Red Hat/Fedora)

## Auto-Updater Integration

The release workflow automatically:
1. Builds all platform versions
2. Creates a GitHub release
3. Publishes the release for auto-updater consumption
4. Users receive automatic updates on next app restart

## Workflow Behavior

### On Push to Main:
1. Determines version bump type from commit messages
2. Bumps version in `package.json`
3. Creates git tag
4. Builds for all platforms
5. Creates GitHub release
6. Publishes for auto-updater

### On Pull Requests:
1. Builds for all platforms (test only)
2. No version bumping or releasing
3. Validates that the build works

### On Manual Trigger:
1. Uses specified version bump type
2. Follows same process as push to main

## Troubleshooting

### Build Failures
- Check GitHub Actions logs for specific errors
- Ensure all dependencies are properly listed in `package.json`
- Verify code signing certificates (if used)

### Version Issues
- Ensure commit messages follow conventional format
- Check that `package.json` version is valid semver
- Verify git tags are not conflicting

### Release Issues
- Ensure `GITHUB_TOKEN` has proper permissions
- Check repository settings for release permissions
- Verify build artifacts are being generated

## Local Development

### Testing Builds Locally:
```bash
npm run dist          # Build without publishing
npm run publish       # Build and publish (requires GH_TOKEN)
```

### Manual Version Management:
```bash
npm version patch     # Bump patch version
npm version minor     # Bump minor version
npm version major     # Bump major version
```

## Best Practices

1. **Use conventional commit messages** for automatic version bumping
2. **Test locally** before pushing to main
3. **Review releases** after they're created
4. **Monitor auto-update** deployment to users
5. **Keep secrets secure** and rotate certificates periodically

## Release Schedule

- **Automatic**: Every push to main creates a release
- **Manual**: Can be triggered anytime via GitHub Actions UI
- **Testing**: Pull requests build but don't release

This setup ensures that every change to main is automatically built, versioned, and released to users through the auto-update system.
