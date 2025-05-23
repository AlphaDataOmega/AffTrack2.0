import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['warn', 'error'] // Only show warnings and errors
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 