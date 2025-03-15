// Robust build script for Netlify
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Netlify build process...');

// Helper function to run commands safely
function safeExec(command, errorMessage) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ ${errorMessage}`);
    console.error(`Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Check if required files exist
const requiredFiles = ['package.json', 'netlify.toml', 'next.config.js'];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file not found: ${file}`);
    process.exit(1);
  }
}

// Create .next directory if it doesn't exist (for fix-opengraph.js)
if (!fs.existsSync('.next')) {
  fs.mkdirSync('.next');
  fs.mkdirSync('.next/server', { recursive: true });
  fs.mkdirSync('.next/static', { recursive: true });
}

// Main build process
(async () => {
  // 1. Install dependencies
  if (!safeExec('npm ci', 'Failed to install dependencies')) {
    process.exit(1);
  }

  // 2. Generate Prisma client
  if (!safeExec('npx prisma generate', 'Failed to generate Prisma client')) {
    process.exit(1);
  }

  // 3. Run the fix-imports script to update Prisma imports
  try {
    console.log('Running fix-imports...');
    require('./fix-imports');
  } catch (error) {
    console.error('❌ Error in fix-imports script, but continuing build: ', error.message);
    // Continue build process despite errors
  }

  // 4. Run Next.js build
  if (!safeExec('next build', 'Failed to build Next.js application')) {
    process.exit(1);
  }

  // 5. Run the fix-opengraph script to fix missing files
  try {
    console.log('Running fix-opengraph...');
    require('./fix-opengraph');
  } catch (error) {
    console.error('❌ Error in fix-opengraph script, but continuing build: ', error.message);
    // Continue build process despite errors
  }

  console.log('✅ Build completed successfully!');
})(); 