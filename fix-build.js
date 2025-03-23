/**
 * Fix build script for Netlify deployment
 * Ensures that critical files exist after the build is complete
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
    console.log('✅ Added node-fetch polyfill in fix-build.js');
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

console.log('🔧 Running build fix script...');

// Ensure directories exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
    return true;
  }
  return false;
}

// Create a fallback index.html
const nextDir = path.join(__dirname, '.next');
ensureDirExists(nextDir);

// Create a basic index.html file in case everything else fails
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
  </style>
  <script>
    // Try to redirect to the proper page if this is a direct load of the fallback
    window.onload = function() {
      // Redirect after a short delay
      setTimeout(function() {
        window.location.href = '/';
      }, 2000);
    };
  </script>
</head>
<body>
  <div class="container">
    <h1>My Blog</h1>
    <p>Loading your content...</p>
    <p>If you're not redirected automatically, <a href="/">click here</a>.</p>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(nextDir, 'index.html'), indexHtml);
console.log('✅ Created fallback index.html');

console.log('✅ Build fix completed!'); 