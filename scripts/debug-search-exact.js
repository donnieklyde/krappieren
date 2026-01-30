const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSearch(rawInput) {
    let query = rawInput;
    if (query && query.startsWith('@')) {
        query = query.substring(1);
    }

    console.log(`Input: "${rawInput}" -> Processed Query: "${query}"`);

    const where = query ? {
        OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
        ]
    } : {};

    const users = await prisma.user.findMany({
        where,
        select: { username: true }
    });

    console.log(`Found: ${users.length} users`);
    users.forEach(u => console.log(JSON.stringify(u)));
}

async function main() {
    await testSearch("@RSHBKR");
    await testSearch("RSHBKR");
    await testSearch("@rshbkr");
}

main();
