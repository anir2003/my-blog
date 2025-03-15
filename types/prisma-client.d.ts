import { PrismaClient } from '@prisma/client';

// For the JavaScript implementation
declare module 'lib/prisma.js' {
  export const prisma: PrismaClient;
}

// For the TypeScript compatibility layer
declare module 'lib/prisma-export' {
  import { PrismaClient } from '@prisma/client';
  export const prisma: PrismaClient;
  export default prisma;
}

// For legacy imports from 'lib/prisma'
declare module 'lib/prisma' {
  import { PrismaClient } from '@prisma/client';
  const prisma: PrismaClient;
  export default prisma;
} 