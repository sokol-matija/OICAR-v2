#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting OICAR Mobile App deployment to Vercel...');
console.log('📁 Current directory:', process.cwd());

try {
  // Ensure we're in the right directory
  const currentDir = process.cwd();
  const expectedPath = 'OICAR-MobileApp';
  
  if (!currentDir.endsWith(expectedPath)) {
    console.error('❌ Must run from OICAR-MobileApp directory');
    process.exit(1);
  }

  // Clean build
  console.log('🧹 Cleaning previous build...');
  try {
    execSync('rm -rf dist', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if dist doesn't exist
  }

  // Build locally first
  console.log('🔨 Building locally...');
  execSync('npm run build', { stdio: 'inherit' });

  // Deploy the built dist folder
  console.log('📤 Deploying to Vercel...');
  execSync('vercel dist --prod --yes', { stdio: 'inherit' });

  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 