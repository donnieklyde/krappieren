const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up database...');

    // Delete in order of dependency
    await prisma.message.deleteMany({});
    console.log('Deleted Messages');

    await prisma.like.deleteMany({});
    console.log('Deleted Likes');

    await prisma.comment.deleteMany({});
    console.log('Deleted Comments');

    await prisma.post.deleteMany({});
    console.log('Deleted Posts');

    await prisma.follow.deleteMany({});
    console.log('Deleted Follows');

    await prisma.session.deleteMany({});
    console.log('Deleted Sessions');

    await prisma.account.deleteMany({});
    console.log('Deleted Accounts');

    await prisma.user.deleteMany({});
    console.log('Deleted Users');

    console.log('Database cleaned successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
