const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // URL management
  getStoredUrls: () => ipcRenderer.invoke('get-stored-urls'),
  saveUrl: (url) => ipcRenderer.invoke('save-url', url),
  clearRecentUrls: () => ipcRenderer.invoke('clear-recent-urls'),
  
  // Instance management
  loadInstance: (url) => ipcRenderer.invoke('load-instance', url),
  
  // UI management
  showErrorDialog: (message) => ipcRenderer.invoke('show-error-dialog', message),
  resizeWindow: (contentHeight) => ipcRenderer.invoke('resize-window', contentHeight),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Event listeners
  onVisibilityChange: (callback) => {
    const handleVisibilityChange = () => callback(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  },
  
  onSilentUpdateProgress: (callback) => {
    ipcRenderer.on('silent-download-progress', (event, progress) => callback(progress));
    return () => ipcRenderer.removeAllListeners('silent-download-progress');
  },
  
  onUpdateReady: (callback) => {
    ipcRenderer.on('update-ready', (event, info) => callback(info));
    return () => ipcRenderer.removeAllListeners('update-ready');
  }
});
