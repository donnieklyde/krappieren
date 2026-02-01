const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function burnItAll() {
    try {
        console.log('🔥 INITIATING BURN PROTOCOL...');

        // Delete in order of dependencies (Child -> Parent)

        console.log('1. Deleting Follows...');
        await prisma.follow.deleteMany({});

        console.log('2. Deleting Messages...');
        await prisma.message.deleteMany({});

        console.log('3. Deleting Likes...');
        await prisma.like.deleteMany({});

        console.log('4. Deleting Comments...');
        await prisma.comment.deleteMany({});

        console.log('5. Deleting Posts...');
        await prisma.post.deleteMany({});

        console.log('6. Deleting Sessions, Accounts, VerificationTokens...');
        await prisma.session.deleteMany({});
        await prisma.account.deleteMany({});
        try {
            await prisma.verificationToken.deleteMany({});
        } catch (e) {
            console.log('   (VerificationToken deletion skipped or failed, likely empty)');
        }

        console.log('7. Deleting ALL Users...');
        await prisma.user.deleteMany({});

        console.log('🗑️  DATABASE BURNED TO THE GROUND.');

        // Recreating YAHWEH
        console.log('✨ Rising YAHWEH from the ashes...');

        const hashedPassword = await bcrypt.hash('Songoku777', 10);

        await prisma.user.create({
            data: {
                username: 'yahweh', // Lowercase as requested
                password: hashedPassword,
                name: 'yahweh',
                isOnboarded: true,
                email: 'yahweh@krappieren.app',
                image: `https://github.com/identicons/yahweh.png`
            }
        });

        console.log('✅ YAHWEH Restored.');
        console.log('Username: yahweh');
        console.log('Password: Songoku777');

    } catch (error) {
        console.error('❌ BURN PROTOCOL FAILED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

burnItAll();
