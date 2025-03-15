import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

// Make sure TypeScript correctly recognizes the global variable
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Ensure we use existing global prisma or create a new instance
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma 