// Script to find and fix Prisma imports in JavaScript files
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for JavaScript files that import from lib/prisma...');

try {
  // Get list of files with imports
  const result = execSync(`grep -r "import.*from ['\\\"]@/lib/prisma['\\\"]" --include="*.js" --include="*.jsx" app/`).toString();
  
  // Process each line
  const lines = result.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    const [filePath, ...rest] = line.split(':');
    
    if (!filePath) continue;
    
    console.log(`Processing ${filePath}...`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import for JS files
    const newContent = content.replace(
      /import\s+(\w+)\s+from\s+['"]@\/lib\/prisma['"];?/g, 
      `import { prisma as $1 } from '@/lib/prisma.js';`
    );
    
    // Write updated content
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${filePath}`);
    }
  }
  
  console.log('✅ Completed JavaScript import updates');
} catch (error) {
  // If grep doesn't find any matches, it will exit with code 1
  if (!error.message.includes('grep')) {
    console.error('❌ Error updating imports:', error.message);
  } else {
    console.log('✅ No more JavaScript files found that need updating');
  }
} 