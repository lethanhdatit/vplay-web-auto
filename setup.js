#!/usr/bin/env node

/**
 * Initial Setup Script
 * Run this to verify all dependencies are installed and create necessary directories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Running initial setup...\n');

// Check required directories
const requiredDirs = [
  'public',
  'steps',
  'workflows',
];

console.log('📁 Checking directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  ✓ Created ${dir}/`);
  } else {
    console.log(`  ✓ Found ${dir}/`);
  }
});

// Check required files
const requiredFiles = [
  'public/index.html',
  'public/styles.css',
  'public/app.js',
  'steps/getAuthHeaders.js',
  'steps/apiCall.js',
  'steps/workflow.js',
  'workflows/giftcode-automation.js',
  'server.js',
  'package.json',
];

console.log('\n📄 Checking files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ✗ Missing ${file}`);
  } else {
    console.log(`  ✓ Found ${file}`);
  }
});

// Check node_modules
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  const deps = fs.readdirSync(nodeModulesPath).filter(f => !f.startsWith('.'));
  console.log(`  ✓ Found ${deps.length} dependencies installed`);
} else {
  console.log('  ✗ node_modules not found. Run: npm install');
}

console.log('\n✅ Setup check complete!\n');
console.log('📖 Next steps:');
console.log('  1. npm install         (if not done)');
console.log('  2. npm start           (to start web server)');
console.log('  3. Open http://localhost:3000 in browser\n');
