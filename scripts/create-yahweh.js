const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createYahwehAccount() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('Songoku777', 10);

        // Check if YAHWEH already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: 'YAHWEH' }
        });

        if (existingUser) {
            console.log('YAHWEH account already exists. Updating password...');
            await prisma.user.update({
                where: { username: 'YAHWEH' },
                data: {
                    password: hashedPassword,
                    isOnboarded: true
                }
            });
            console.log('✅ YAHWEH password updated successfully!');
        } else {
            console.log('Creating new YAHWEH account...');
            await prisma.user.create({
                data: {
                    username: 'YAHWEH',
                    password: hashedPassword,
                    name: 'YAHWEH',
                    isOnboarded: true,
                    email: 'yahweh@krappieren.app' // Optional email
                }
            });
            console.log('✅ YAHWEH account created successfully!');
        }

        console.log('\nAccount Details:');
        console.log('Username: YAHWEH');
        console.log('Password: Songoku777');
        console.log('\nYou can now log in with these credentials.');

    } catch (error) {
        console.error('❌ Error creating YAHWEH account:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createYahwehAccount();
