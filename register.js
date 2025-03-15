// Register hook for Node.js to apply browser globals
console.log('📦 Registering browser globals polyfill for Node.js...');

// Immediately apply the browser globals
require('./browser-globals');

// This file will be used with the --require flag to ensure globals are loaded first
console.log('✅ Browser globals registered successfully!');

// No exports needed - this file is only for side effects
module.exports = {}; 