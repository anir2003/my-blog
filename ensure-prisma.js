// Script to ensure Prisma client files exist at the expected locations
console.log('🔍 Ensuring Prisma client files exist...');

// Apply browser globals if needed
try { 
  require('./browser-globals'); 
} catch (e) { 
  console.warn('⚠️ Browser globals not loaded:', e.message); 
}

const fs = require('fs');
const path = require('path');

// Function to create directories if they don't exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
    return true;
  }
  return false;
}

// Define paths where Prisma client files should be
const prismaPaths = {
  // Main Prisma client paths
  prismaDir: path.join(__dirname, 'node_modules', '.prisma'),
  clientDir: path.join(__dirname, 'node_modules', '.prisma', 'client'),
  
  // Main client files
  indexJs: path.join(__dirname, 'node_modules', '.prisma', 'client', 'index.js'),
  defaultJs: path.join(__dirname, 'node_modules', '.prisma', 'client', 'default.js'),
  
  // Prisma schema path
  schemaPath: path.join(__dirname, 'prisma', 'schema.prisma'),
  
  // Lib directory for our wrapper
  libDir: path.join(__dirname, 'lib'),
  prismaJsPath: path.join(__dirname, 'lib', 'prisma.js')
};

// Create necessary directories
ensureDirExists(prismaPaths.prismaDir);
ensureDirExists(prismaPaths.clientDir);
ensureDirExists(prismaPaths.libDir);

// Check schema exists
if (!fs.existsSync(prismaPaths.schemaPath)) {
  console.warn(`⚠️ Prisma schema not found at ${prismaPaths.schemaPath}`);
  
  // Create basic schema if it doesn't exist
  ensureDirExists(path.join(__dirname, 'prisma'));
  const basicSchema = `// Basic Prisma schema for build
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String
  role          String    @default("USER")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
`;
  fs.writeFileSync(prismaPaths.schemaPath, basicSchema);
  console.log(`✅ Created basic schema at ${prismaPaths.schemaPath}`);
}

// Create stub Prisma client files if they don't exist
if (!fs.existsSync(prismaPaths.indexJs)) {
  const stubClientJs = `// Stub Prisma client for build
function makeStubClass() {
  return class PrismaClient {
    constructor() {
      this.user = {
        findUnique: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        create: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        update: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        delete: () => Promise.resolve({id: 'stub-id'})
      };
      
      this.post = {
        findUnique: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        create: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        update: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        delete: () => Promise.resolve({id: 'stub-id'})
      };
      
      this.media = {
        findUnique: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        create: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        update: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        delete: () => Promise.resolve({id: 'stub-id'})
      };
      
      // Required methods
      this.$connect = () => Promise.resolve();
      this.$disconnect = () => Promise.resolve();
    }
  };
}

const PrismaClient = makeStubClass();
module.exports = {
  PrismaClient
};`;

  fs.writeFileSync(prismaPaths.indexJs, stubClientJs);
  console.log(`✅ Created stub Prisma client at ${prismaPaths.indexJs}`);
}

// Create default.js if it doesn't exist
if (!fs.existsSync(prismaPaths.defaultJs)) {
  const defaultJs = `// Default Prisma client export
const { PrismaClient } = require('./index.js');
module.exports = new PrismaClient();`;

  fs.writeFileSync(prismaPaths.defaultJs, defaultJs);
  console.log(`✅ Created default.js at ${prismaPaths.defaultJs}`);
}

// Create a robust prisma.js wrapper if it doesn't exist
if (!fs.existsSync(prismaPaths.prismaJsPath)) {
  const prismaJsContent = `// PrismaClient setup with fallbacks
try {
  // First try the standard import
  const { PrismaClient } = require('@prisma/client');
  
  // PrismaClient is attached to the 'global' object in development to prevent
  // exhausting your database connection limit
  const prismaGlobal = global;
  
  // Ensure we use existing global prisma or create a new instance
  const prisma = 
    prismaGlobal.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  
  // Save reference to the global variable
  if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;
  
  module.exports = { prisma };
} catch (error) {
  console.warn('Standard Prisma import failed, trying alternative paths:', error.message);
  
  try {
    // Try loading directly from the .prisma directory
    const { PrismaClient } = require('../node_modules/.prisma/client');
    const prisma = new PrismaClient();
    module.exports = { prisma };
    console.log('Using alternative Prisma client path (.prisma/client)');
  } catch (alternativeError) {
    console.error('All Prisma client imports failed:', alternativeError.message);
    
    // Create an emergency stub implementation
    const prisma = {
      // Stub functions for basic operations
      user: {
        findUnique: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        create: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        update: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        delete: () => Promise.resolve({id: 'stub-id'})
      },
      post: {
        findUnique: () => Promise.resolve(null),
        findMany: () => Promise.resolve([]),
        create: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        update: (data) => Promise.resolve({...data.data, id: 'stub-id'}),
        delete: () => Promise.resolve({id: 'stub-id'})
      },
      // Add more stub implementations as needed
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve()
    };
    
    module.exports = { prisma };
    console.warn('⚠️ Using emergency stub Prisma client. Database operations will not work correctly.');
  }
}`;

  fs.writeFileSync(prismaPaths.prismaJsPath, prismaJsContent);
  console.log(`✅ Created robust Prisma client wrapper at ${prismaPaths.prismaJsPath}`);
}

// Try to generate Prisma client if possible
try {
  const { execSync } = require('child_process');
  console.log('Attempting to generate Prisma client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' });
  console.log('✅ Successfully generated Prisma client');
} catch (error) {
  console.warn('⚠️ Could not generate Prisma client, but stub files were created:', error.message);
}

console.log('✅ Finished ensuring Prisma client files'); 