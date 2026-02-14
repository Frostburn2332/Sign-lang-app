
import { PrismaClient } from '@prisma/client'

// Prisma 7 requires the URL to be passed in the constructor
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: 'Test' } },
                    { email: { contains: 'test' } }
                ]
            },
            include: {
                learningProgress: true
            }
        });
        console.log('Found users:', users.length);
        users.forEach(u => {
            console.log(`User: ${u.name} (${u.email})`);
            console.log(`ID: ${u.id}`);
            console.log(`Points: ${u.points}`);
            console.log(`Progress count: ${u.learningProgress.length}`);
            console.log('---');
        });
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
