/**
 * Netlify compatibility script
 * This file is used to create any necessary files or configurations
 * for Netlify deployment of the Next.js application.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Running Netlify compatibility script...');

// Create _redirects file for Netlify to ensure proper routing
const redirectsContent = `
# Netlify redirects file
# Created by netlify.js compatibility script

# Next.js handles routing via its own middleware, send everything there
/*    /.netlify/functions/next_js_build    200

# SPA fallback for any other routes
/*    /index.html    200
`;

const redirectsPath = path.join(__dirname, 'public', '_redirects');

// Ensure public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

// Write the redirects file
fs.writeFileSync(redirectsPath, redirectsContent.trim());
console.log(`✅ Created ${redirectsPath}`);

// Check if we need to fix package.json
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);
  
  // Check if we have the right build command
  if (
    packageJson.scripts && 
    packageJson.scripts['netlify-build'] !== 
    'node fix-bcrypt-standalone.js && node prisma-generate.js && node fix-imports.js && next build'
  ) {
    packageJson.scripts['netlify-build'] = 
      'node fix-bcrypt-standalone.js && node prisma-generate.js && node fix-imports.js && next build';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated netlify-build script in package.json');
  }
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

console.log('✅ Netlify compatibility setup completed!'); 