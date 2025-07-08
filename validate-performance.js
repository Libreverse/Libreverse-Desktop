#!/usr/bin/env node

/**
 * Performance validation script for LibreVerse Desktop
 * Tests various performance metrics and reports results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceValidator {
    constructor() {
        this.results = {
            fileSize: {},
            dependencies: {},
            bundleAnalysis: {},
            securityCheck: {}
        };
    }

    async runAllTests() {
        console.log('🚀 Running LibreVerse Desktop Performance Validation...\n');
        
        this.checkFilesSizes();
        this.checkDependencies();
        this.checkSecuritySettings();
        this.generateReport();
    }

    checkFilesSizes() {
        console.log('📊 Analyzing File Sizes...');
        
        const files = [
            'main.js',
            'renderer.js',
            'preload.js',
            'styles.css',
            'index.html',
            'package.json'
        ];

        files.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                const sizeKB = (stats.size / 1024).toFixed(2);
                this.results.fileSize[file] = {
                    size: `${sizeKB} KB`,
                    optimized: sizeKB < this.getOptimalSize(file)
                };
                console.log(`  ${file}: ${sizeKB} KB ${this.results.fileSize[file].optimized ? '✅' : '⚠️'}`);
            }
        });
        console.log();
    }

    getOptimalSize(filename) {
        const limits = {
            'main.js': 15,      // Should be under 15KB
            'renderer.js': 10,   // Should be under 10KB
            'preload.js': 3,     // Should be under 3KB
            'styles.css': 12,    // Should be under 12KB
            'index.html': 3,     // Should be under 3KB
            'package.json': 5    // Should be under 5KB
        };
        return limits[filename] || 10;
    }

    checkDependencies() {
        console.log('📦 Analyzing Dependencies...');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            // Check for latest versions
            const electronVersion = deps.electron;
            const storeVersion = deps['electron-store'];
            
            this.results.dependencies = {
                electronVersion,
                storeVersion,
                totalDeps: Object.keys(deps).length,
                isOptimized: Object.keys(deps).length <= 5 // Should have minimal deps
            };

            console.log(`  Electron: ${electronVersion} ${this.isLatestElectron(electronVersion) ? '✅' : '⚠️'}`);
            console.log(`  electron-store: ${storeVersion} ${this.isLatestStore(storeVersion) ? '✅' : '⚠️'}`);
            console.log(`  Total dependencies: ${this.results.dependencies.totalDeps} ${this.results.dependencies.isOptimized ? '✅' : '⚠️'}`);
        } catch (error) {
            console.log('  ❌ Error reading package.json');
        }
        console.log();
    }

    isLatestElectron(version) {
        // Check if Electron version is 30+
        const majorVersion = parseInt(version.replace(/[^\d]/g, ''));
        return majorVersion >= 30;
    }

    isLatestStore(version) {
        // Check if electron-store version is 10+
        const majorVersion = parseInt(version.replace(/[^\d]/g, ''));
        return majorVersion >= 10;
    }

    checkSecuritySettings() {
        console.log('🔒 Validating Security Settings...');
        
        try {
            const mainJs = fs.readFileSync('main.js', 'utf8');
            const preloadJs = fs.readFileSync('preload.js', 'utf8');
            
            // Check for security best practices
            const securityChecks = {
                contextIsolation: mainJs.includes('contextIsolation: true'),
                nodeIntegration: mainJs.includes('nodeIntegration: false'),
                webSecurity: mainJs.includes('webSecurity: true'),
                preloadScript: mainJs.includes('preload:'),
                contextBridge: preloadJs.includes('contextBridge')
            };

            this.results.securityCheck = securityChecks;

            Object.entries(securityChecks).forEach(([check, passed]) => {
                console.log(`  ${check}: ${passed ? '✅' : '❌'}`);
            });

        } catch (error) {
            console.log('  ❌ Error reading security configuration');
        }
        console.log();
    }

    generateReport() {
        console.log('📋 Performance Report Summary\n');
        
        const totalFiles = Object.keys(this.results.fileSize).length;
        const optimizedFiles = Object.values(this.results.fileSize).filter(f => f.optimized).length;
        
        const securityPassed = Object.values(this.results.securityCheck).filter(Boolean).length;
        const totalSecurityChecks = Object.keys(this.results.securityCheck).length;
        
        console.log(`File Size Optimization: ${optimizedFiles}/${totalFiles} files optimized`);
        console.log(`Dependencies: ${this.results.dependencies.isOptimized ? 'Optimized' : 'Could be improved'}`);
        console.log(`Security: ${securityPassed}/${totalSecurityChecks} checks passed`);
        
        const overallScore = this.calculateOverallScore();
        console.log(`\n🎯 Overall Performance Score: ${overallScore}/100`);
        
        if (overallScore >= 90) {
            console.log('🏆 Excellent! Your app is highly optimized.');
        } else if (overallScore >= 75) {
            console.log('✅ Good! Minor optimizations possible.');
        } else {
            console.log('⚠️ Needs improvement. Check the warnings above.');
        }
    }

    calculateOverallScore() {
        const fileSizeScore = (Object.values(this.results.fileSize).filter(f => f.optimized).length / Object.keys(this.results.fileSize).length) * 30;
        const depScore = this.results.dependencies.isOptimized ? 20 : 10;
        const securityScore = (Object.values(this.results.securityCheck).filter(Boolean).length / Object.keys(this.results.securityCheck).length) * 50;
        
        return Math.round(fileSizeScore + depScore + securityScore);
    }
}

// Run the validation
const validator = new PerformanceValidator();
validator.runAllTests().catch(console.error);
