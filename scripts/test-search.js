const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function search(query) {
    console.log(`Searching for: "${query}"`);
    const where = query ? {
        OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } }
        ]
    } : {};

    try {
        const users = await prisma.user.findMany({
            where,
            select: { username: true, name: true }
        });
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(` - ${u.username} (${u.name})`));
    } catch (e) {
        console.error(e);
    }
}

async function main() {
    await search("");       // Should find all
    await search("we");     // Should find 'we125'
    await search("JUSTIN"); // Should find 'Justin Reichert' users
    await prisma.$disconnect();
}

main();
