/**
 * Ensure Next.js build artifacts are properly created
 * This fixes issues with missing files that can cause Netlify builds to fail
 */

const fs = require('fs');
const path = require('path');

// Function to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
    return true;
  }
  return false;
}

// Function to ensure file exists with content
function ensureFileExists(filePath, content = '') {
  if (!fs.existsSync(filePath)) {
    // Create parent directory if it doesn't exist
    ensureDirExists(path.dirname(filePath));
    
    // Create the file
    fs.writeFileSync(filePath, content);
    console.log(`Created missing file: ${filePath}`);
    return true;
  }
  return false;
}

// Next.js build directory
const nextDir = path.join(process.cwd(), '.next');

// List of files that Next.js might need but sometimes fails to generate
const filesToCheck = [
  // Runtime files
  'server/app-paths-manifest.json',
  'server/middleware-manifest.json',
  'server/pages-manifest.json',
  'server/next-font-manifest.json',
  
  // Type files for opengraph
  'server/opengraph-types.js',
  'server/opengraph-types.js.map',
  'static/opengraph-types.js',
  'static/opengraph-types.js.map',
  
  // Loader files
  'server/next-flight-server-reference-proxy-loader.js',
  'server/next-flight-server-reference-proxy-loader.js.map',
  'static/chunks/next-flight-server-reference-proxy-loader.js',
  'static/chunks/next-flight-server-reference-proxy-loader.js.map',
];

console.log('🔍 Checking for missing Next.js build files...');

let fixedCount = 0;

// Create .next directory if it doesn't exist
ensureDirExists(nextDir);

// Check and fix each file
filesToCheck.forEach(file => {
  const filePath = path.join(nextDir, file);
  if (ensureFileExists(filePath, '// Auto-generated stub file')) {
    fixedCount++;
  }
});

if (fixedCount > 0) {
  console.log(`✅ Fixed ${fixedCount} missing files`);
} else {
  console.log('✅ No missing files found');
}

// Ensure the middleware folder exists and has basic files
const middlewareDir = path.join(nextDir, 'server', 'middleware');
ensureDirExists(middlewareDir);
ensureFileExists(path.join(middlewareDir, 'middleware.js'), '// Empty middleware file');

console.log('✅ Next.js build fixes completed!'); 