const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportToText() {
    try {
        console.log('Fetching all posts from database...');

        // Fetch all posts with their comments, ordered by oldest first
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { username: true, name: true }
                },
                comments: {
                    include: {
                        author: {
                            select: { username: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' } // Comments oldest first
                }
            },
            orderBy: { createdAt: 'asc' } // Posts oldest first
        });

        console.log(`Found ${posts.length} posts. Formatting...`);

        // Build the text content
        let textContent = '================================================================================\n';
        textContent += '                    KRAPPIEREN - COMPLETE POST ARCHIVE\n';
        textContent += '                    Exported on: ' + new Date().toISOString() + '\n';
        textContent += '================================================================================\n\n';

        posts.forEach((post, index) => {
            const username = post.author.username || post.author.name || 'Anonymous';
            const date = post.createdAt.toISOString();

            textContent += '================================================================================\n';
            textContent += `POST #${post.id} - ${username} - ${date}\n`;
            textContent += '================================================================================\n';
            textContent += post.content + '\n\n';

            if (post.comments.length > 0) {
                textContent += '  Comments:\n';
                post.comments.forEach(comment => {
                    const commentUsername = comment.author.username || comment.author.name || 'Anonymous';
                    const commentDate = comment.createdAt.toISOString();
                    textContent += `  - ${commentUsername} (${commentDate}): ${comment.text}\n`;
                });
                textContent += '\n';
            } else {
                textContent += '  No comments\n\n';
            }

            textContent += '---\n\n';
        });

        textContent += '\n================================================================================\n';
        textContent += `                    END OF ARCHIVE - Total Posts: ${posts.length}\n`;
        textContent += '================================================================================\n';

        // Write to file
        const outputPath = path.join(process.cwd(), 'export.txt');
        fs.writeFileSync(outputPath, textContent, 'utf8');

        console.log(`\n✅ Export complete!`);
        console.log(`📄 File saved to: ${outputPath}`);
        console.log(`📊 Total posts exported: ${posts.length}`);

        const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
        console.log(`💬 Total comments exported: ${totalComments}`);

    } catch (error) {
        console.error('Error exporting posts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportToText();
