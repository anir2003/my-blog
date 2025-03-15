// Script to find and fix Prisma imports
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for files that import from lib/prisma...');

try {
  // Get list of files with imports
  const result = execSync(`grep -r "import.*from ['\\\"]@/lib/prisma['\\\"]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/`).toString();
  
  // Process each line
  const lines = result.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    const [filePath, ...rest] = line.split(':');
    
    if (!filePath) continue;
    
    console.log(`Processing ${filePath}...`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    const newContent = content.replace(
      /import\s+(\w+)\s+from\s+['"]@\/lib\/prisma['"];?/g, 
      `import { prisma as $1 } from '@/lib/prisma-export';`
    );
    
    // Write updated content
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${filePath}`);
    }
  }
  
  console.log('✅ Completed import updates');
} catch (error) {
  // If grep doesn't find any matches, it will exit with code 1
  if (!error.message.includes('grep')) {
    console.error('❌ Error updating imports:', error.message);
  } else {
    console.log('✅ No more files found that need updating');
  }
} 