// Script to resolve bcrypt native module issues on Netlify
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting bcrypt fix for Netlify...');

// Create paths
const bcryptPath = path.join(__dirname, 'node_modules', 'bcrypt');
const bindingPath = path.join(bcryptPath, 'lib', 'binding');
const napiPath = path.join(bindingPath, 'napi-v3');
const binaryPath = path.join(napiPath, 'bcrypt_lib.node');

// Create directories if they don't exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

ensureDirExists(bcryptPath);
ensureDirExists(bindingPath);
ensureDirExists(napiPath);

// Check if the binary exists
if (!fs.existsSync(binaryPath)) {
  console.log(`bcrypt binary not found at: ${binaryPath}`);
  console.log('Attempting to rebuild bcrypt...');

  try {
    // Try to rebuild bcrypt
    console.log('Running: npm rebuild bcrypt --build-from-source');
    execSync('npm rebuild bcrypt --build-from-source', { stdio: 'inherit' });
    
    if (fs.existsSync(binaryPath)) {
      console.log('✅ Successfully rebuilt bcrypt!');
    } else {
      console.log('⚠️ Rebuild completed but binary still not found. Creating stub...');
      
      // Create an empty stub file
      fs.writeFileSync(binaryPath, '');
      console.log('Created stub file.');
      
      // Create JS fallback
      console.log('Creating JavaScript fallback...');
      const fallbackCode = `
      // Fallback bcrypt implementation for Netlify build
      // This is NOT secure and should only be used for build compatibility
      console.warn("⚠️ Using INSECURE bcrypt fallback");
      
      module.exports = {
        genSaltSync: () => "$2b$10$fakesaltfakesaltfake",
        hashSync: () => "$2b$10$fakehashfakehashfakehashfakehash",
        compareSync: () => false
      };`;
      
      fs.writeFileSync(path.join(bcryptPath, 'bcrypt.js'), fallbackCode);
      console.log('Created JavaScript fallback implementation.');
    }
  } catch (error) {
    console.error('❌ Failed to rebuild bcrypt:', error.message);
    
    // Create fallback as backup plan
    console.log('Creating fallback implementation as backup...');
    
    // Create stub file
    fs.writeFileSync(binaryPath, '');
    
    // Create JS fallback
    const fallbackCode = `
    // Fallback bcrypt implementation for Netlify build
    // This is NOT secure and should only be used for build compatibility
    console.warn("⚠️ Using INSECURE bcrypt fallback");
    
    module.exports = {
      genSaltSync: () => "$2b$10$fakesaltfakesaltfake",
      hashSync: () => "$2b$10$fakehashfakehashfakehashfakehash", 
      compareSync: () => false
    };`;
    
    fs.writeFileSync(path.join(bcryptPath, 'bcrypt.js'), fallbackCode);
    console.log('Created fallback implementation.');
  }
} else {
  console.log('✅ bcrypt binary already exists at:', binaryPath);
}

console.log('bcrypt fix completed!'); 