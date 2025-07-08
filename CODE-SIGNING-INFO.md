# Code Signing Behavior

## How electron-builder handles missing secrets:

### ✅ **Good News: It's Intelligent!**

Electron-builder automatically detects available code signing certificates and gracefully handles missing ones:

### **macOS Behavior:**
- **With certificates**: Signs and notarizes the app
- **Without certificates**: Creates unsigned .dmg that works fine
- **Partial setup**: Uses what's available, skips what's missing

### **Windows Behavior:**
- **With certificate**: Creates signed .exe installer
- **Without certificate**: Creates unsigned .exe (shows security warning when users run it)
- **No failures**: Build completes successfully either way

### **Linux Behavior:**
- **No code signing needed**: AppImage, .deb, and .rpm work out of the box
- **Always successful**: Linux doesn't require or use code signing

## **What You'll See:**

### **With Missing Secrets:**
```
⚠️  macOS code signing not configured (app will be unsigned)
⚠️  Windows code signing not configured (app will be unsigned)
⚠️  Apple notarization not configured

✅ Building unsigned applications...
✅ Build successful - apps will work but show security warnings
```

### **With Secrets Configured:**
```
✅ macOS code signing configured
✅ Windows code signing configured  
✅ Apple notarization configured

✅ Building signed applications...
✅ Build successful - apps will install without warnings
```

## **User Experience:**

### **Unsigned Apps:**
- **macOS**: "App can't be opened because it's from an unidentified developer"
  - **User fix**: Right-click → Open → Open anyway
- **Windows**: "Windows protected your PC" warning
  - **User fix**: Click "More info" → "Run anyway"
- **Linux**: No warnings, works normally

### **Signed Apps:**
- **All platforms**: Install and run without any warnings
- **Much better user experience**
- **Higher trust and adoption**

## **GitHub Actions Integration:**

The workflow now:
1. **Checks** what secrets are available
2. **Reports** what will be signed vs unsigned
3. **Builds** successfully regardless
4. **Creates** releases with all platform files
5. **Never fails** due to missing certificates

## **Bottom Line:**
🎯 **Your app will build and work perfectly without any code signing!**
Users just need to click through one security warning on first launch.
