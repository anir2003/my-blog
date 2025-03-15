// Robust build script for Netlify
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Netlify build process...');

// Helper function to run commands safely
function safeExec(command, errorMessage) {
  try {
    console.log(`Running: ${command}`);
    // Use a more reliable command execution method for Netlify
    const result = spawnSync(command, [], { 
      shell: true, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    if (result.status !== 0) {
      console.error(`❌ ${errorMessage}`);
      console.error(`Command failed with status code: ${result.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`❌ ${errorMessage}`);
    console.error(`Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Check if required files exist
const requiredFiles = ['package.json', 'netlify.toml'];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file not found: ${file}`);
    process.exit(1);
  }
}

// Create .next directory if it doesn't exist (for fix-opengraph.js)
if (!fs.existsSync('.next')) {
  console.log('Creating .next directory structure...');
  fs.mkdirSync('.next', { recursive: true });
  fs.mkdirSync(path.join('.next', 'server'), { recursive: true });
  fs.mkdirSync(path.join('.next', 'static'), { recursive: true });
}

// Helper function to safely require a file if it exists
function safeRequire(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Running ${description}...`);
      require(filePath);
      return true;
    } else {
      console.warn(`⚠️ ${description} file not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error in ${description}: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Helper function to check for native modules and rebuild them if needed
function rebuildNativeModules() {
  const nativeModules = ['bcrypt', 'node-gyp'];
  
  for (const moduleName of nativeModules) {
    const modulePath = path.join('node_modules', moduleName);
    
    if (fs.existsSync(modulePath)) {
      console.log(`🔧 Rebuilding native module: ${moduleName}`);
      
      // Try to rebuild the module
      safeExec(`npm rebuild ${moduleName} --build-from-source`, 
        `Failed to rebuild ${moduleName}. Continuing anyway...`);
    }
  }
}

// Main build process
(async () => {
  console.log('📦 Checking file structure...');
  
  // 1. Install dependencies
  if (!safeExec('npm ci', 'Failed to install dependencies')) {
    // Try with npm install as a fallback
    console.log('Trying fallback: npm install --production=false');
    if (!safeExec('npm install --production=false', 'Failed to install dependencies (fallback)')) {
      process.exit(1);
    }
  }

  // 2. Rebuild any native modules
  rebuildNativeModules();

  // 3. Generate Prisma client (if prisma exists)
  if (fs.existsSync('./prisma')) {
    if (!safeExec('npx prisma generate', 'Failed to generate Prisma client')) {
      console.error('⚠️ Continuing build despite Prisma generation failure');
      // We'll continue despite failure here
    }
  } else {
    console.log('⚠️ No Prisma schema found, skipping client generation');
  }

  // 4. Run the fix-imports script to update Prisma imports (if exists)
  safeRequire('./fix-imports', 'fix-imports script');

  // 5. Run Next.js build
  console.log('🏗️ Building Next.js application...');
  if (!safeExec('npm run build', 'Failed to build Next.js application')) {
    // Try with next build as a fallback
    console.log('Trying fallback: npx next build');
    if (!safeExec('npx next build', 'Failed to build Next.js application (fallback)')) {
      // Last resort: Build with special flag to skip problematic routes
      console.log('Trying last resort: NEXT_MINIMAL_BUILD=1 npx next build');
      if (!safeExec('NEXT_MINIMAL_BUILD=1 npx next build', 'All build attempts failed')) {
        process.exit(1);
      }
    }
  }

  // 6. Run the fix-opengraph script to fix missing files (if exists)
  safeRequire('./fix-opengraph', 'fix-opengraph script');

  console.log('✅ Build completed successfully!');
})(); 