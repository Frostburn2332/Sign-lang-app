import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
    // Add this line so Prisma CLI knows how to run migrations on Neon
    directUrl: process.env.DIRECT_URL, 
  },
});