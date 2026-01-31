const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeDatabase() {
    console.log("Starting database wipe...");
    try {
        // Delete in order to respect foreign keys (child -> parent)

        console.log("Deleting Follows...");
        await prisma.follow.deleteMany();

        console.log("Deleting Likes...");
        await prisma.like.deleteMany();

        console.log("Deleting Comments...");
        await prisma.comment.deleteMany();

        console.log("Deleting Posts...");
        await prisma.post.deleteMany();

        console.log("Deleting Messages...");
        await prisma.message.deleteMany();

        console.log("Deleting Sessions...");
        await prisma.session.deleteMany();

        console.log("Deleting Accounts...");
        await prisma.account.deleteMany();

        console.log("Deleting VerificationTokens...");
        await prisma.verificationToken.deleteMany();

        console.log("Deleting Users...");
        await prisma.user.deleteMany();

        console.log("Database wiped successfully.");
    } catch (error) {
        console.error("Error wiping database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

wipeDatabase();
