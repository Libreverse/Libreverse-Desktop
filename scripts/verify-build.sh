#!/bin/bash

# Build verification script
# This script checks the build environment and runs a test build

set -e

echo "🔍 Libreverse Desktop Build Verification"
echo "========================================"

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Check Electron version
echo "📋 Checking Electron version..."
npx electron --version

# Check if required files exist
echo "📋 Checking required files..."
required_files=(
    "main.js"
    "preload.js"
    "renderer.js"
    "index.html"
    "styles.css"
    "icon.png"
    "package.json"
    "electron-builder.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
        exit 1
    fi
done

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run electron-builder install-app-deps
echo "🔧 Installing app dependencies..."
npm run postinstall

# Check disk space
echo "💾 Checking disk space..."
df -h .

# Run a test build with debug output
echo "🏗️  Running test build..."
npm run dist:debug

# Check if build completed successfully
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build artifacts:"
    ls -la dist/
else
    echo "❌ Build failed - no dist directory found"
    exit 1
fi

echo "🎉 Build verification completed successfully!"
