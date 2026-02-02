const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
    console.log('Verifying Database Connection...');
    try {
        const userCount = await prisma.user.count();
        const postCount = await prisma.post.count();

        console.log('--- Database Stats ---');
        console.log(`Users: ${userCount}`);
        console.log(`Posts: ${postCount}`);

        // Check if empty
        if (userCount === 0) {
            console.log('WARNING: Database appears empty.');
        } else {
            console.log('SUCCESS: Database contains data.');
        }

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
