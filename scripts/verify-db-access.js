const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasourceUrl: process.env.POSTGRES_URL // explicit connection string
});

async function main() {
    console.log("1. Starting Database Connection Test...");
    console.log("   URL:", process.env.POSTGRES_URL ? "Found (Starts with " + process.env.POSTGRES_URL.substring(0, 15) + "...)" : "MISSING");

    try {
        // 1. Try to fetch users count
        console.log("2. Attempting to read from 'User' table...");
        const userCount = await prisma.user.count();
        console.log(`   ✅ Success! Found ${userCount} users.`);

        // 2. Try to create a dummy user to verify write access
        console.log("3. Attempting to write a test user...");
        const testEmail = `test-${Date.now()}@example.com`;
        const newUser = await prisma.user.create({
            data: {
                email: testEmail,
                username: `testuser${Date.now()}`,
                name: "DB Connectivity Test User"
            }
        });
        console.log("   ✅ Success! Created user:", newUser.email);

        // 3. Clean up
        console.log("4. Cleaning up test user...");
        await prisma.user.delete({
            where: { id: newUser.id }
        });
        console.log("   ✅ Deleted test user.");

        console.log("\n⭐️ DATABASE CONNECTION IS WORKING PERFECTLY.");

    } catch (e) {
        console.error("\n❌ DATABASE ERROR:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
