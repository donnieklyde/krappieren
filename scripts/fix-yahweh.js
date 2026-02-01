const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixYahwehDuplicates() {
    try {
        console.log('🔍 checking for yahweh duplicates...');

        // Find all users with username 'yahweh' or 'YAHWEH'
        const duplicates = await prisma.user.findMany({
            where: {
                username: {
                    in: ['yahweh', 'YAHWEH', 'Yahweh'],
                    mode: 'insensitive'
                }
            }
        });

        if (duplicates.length === 0) {
            console.log("No duplicates found. Proceeding to create if missing...");
        } else {
            console.log(`Found ${duplicates.length} 'yahweh' account(s). Terminating them...`);
            const userIds = duplicates.map(u => u.id);

            // 1. Find all Posts by these users
            const userPosts = await prisma.post.findMany({
                where: { authorId: { in: userIds } },
                select: { id: true }
            });
            const postIds = userPosts.map(p => p.id);
            console.log(`- Found ${postIds.length} posts by these users.`);

            if (postIds.length > 0) {
                console.log('  - Deleting comments on these posts...');
                // First delete replies (comments that reply to other comments on these posts)
                // Simplest is to just delete all comments on these posts. If self-referencing replies exist, might need retry or raw query.
                // Trying deleteMany directly usually works if there's no strict self-referencing restrict on delete.
                await prisma.comment.deleteMany({ where: { postId: { in: postIds } } });

                console.log('  - Deleting likes on these posts...');
                await prisma.like.deleteMany({ where: { postId: { in: postIds } } });

                console.log('  - Deleting the posts...');
                await prisma.post.deleteMany({ where: { id: { in: postIds } } });
            }

            // 2. Delete comments written BY these users (on other people's posts)
            console.log('- Deleting comments written by users...');
            await prisma.comment.deleteMany({ where: { authorId: { in: userIds } } });

            // 3. Delete likes written BY these users
            console.log('- Deleting likes written by users...');
            await prisma.like.deleteMany({ where: { userId: { in: userIds } } });

            // 4. Delete followers/following (if any)
            console.log('- Deleting follows...');
            await prisma.follow.deleteMany({
                where: {
                    OR: [
                        { followerId: { in: userIds } },
                        { followingId: { in: userIds } }
                    ]
                }
            });

            // 5. Delete messages (sent and received)
            console.log('- Deleting messages...');
            await prisma.message.deleteMany({
                where: {
                    OR: [
                        { senderId: { in: userIds } },
                        { receiverId: { in: userIds } }
                    ]
                }
            });

            // 6. Delete Sessions and Accounts (NextAuth)
            console.log('- Deleting sessions and accounts...');
            await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
            await prisma.account.deleteMany({ where: { userId: { in: userIds } } });

            // 7. Delete the users
            console.log('- Deleting the users...');
            const deleteResult = await prisma.user.deleteMany({
                where: { id: { in: userIds } }
            });
            console.log(`💥 Terminated ${deleteResult.count} account(s).`);
        }

        // Create the One True Yahweh
        console.log('✨ Creating the One True Yahweh...');

        // Final check to be sure
        const check = await prisma.user.findUnique({ where: { username: 'yahweh' } });
        if (check) {
            console.log("Wait, yahweh still exists? Deleting again...");
            await prisma.user.delete({ where: { username: 'yahweh' } });
        }

        const hashedPassword = await bcrypt.hash('Songoku777', 10);

        await prisma.user.create({
            data: {
                username: 'yahweh',
                password: hashedPassword,
                name: 'yahweh',
                isOnboarded: true,
                email: 'yahweh@krappieren.app', // Optional email
                image: `https://github.com/identicons/yahweh.png`
            }
        });

        console.log('✅ Single yahweh account created successfully!');
        console.log('Username: yahweh');
        console.log('Password: Songoku777');

    } catch (error) {
        console.error('❌ Error fixing duplicates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixYahwehDuplicates();
