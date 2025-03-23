/**
 * Improved script to find and fix Prisma imports
 * Works reliably in both local and Netlify environments
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

// Polyfill for fetch API objects in Node.js environment
if (typeof globalThis.Request === 'undefined') {
  try {
    // Try to load node-fetch if available
    const nodeFetch = require('node-fetch');
    globalThis.Request = nodeFetch.Request;
    globalThis.Response = nodeFetch.Response;
    globalThis.Headers = nodeFetch.Headers;
    globalThis.fetch = nodeFetch;
    console.log('✅ Added node-fetch polyfill in fix-imports.js');
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

console.log('🔍 Starting import path fixes...');

// Walk a directory and return all files of specified extensions
function walkDir(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return results;
}

// Fix prisma import paths in a file
function fixImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern for direct prisma imports
    const newContent = content
      // Fix "@/lib/prisma" imports
      .replace(
        /import\s+(\w+)\s+from\s+['"]@\/lib\/prisma['"];?/g, 
        `import { prisma as $1 } from '@/lib/prisma-export';`
      )
      // Fix "lib/prisma" imports (without @)
      .replace(
        /import\s+(\w+)\s+from\s+['"]lib\/prisma['"];?/g, 
        `import { prisma as $1 } from 'lib/prisma-export';`
      )
      // Fix "./lib/prisma" imports
      .replace(
        /import\s+(\w+)\s+from\s+['"]\.\/lib\/prisma['"];?/g, 
        `import { prisma as $1 } from './lib/prisma-export';`
      )
      // Fix destructured exports
      .replace(
        /import\s+\{\s*prisma\s*\}\s+from\s+['"]@\/lib\/prisma['"];?/g,
        `import { prisma } from '@/lib/prisma-export';`
      );
    
    // Only write if changes were made
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Try to use grep if available for efficiency,
// otherwise fallback to walkDir which works everywhere
function findAndFixPrismaImports() {
  try {
    // First, ensure prisma-export.ts exists in lib directory
    const libDir = path.join(__dirname, 'lib');
    const prismaExportPath = path.join(libDir, 'prisma-export.ts');
    
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }
    
    if (!fs.existsSync(prismaExportPath)) {
      const exportContent = `/**
 * This is a compatibility layer to export the Prisma client
 * with proper TypeScript types
 */
import { PrismaClient } from '@prisma/client';

// Import the implementation
// @ts-ignore - importing from JS file
import { prisma as prismaImpl } from './prisma.js';

// Export with proper typing
export const prisma: PrismaClient = prismaImpl;
export default prisma;`;
      
      fs.writeFileSync(prismaExportPath, exportContent);
      console.log(`✅ Created ${prismaExportPath}`);
    }
    
    // Try grep-based approach first
    console.log('Searching for files with Prisma imports using grep...');
    
    try {
      // Use grep to find files with prisma imports
      const command = `grep -r "import.*from ['\\\"].*prisma['\\\"]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/`;
      const result = execSync(command, { encoding: 'utf8' });
      
      if (result) {
        const lines = result.split('\n').filter(Boolean);
        console.log(`Found ${lines.length} files with potential prisma imports`);
        
        let fixedCount = 0;
        for (const line of lines) {
          const [filePath] = line.split(':');
          if (filePath && fs.existsSync(filePath)) {
            const fixed = fixImportsInFile(filePath);
            if (fixed) fixedCount++;
          }
        }
        
        console.log(`✅ Fixed imports in ${fixedCount} files using grep approach`);
        return;
      }
    } catch (error) {
      console.log('Grep approach failed, falling back to directory walk...');
    }
    
    // Fallback: walk directories and check each file
    console.log('Searching for files by walking directories...');
    
    const appDir = path.join(__dirname, 'app');
    if (fs.existsSync(appDir)) {
      const files = walkDir(appDir);
      console.log(`Found ${files.length} files to check for Prisma imports`);
      
      let fixedCount = 0;
      for (const file of files) {
        const fixed = fixImportsInFile(file);
        if (fixed) fixedCount++;
      }
      
      console.log(`✅ Fixed imports in ${fixedCount} files using directory walk`);
    } else {
      console.log('No app directory found, skipping import fixes');
    }
  } catch (error) {
    console.error('❌ Error fixing imports:', error.message);
  }
}

// Run the import fixer
findAndFixPrismaImports();

console.log('✅ Import path fixes completed'); 