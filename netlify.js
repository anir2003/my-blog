/**
 * Netlify compatibility script
 * This file is used to create any necessary files or configurations
 * for Netlify deployment of the Next.js application.
 */

const fs = require('fs');
const path = require('path');

// Polyfill for fetch API objects in Node.js environment
if (typeof globalThis.Request === 'undefined') {
  try {
    // Try to load node-fetch if available
    const nodeFetch = require('node-fetch');
    globalThis.Request = nodeFetch.Request;
    globalThis.Response = nodeFetch.Response;
    globalThis.Headers = nodeFetch.Headers;
    globalThis.fetch = nodeFetch;
    console.log('✅ Added node-fetch polyfill');
  } catch (e) {
    // Provide minimal implementations if node-fetch is not available
    console.log('⚠️ node-fetch not available, creating minimal Request polyfill');
    
    // Basic implementation of Request
    globalThis.Request = class Request {
      constructor(input, init = {}) {
        this.url = input;
        this.method = init.method || 'GET';
        this.headers = init.headers || {};
        this.body = init.body || null;
      }
    };
    
    // Basic implementation of Response
    globalThis.Response = class Response {
      constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
        this.statusText = init.statusText || '';
        this.headers = init.headers || {};
      }
      
      json() {
        return Promise.resolve(JSON.parse(this.body));
      }
      
      text() {
        return Promise.resolve(String(this.body));
      }
    };
    
    // Basic implementation of Headers
    globalThis.Headers = class Headers {
      constructor(init = {}) {
        this._headers = {};
        Object.keys(init).forEach(key => {
          this._headers[key.toLowerCase()] = init[key];
        });
      }
      
      get(name) {
        return this._headers[name.toLowerCase()] || null;
      }
      
      set(name, value) {
        this._headers[name.toLowerCase()] = value;
      }
    };
  }
}

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
  
  // Make sure node-fetch is in dependencies
  if (!packageJson.dependencies['node-fetch']) {
    console.log('⚠️ Adding node-fetch to package.json');
    packageJson.dependencies['node-fetch'] = "^2.7.0";
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added node-fetch to dependencies');
    
    // Try to install node-fetch immediately
    try {
      const { execSync } = require('child_process');
      execSync('npm install --no-save node-fetch@2.7.0', { stdio: 'inherit' });
      console.log('✅ Installed node-fetch');
    } catch (err) {
      console.log('⚠️ Could not install node-fetch immediately, will be installed during build');
    }
  }
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

console.log('✅ Netlify compatibility setup completed!'); 