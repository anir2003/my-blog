// Netlify Build Plugin to fix common Next.js 15 deployment issues
module.exports = {
  onPostBuild: ({ utils }) => {
    const fs = require('fs');
    const path = require('path');
    
    console.log('🔍 Running custom build plugin to fix Next.js issues...');
    
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
      }
      return false;
    }
    
    // Known problematic files in Next.js 15
    const problematicFiles = [
      'opengraph-types.js',
      'opengraph-types.js.map',
      'next-flight-server-reference-proxy-loader.js',
      'next-flight-server-reference-proxy-loader.js.map'
    ];
    
    // Get build directory from Netlify environment
    const publishDir = process.env.PUBLISH_DIR || '.next';
    
    // Check each potentially problematic file
    let fixedCount = 0;
    problematicFiles.forEach(file => {
      // Check in various possible locations
      const locations = [
        path.join(publishDir, 'server', file),
        path.join(publishDir, 'static', file),
        path.join(publishDir, file)
      ];
      
      locations.forEach(location => {
        if (ensureFileExists(location, '// Auto-generated empty file')) {
          fixedCount++;
        }
      });
    });
    
    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} missing files`);
    } else {
      console.log('✅ No files needed fixing');
    }
  }
}; 