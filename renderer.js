class LibreverseDesktop {
    constructor() {
        // Cache DOM elements for better performance
        this.urlInput = document.getElementById('urlInput');
        this.connectBtn = document.getElementById('connectBtn');
        this.recentUrlsContainer = document.getElementById('recentUrls');
        this.clearBtn = document.getElementById('clearBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Debounce resize operations for better performance
        this.resizeDebounceTime = 16; // ~60fps
        this.resizeTimeout = null;
        
        this.initEventListeners();
        this.loadRecentUrls();
        this.setupDynamicResize();
        
        // Auto-focus URL input
        this.urlInput.focus();
    }

    initEventListeners() {
        // Use modern event handling with proper cleanup
        this.boundHandleConnect = this.handleConnect.bind(this);
        this.boundHandleKeypress = this.handleKeypress.bind(this);
        this.boundClearRecentUrls = this.clearRecentUrls.bind(this);
        
        // Connect button click
        this.connectBtn.addEventListener('click', this.boundHandleConnect);

        // Enter key in URL input
        this.urlInput.addEventListener('keypress', this.boundHandleKeypress);

        // Clear recent URLs
        this.clearBtn.addEventListener('click', this.boundClearRecentUrls);
    }

    handleKeypress(e) {
        if (e.key === 'Enter') {
            this.handleConnect();
        }
    }

    async handleConnect() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }

        // Add protocol if missing
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }

        this.setLoading(true);

        try {
            const result = await window.electronAPI.loadInstance(fullUrl);
            
            if (result.success) {
                // Save URL to recent list
                await window.electronAPI.saveUrl(fullUrl);
                this.loadRecentUrls();
                this.urlInput.value = '';
                
                // Keep loading state until window closes
                // The loading will be cleared when main window shows again
            } else {
                this.showError('Failed to load instance: ' + result.error);
                this.setLoading(false);
            }
        } catch (error) {
            this.showError('Connection error: ' + error.message);
            this.setLoading(false);
        }
    }

    async loadRecentUrls() {
        try {
            const urls = await window.electronAPI.getStoredUrls();
            this.renderRecentUrls(urls);
        } catch (error) {
            console.error('Failed to load recent URLs:', error);
        }
    }

    renderRecentUrls(urls) {
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        if (!urls || urls.length === 0) {
            const noUrlsDiv = document.createElement('div');
            noUrlsDiv.className = 'no-recent-urls';
            noUrlsDiv.textContent = 'No recent instances';
            fragment.appendChild(noUrlsDiv);
        } else {
            urls.forEach(url => {
                const urlItem = document.createElement('div');
                urlItem.className = 'recent-url-item';
                urlItem.textContent = url;
                urlItem.title = url;
                
                // Use event delegation for better performance
                urlItem.addEventListener('click', () => {
                    this.urlInput.value = url;
                    this.handleConnect();
                });
                
                fragment.appendChild(urlItem);
            });
        }
        
        // Single DOM operation
        this.recentUrlsContainer.innerHTML = '';
        this.recentUrlsContainer.appendChild(fragment);
        
        // Update window size after content changes
        this.debouncedUpdateWindowSize();
    }

    async clearRecentUrls() {
        try {
            await window.electronAPI.clearRecentUrls();
            this.loadRecentUrls();
        } catch (error) {
            console.error('Failed to clear recent URLs:', error);
        }
    }

    setupDynamicResize() {
        // Initial resize with delay to ensure DOM is ready
        requestAnimationFrame(() => {
            setTimeout(() => this.updateWindowSize(), 100);
        });
        
        // Use ResizeObserver for better performance than MutationObserver
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(() => {
                this.debouncedUpdateWindowSize();
            });
            this.resizeObserver.observe(this.recentUrlsContainer);
        } else {
            // Fallback to MutationObserver for older browsers
            this.mutationObserver = new MutationObserver(() => {
                this.debouncedUpdateWindowSize();
            });
            
            this.mutationObserver.observe(this.recentUrlsContainer, {
                childList: true,
                subtree: true
            });
        }
        
        // Optimized visibility change handling
        this.visibilityCleanup = window.electronAPI.onVisibilityChange((isVisible) => {
            if (isVisible) {
                this.setLoading(false);
            }
        });
    }

    debouncedUpdateWindowSize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.updateWindowSize();
        }, this.resizeDebounceTime);
    }

    updateWindowSize() {
        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => {
            const container = document.querySelector('.container');
            if (container) {
                const contentHeight = container.scrollHeight;
                window.electronAPI.resizeWindow(contentHeight);
            }
        });
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.loadingOverlay.classList.add('active');
            this.connectBtn.textContent = 'Connecting...';
            this.connectBtn.disabled = true;
            this.urlInput.disabled = true;
            document.body.classList.add('loading');
        } else {
            this.loadingOverlay.classList.remove('active');
            this.connectBtn.textContent = 'Connect';
            this.connectBtn.disabled = false;
            this.urlInput.disabled = false;
            document.body.classList.remove('loading');
        }
    }

    showError(message) {
        this.urlInput.classList.add('error');
        window.electronAPI.showErrorDialog(message);
        
        // Remove error class after a delay
        setTimeout(() => {
            this.urlInput.classList.remove('error');
        }, 3000);
    }

    // Cleanup method for proper memory management
    destroy() {
        // Remove event listeners
        if (this.connectBtn) {
            this.connectBtn.removeEventListener('click', this.boundHandleConnect);
        }
        if (this.urlInput) {
            this.urlInput.removeEventListener('keypress', this.boundHandleKeypress);
        }
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.boundClearRecentUrls);
        }
        
        // Cleanup observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // Cleanup visibility handler
        if (this.visibilityCleanup) {
            this.visibilityCleanup();
        }
        
        // Clear timeouts
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }
}

// Initialize the app when DOM is loaded with error handling
let appInstance;
let perfMonitor;

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize performance monitoring in development
        if (window.PerformanceMonitor) {
            perfMonitor = new window.PerformanceMonitor();
            perfMonitor.startTimer('App Initialization');
            perfMonitor.observePerformance();
        }

        appInstance = new LibreverseDesktop();
        
        if (perfMonitor) {
            perfMonitor.endTimer('App Initialization');
            perfMonitor.measureMemory();
        }
        
        // Handle page unload for cleanup
        window.addEventListener('beforeunload', () => {
            if (appInstance && typeof appInstance.destroy === 'function') {
                appInstance.destroy();
            }
            if (perfMonitor && typeof perfMonitor.disconnect === 'function') {
                perfMonitor.disconnect();
            }
        });
    } catch (error) {
        console.error('Failed to initialize Libreverse Desktop:', error);
    }
});
