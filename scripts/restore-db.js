const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restore() {
    console.log('Starting restore...');
    const backupPath = path.join(__dirname, '../backup.json');

    if (!fs.existsSync(backupPath)) {
        console.error('No backup.json found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    try {
        // 1. Users needed first
        console.log(`Restoring ${data.users.length} Users...`);
        for (const u of data.users) {
            await prisma.user.create({ data: u });
        }

        // 2. Independent tables
        if (data.verificationTokens) {
            console.log(`Restoring ${data.verificationTokens.length} VerificationTokens...`);
            for (const vt of data.verificationTokens) {
                await prisma.verificationToken.create({ data: vt });
            }
        }

        if (data.bannedUsers) {
            console.log(`Restoring ${data.bannedUsers.length} BannedUsers...`);
            for (const bu of data.bannedUsers) {
                await prisma.bannedUser.create({ data: bu });
            }
        }

        // 3. User related tables (Accounts, Sessions)
        if (data.accounts) {
            console.log(`Restoring ${data.accounts.length} Accounts...`);
            for (const a of data.accounts) {
                await prisma.account.create({ data: a });
            }
        }

        if (data.sessions) {
            console.log(`Restoring ${data.sessions.length} Sessions...`);
            for (const s of data.sessions) {
                await prisma.session.create({ data: s });
            }
        }

        // 4. Social Graph (Follows)
        if (data.follows) {
            console.log(`Restoring ${data.follows.length} Follows...`);
            for (const f of data.follows) {
                await prisma.follow.create({ data: f });
            }
        }

        // 5. User Messages
        if (data.messages) {
            console.log(`Restoring ${data.messages.length} Messages...`);
            for (const m of data.messages) {
                await prisma.message.create({ data: m });
            }
        }

        // 6. Posts (needs Author)
        console.log(`Restoring ${data.posts.length} Posts...`);
        for (const p of data.posts) {
            await prisma.post.create({ data: p });
        }

        // 7. Comments (needs Post + Author)
        // Beware of self-referencing comments (replies). Need to insert parents first?
        // Prisma might handle this if we blindly insert, but if a comment replies to a later comment (unlikely in time order), it fails.
        // If we sort by ID, it should be fine as ID implies order.
        if (data.comments) {
            console.log(`Restoring ${data.comments.length} Comments...`);
            // Sort by ID to ensure parents exist
            data.comments.sort((a, b) => a.id - b.id);
            for (const c of data.comments) {
                await prisma.comment.create({ data: c });
            }
        }

        // 8. Likes (Post + User)
        if (data.likes) {
            console.log(`Restoring ${data.likes.length} Likes...`);
            for (const l of data.likes) {
                await prisma.like.create({ data: l });
            }
        }

        // 9. CommentLikes
        if (data.commentLikes) {
            console.log(`Restoring ${data.commentLikes.length} CommentLikes...`);
            for (const cl of data.commentLikes) {
                await prisma.commentLike.create({ data: cl });
            }
        }

        console.log('Restore completed successfully.');

    } catch (e) {
        console.error('Restore failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

restore();
