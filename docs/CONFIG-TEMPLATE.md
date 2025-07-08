# Configuration Template

Fill out the following information and I'll update all the files for you:

## Required Information:

1. **GitHub Username**: _________________
   (Your GitHub username, e.g., "john-doe")

2. **Repository Name**: libreverse-desktop
   (Keep as-is unless you want to change it)

3. **Your Name/Company**: _________________
   (For author field and publisher name, e.g., "John Doe" or "Acme Corp")

4. **App ID Domain** (optional): _________________
   (Reverse domain notation, e.g., "com.johndoe" or "com.acme")
   (Leave blank to use default: com.Libreverse.desktop)

## GitHub Repository Secrets Setup

The GitHub Actions workflow needs the following secrets to be configured in your repository:

### 🔒 **Required (Automatic)**
- `GITHUB_TOKEN` - ✅ Automatically provided by GitHub (no setup needed)

### 🍎 **macOS Code Signing (Optional but Recommended)**
For professional macOS builds and notarization:
- `APPLE_ID` - Your Apple Developer account email
- `APPLE_ID_PASS` - App-specific password for your Apple ID
- `CSC_LINK` - Base64 encoded .p12 certificate file
- `CSC_KEY_PASSWORD` - Password for the .p12 certificate

### 🪟 **Windows Code Signing (Optional but Recommended)**
For signed Windows builds (prevents security warnings):
- `WIN_CSC_LINK` - Base64 encoded .p12 certificate file
- `WIN_CSC_KEY_PASSWORD` - Password for the .p12 certificate

### 📝 **How to Add Secrets:**
1. Go to your GitHub repository
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret name and value

### ⚠️ **What Happens Without Code Signing:**
- **macOS**: App will work but show "unidentified developer" warning
- **Windows**: Windows Defender may flag the app and users get security warnings
- **Linux**: No impact (code signing not required)

### 💡 **Getting Code Signing Certificates:**

#### For macOS:
1. Join Apple Developer Program ($99/year)
2. Create "Developer ID Application" certificate
3. Export as .p12 file
4. Convert to base64: `base64 -i certificate.p12 | pbcopy`

#### For Windows:
1. Purchase code signing certificate from CA (Sectigo, DigiCert, etc.)
2. Receive .p12 file from CA
3. Convert to base64: `base64 -i certificate.p12 | pbcopy`

## 🚦 **Minimum Setup to Get Started:**
You can start with just the basic info and add code signing later:
1. Fill out GitHub username and name above
2. The app will build and work on all platforms
3. Add code signing secrets later for professional releases

## Example:
If your GitHub username is "george-dev" and your name is "George Smith":

1. GitHub Username: george-dev
2. Repository Name: libreverse-desktop
3. Your Name/Company: George Smith
4. App ID Domain: com.georgesmith (or leave blank)

## Files that will be updated:
- package.json (repository URLs, author, publisher)
- README-CI-CD.md (documentation examples)

Once you provide this info, I'll update all the files automatically!
