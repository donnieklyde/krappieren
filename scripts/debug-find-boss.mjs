
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Debugging Find a Boss ---");

    // 1. Count total users
    const userCount = await prisma.user.count();
    console.log(`Total users in DB: ${userCount}`);

    if (userCount === 0) {
        console.warn("No users found in the database!");
        return;
    }

    // 2. Fetch first 5 users
    const users = await prisma.user.findMany({
        take: 5,
        select: { username: true, name: true, email: true }
    });
    console.log("First 5 users:", JSON.stringify(users, null, 2));

    // 3. Test a search query
    const searchQuery = "Justin"; // Try a specific query
    const results = await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: searchQuery, mode: 'insensitive' } },
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { email: { contains: searchQuery, mode: 'insensitive' } }
            ]
        },
        take: 5
    });
    console.log(`Search results for "${searchQuery}":`, JSON.stringify(results, null, 2));

    // 4. Test empty query (all users)
    const allUsers = await prisma.user.findMany({
        where: {},
        take: 5
    });
    console.log("Empty query results:", JSON.stringify(allUsers.map(u => u.username), null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
