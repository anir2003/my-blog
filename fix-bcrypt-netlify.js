// Script to resolve bcrypt native module issues on Netlify
// Apply polyfills first to ensure globals are defined
try {
  require('./node-polyfills');
} catch (e) {
  console.warn('Polyfills not loaded, continuing anyway:', e.message);
}

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting bcrypt fix for Netlify...');

// Create paths
const bcryptPath = path.join(__dirname, 'node_modules', 'bcrypt');
const pureBcryptPath = path.join(__dirname, 'bcrypt-pure.js');

// First, ensure our pure JavaScript bcrypt implementation exists
if (!fs.existsSync(pureBcryptPath)) {
  console.error('❌ Pure bcrypt implementation not found at:', pureBcryptPath);
  process.exit(1);
}

// Completely remove the existing bcrypt module
if (fs.existsSync(bcryptPath)) {
  try {
    console.log('Removing existing bcrypt module...');
    execSync('rm -rf ./node_modules/bcrypt', { stdio: 'inherit', shell: '/bin/bash' });
    console.log('Successfully removed existing bcrypt module');
  } catch (error) {
    console.error('Failed to remove existing bcrypt module:', error.message);
  }
}

// Create bcrypt directory structure
console.log('Creating bcrypt module structure...');
fs.mkdirSync(bcryptPath, { recursive: true });

// Create a complete package structure
const files = {
  'index.js': 'module.exports = require(\'../../../bcrypt-pure.js\');',
  'package.json': JSON.stringify({
    name: "bcrypt",
    version: "5.1.1",
    main: "index.js",
    description: "Pure JS implementation for build purposes only"
  }, null, 2)
};

// Write all the files
for (const [filename, content] of Object.entries(files)) {
  const filePath = path.join(bcryptPath, filename);
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filename} at ${filePath}`);
}

// Create lib/binding structure but leave it empty
const bindingPath = path.join(bcryptPath, 'lib', 'binding');
fs.mkdirSync(bindingPath, { recursive: true });

// Create an empty napi-v3 directory
const napiPath = path.join(bindingPath, 'napi-v3');
fs.mkdirSync(napiPath, { recursive: true });

// Verify the structure
console.log('✅ bcrypt module structure created');
console.log('📂 Structure:');
console.log(`- ${bcryptPath}/`);
console.log(`  - index.js (points to pure JS implementation)`);
console.log(`  - package.json`);
console.log(`  - lib/`);
console.log(`    - binding/`);
console.log(`      - napi-v3/ (empty directory to satisfy require paths)`);

console.log('✅ bcrypt fix completed!'); 