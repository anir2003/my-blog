// PrismaClient setup without TypeScript
const { PrismaClient } = require('@prisma/client');

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

// Use global prisma instance to avoid multiple connections
const prismaGlobal = global;

// Ensure we use existing global prisma or create a new instance
const prisma = 
  prismaGlobal.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Save reference to the global variable
if (process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma;

module.exports = { prisma }; 