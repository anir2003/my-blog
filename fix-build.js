/**
 * Fix build script for Netlify deployment
 * Ensures that critical files exist after the build is complete
 */

const fs = require('fs');
const path = require('path');

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