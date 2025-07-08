#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Before build script for electron-builder
 * This script runs before the build process and helps debug file path issues
 */

async function beforeBuild(context) {
  console.log('🔍 Running before-build script...');
  console.log('Platform:', context.platform.name);
  console.log('Arch:', context.arch);
  console.log('App directory:', context.appDir);
  console.log('Build resources directory:', context.buildResourcesDir);
  console.log('Output directory:', context.outDir);
  
  // Verify required files exist
  const requiredFiles = [
    'main.js',
    'preload.js', 
    'renderer.js',
    'index.html',
    'styles.css',
    'icon.png',
    'package.json'
  ];
  
  console.log('📁 Checking required files...');
  for (const file of requiredFiles) {
    const filePath = path.join(context.appDir, file);
    if (fs.existsSync(filePath)) {
      console.log('✅', file);
    } else {
      console.log('❌', file, 'MISSING');
      throw new Error(`Required file missing: ${file}`);
    }
  }
  
  // Check node_modules
  const nodeModulesPath = path.join(context.appDir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ node_modules directory exists');
  } else {
    console.log('❌ node_modules directory missing');
    throw new Error('node_modules directory not found');
  }
  
  console.log('✅ Before-build checks completed successfully');
  return true;
}

module.exports = beforeBuild;
