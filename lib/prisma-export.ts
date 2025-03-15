/**
 * This is a compatibility layer to export the Prisma client for TypeScript files
 * It re-exports the client from the JavaScript implementation but with TypeScript types
 */
import { PrismaClient } from '@prisma/client';

// Import the actual implementation
// @ts-ignore - importing from JS file
import { prisma as prismaImpl } from './prisma.js';

// Export with proper typing
export const prisma: PrismaClient = prismaImpl;
export default prisma; 