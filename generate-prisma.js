// Script to generate Prisma client without TypeScript errors
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Prisma client generation...');

try {
  // Run prisma generate command
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Verify the generated client exists
  const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'index.js');
  
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Prisma client generated successfully!');
  } else {
    console.error('❌ Prisma client generation may have failed. Client not found at expected path.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
} 