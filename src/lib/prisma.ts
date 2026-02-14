import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Prisma 7 requirement: explicitly pass the URL
    datasourceUrl: process.env.DATABASE_URL,
  })
}

declare global {
  // This prevents multiple instances of Prisma Client in development
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma