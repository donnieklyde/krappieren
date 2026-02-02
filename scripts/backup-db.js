const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
    console.log('Starting backup...');
    const data = {};

    try {
        // Order matters for restoration, but for backup we just get everything
        data.users = await prisma.user.findMany();
        data.posts = await prisma.post.findMany();
        data.comments = await prisma.comment.findMany();
        data.likes = await prisma.like.findMany();
        data.commentLikes = await prisma.commentLike.findMany();
        data.follows = await prisma.follow.findMany();
        data.messages = await prisma.message.findMany();
        data.accounts = await prisma.account.findMany();
        data.sessions = await prisma.session.findMany();
        data.verificationTokens = await prisma.verificationToken.findMany();
        data.bannedUsers = await prisma.bannedUser.findMany();

        const backupPath = path.join(__dirname, '../backup.json');
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`Backup saved to ${backupPath}`);
        console.log(`Stats:`);
        console.log(`- Users: ${data.users.length}`);
        console.log(`- Posts: ${data.posts.length}`);
        console.log(`- Comments: ${data.comments.length}`);
    } catch (e) {
        console.error('Backup failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

backup();
