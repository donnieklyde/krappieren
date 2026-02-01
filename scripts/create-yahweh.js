const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createYahwehAccount() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('Songoku777', 10);

        // Check if YAHWEH already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: 'yahweh' }
        });

        if (existingUser) {
            console.log('yahweh account already exists. Updating password...');
            await prisma.user.update({
                where: { username: 'yahweh' },
                data: {
                    password: hashedPassword,
                    isOnboarded: true
                }
            });
            console.log('✅ yahweh password updated successfully!');
        } else {
            console.log('Creating new yahweh account...');
            await prisma.user.create({
                data: {
                    username: 'yahweh',
                    password: hashedPassword,
                    name: 'yahweh',
                    isOnboarded: true,
                    email: 'yahweh@krappieren.app' // Optional email
                }
            });
            console.log('✅ yahweh account created successfully!');
        }

        console.log('\nAccount Details:');
        console.log('Username: yahweh');
        console.log('Password: Songoku777');
        console.log('\nYou can now log in with these credentials.');

    } catch (error) {
        console.error('❌ Error creating YAHWEH account:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createYahwehAccount();
