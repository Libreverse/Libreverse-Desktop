// Performance monitoring utility for development
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.isEnabled = process.env.NODE_ENV === 'development';
    }

    startTimer(label) {
        if (!this.isEnabled) return;
        
        this.metrics.set(label, {
            start: performance.now(),
            label
        });
    }

    endTimer(label) {
        if (!this.isEnabled) return;
        
        const metric = this.metrics.get(label);
        if (metric) {
            const duration = performance.now() - metric.start;
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            this.metrics.delete(label);
            return duration;
        }
    }

    measureMemory() {
        if (!this.isEnabled) return;
        
        if (performance.memory) {
            const memory = performance.memory;
            console.log('🧠 Memory Usage:', {
                used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
            });
        }
    }

    observePerformance() {
        if (!this.isEnabled || !window.PerformanceObserver) return;

        // Observe paint timing
        try {
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.push(paintObserver);
        } catch (e) {
            console.warn('Paint timing not supported');
        }

        // Observe navigation timing
        try {
            const navObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    console.log(`🧭 Navigation: ${entry.duration.toFixed(2)}ms`);
                });
            });
            navObserver.observe({ entryTypes: ['navigation'] });
            this.observers.push(navObserver);
        } catch (e) {
            console.warn('Navigation timing not supported');
        }
    }

    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.metrics.clear();
    }
}

// Export for use in renderer process
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}
