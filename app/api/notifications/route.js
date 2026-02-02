import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ hasUnreadDMs: false, hasNewActivity: false, newActivities: [] });
    }

    try {
        const userId = session.user.id;

        // Unread DMs
        const unreadCount = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });

        // New Activity
        // We need 'lastReadActivity' from user. 
        // We assume it was added to schema. If not, this might fail or we return false.
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastReadActivity: true }
        });

        const lastRead = user?.lastReadActivity || new Date(0);

        // Get my post IDs
        const myPosts = await prisma.post.findMany({ where: { authorId: userId }, select: { id: true } });
        const postIds = myPosts.map(p => p.id);

        // Get new comments on my posts with details
        const newComments = await prisma.comment.findMany({
            where: {
                postId: { in: postIds },
                createdAt: { gt: lastRead },
                authorId: { not: userId } // Don't notify about own comments
            },
            include: {
                author: { select: { username: true } },
                post: { select: { content: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Limit to 5 most recent
        });

        // Get new followers with details
        const newFollowers = await prisma.follow.findMany({
            where: {
                followingId: userId,
                createdAt: { gt: lastRead }
            },
            include: {
                follower: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const hasNewActivity = (newComments.length + newFollowers.length) > 0;

        // Format activities for notifications
        const newActivities = [
            ...newComments.map(c => ({
                type: 'comment',
                username: c.author.username,
                text: c.text,
                postSnippet: c.post.content.substring(0, 50) + (c.post.content.length > 50 ? '...' : ''),
                createdAt: c.createdAt
            })),
            ...newFollowers.map(f => ({
                type: 'follow',
                username: f.follower.username,
                createdAt: f.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({
            hasUnreadDMs: unreadCount > 0,
            hasNewActivity,
            newActivities
        });

    } catch (error) {
        // Silent error handling for production
        // Fail gracefully
        return NextResponse.json({ hasUnreadDMs: false, hasNewActivity: false, newActivities: [] });
    }
}
