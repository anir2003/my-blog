// Ensure browser globals are available
try {
  require('./browser-globals');
} catch (e) {
  console.warn('Failed to load browser-globals directly:', e.message);
  
  // Fallback definitions if needed
  if (typeof global.Request === 'undefined') {
    global.Request = function Request() {
      return { url: '', method: 'GET', headers: {} };
    };
    console.log('⚠️ Added emergency stub for Request');
  }
}

const fs = require('fs');
const path = require('path');

// Directory where Next.js builds its output
const nextDir = path.join(__dirname, '.next');

// Function to check if a file exists and create it if it doesn't
function ensureFileExists(filePath, content = '') {
  if (!fs.existsSync(filePath)) {
    console.log(`Creating missing file: ${filePath}`);
    // Make sure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Create the file with empty content or default content
    fs.writeFileSync(filePath, content);
    return true;
  } else {
    console.log(`File already exists: ${filePath}`);
    return false;
  }
}

// Files to check and create if missing
const filesToCheck = [
  // Add the specific file you're having issues with
  'opengraph-types.js',
  'opengraph-types.js.map',
  'next-flight-server-reference-proxy-loader.js',
  'next-flight-server-reference-proxy-loader.js.map'
];

console.log('Checking for missing files in the Next.js build...');

// Check each path
filesToCheck.forEach(file => {
  // First check in the server directory
  ensureFileExists(path.join(nextDir, 'server', file), '// Auto-generated empty file');
  
  // Also check in the static directory
  ensureFileExists(path.join(nextDir, 'static', file), '// Auto-generated empty file');
});

console.log('File check completed!'); 