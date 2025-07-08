const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Configure autoUpdater for fully automated updates
autoUpdater.autoDownload = true; // Automatically download updates
autoUpdater.autoInstallOnAppQuit = true; // Install on app quit

// Dynamic import for ES module electron-store
let Store;
let store;

// Initialize store asynchronously
async function initializeStore() {
  const { default: ElectronStore } = await import('electron-store');
  Store = ElectronStore;
  
  // Initialize electron-store with schema for better performance
  store = new Store({
    schema: {
      recentUrls: {
        type: 'array',
        default: [],
        items: {
          type: 'string'
        }
      }
    }
  });
}

// AutoUpdater event handlers - fully automated, no user prompts
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version, '- downloading in background...');
  // Update downloads automatically, no user prompt needed
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available. Current version:', info.version);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message = log_message + ` - Downloaded ${progressObj.percent}%`;
  log_message = log_message + ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
  
  // Optionally notify the renderer about silent download progress
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('silent-download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded silently. Will install on next app restart. Version:', info.version);
  
  // Optionally show a subtle notification that update is ready
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-ready', info);
  }
  
  // Update will be installed automatically when app quits/restarts
});

let mainWindow;
let webViewWindow;

// Cache frequently used values
const isProduction = !process.defaultApp;
const isDarwin = process.platform === 'darwin';

function createMainWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 500,
    height: 450, // Reduced initial height
    minHeight: 400, // Reduced minimum height
    maxHeight: Math.floor(screenHeight * 0.9),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: true, // Prevent throttling for better responsiveness
      enableRemoteModule: false,
      experimentalFeatures: false
    },
    resizable: false,
    center: true,
    title: 'Libreverse Desktop',
    show: false,
    // --- title-bar / frame ---------------------------------
    frame: !isDarwin,                // frameless on Win/Linux, framed on macOS
    titleBarStyle: isDarwin ? 'hiddenInset' : undefined,
    titleBarOverlay: isDarwin,       // overlay only on macOS
    // --------------------------------------------------------
  });

  mainWindow.loadFile('index.html');

  // Use webContents.once for better performance
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
    
    // Optimize for GPU acceleration
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (webViewWindow && !webViewWindow.isDestroyed()) {
      webViewWindow.close();
    }
  });
}

function createWebViewWindow(url) {
  // Reuse existing window if it exists and isn't destroyed
  if (webViewWindow && !webViewWindow.isDestroyed()) {
    webViewWindow.loadURL(url);
    webViewWindow.show();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
    return;
  }

  webViewWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: true
    },
    title: 'Libreverse Instance',
    show: false,
    // --- title-bar / frame ---------------------------------
    frame: !isDarwin,
    titleBarStyle: isDarwin ? 'hiddenInset' : undefined,
    titleBarOverlay: isDarwin,
    // --------------------------------------------------------
    center: true,
  });

  webViewWindow.loadURL(url);

  webViewWindow.webContents.once('did-finish-load', () => {
    // Inject minimal CSS for titlebar without reading file every time
    webViewWindow.webContents.insertCSS(`
      .app-titlebar {
        height: 30px !important;
        width: 100% !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 9999 !important;
        -webkit-app-region: drag !important;   /* correct property */
        background: transparent !important;
      }
      .app-titlebar * { -webkit-app-region: no-drag; }
    `);

    // Add titlebar element efficiently
    webViewWindow.webContents.executeJavaScript(`
      if (!document.querySelector('.app-titlebar')) {
        const titlebar = document.createElement('div');
        titlebar.className = 'app-titlebar';
        document.body.insertBefore(titlebar, document.body.firstChild);
      }
    `);

    webViewWindow.show();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });

  webViewWindow.on('closed', () => {
    webViewWindow = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      // Clear loading state efficiently
      mainWindow.webContents.executeJavaScript(`
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('loading');
      `);
    }
  });

  // Optimized navigation handling
  webViewWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const baseUrl = new URL(url).origin;
      const navUrl = new URL(navigationUrl);
      
      if (navUrl.origin !== baseUrl) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      event.preventDefault();
    }
  });
}

// Optimized app initialization with performance monitoring
app.whenReady().then(async () => {
  // Initialize store first
  await initializeStore();
  
  // Enable GPU acceleration optimizations
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  
  // Memory optimizations
  app.commandLine.appendSwitch('memory-pressure-off');
  app.commandLine.appendSwitch('max-old-space-size', '512');
  
  createMainWindow();
  
  // Check for updates after app is ready (delay to ensure UI is ready)
  setTimeout(() => {
    if (!process.defaultApp) { // Only check for updates in production
      autoUpdater.checkForUpdatesAndNotify();
      
      // Set up periodic update checking every hour
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 60 * 60 * 1000); // 1 hour in milliseconds
    }
  }, 3000); // Wait 3 seconds after app start

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
  
  // Check for updates when app regains focus (but throttle to avoid spam)
  let lastFocusUpdateCheck = 0;
  app.on('browser-window-focus', () => {
    const now = Date.now();
    // Only check if it's been more than 30 minutes since last focus check
    if (!process.defaultApp && (now - lastFocusUpdateCheck) > 30 * 60 * 1000) {
      lastFocusUpdateCheck = now;
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
});

// Optimize app quit behavior
app.on('before-quit', () => {
  // Clean up any timers or intervals
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
});

app.on('window-all-closed', () => {
  if (!isDarwin) {
    app.quit();
  }
});

// Optimized IPC handlers with error handling
ipcMain.handle('get-stored-urls', () => {
  try {
    if (!store) {
      console.warn('Store not initialized yet');
      return [];
    }
    return store.get('recentUrls', []);
  } catch (error) {
    console.error('Error getting stored URLs:', error);
    return [];
  }
});

ipcMain.handle('save-url', (event, url) => {
  try {
    if (!store) {
      console.warn('Store not initialized yet');
      return [];
    }
    const recentUrls = store.get('recentUrls', []);
    
    // Remove if already exists to avoid duplicates
    const filtered = recentUrls.filter(item => item !== url);
    
    // Add to beginning and limit to 10 recent URLs
    const updated = [url, ...filtered].slice(0, 10);
    
    store.set('recentUrls', updated);
    return updated;
  } catch (error) {
    console.error('Error saving URL:', error);
    return store ? store.get('recentUrls', []) : [];
  }
});

ipcMain.handle('load-instance', (event, url) => {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith('http')) {
      throw new Error('Invalid protocol');
    }
    
    createWebViewWindow(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-error-dialog', (event, message) => {
  try {
    dialog.showErrorBox('Error', message);
  } catch (error) {
    console.error('Error showing dialog:', error);
  }
});

ipcMain.handle('clear-recent-urls', () => {
  try {
    if (!store) {
      console.warn('Store not initialized yet');
      return [];
    }
    store.set('recentUrls', []);
    return [];
  } catch (error) {
    console.error('Error clearing URLs:', error);
    return store ? store.get('recentUrls', []) : [];
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Debounced resize to improve performance
let resizeTimeout;
ipcMain.handle('resize-window', (event, contentHeight) => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  
  resizeTimeout = setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const { screen } = require('electron');
        const primaryDisplay = screen.getPrimaryDisplay();
        const { height: screenHeight } = primaryDisplay.workAreaSize;
        
        const maxHeight = Math.floor(screenHeight * 0.9);
        const newHeight = Math.min(Math.max(contentHeight, 400), maxHeight); // Updated minimum height to 400
        
        const currentBounds = mainWindow.getBounds();
        mainWindow.setBounds({
          x: currentBounds.x,
          y: currentBounds.y,
          width: currentBounds.width,
          height: newHeight
        });
      } catch (error) {
        console.error('Error resizing window:', error);
      }
    }
  }, 16); // ~60fps debounce
});
