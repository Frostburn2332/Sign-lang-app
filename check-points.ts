
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
