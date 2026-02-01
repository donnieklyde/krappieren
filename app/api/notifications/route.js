import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ hasUnreadDMs: false, hasNewActivity: false });
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

        // Count new likes on my posts
        // 1. Get my post IDs
        const myPosts = await prisma.post.findMany({ where: { authorId: userId }, select: { id: true } });
        const postIds = myPosts.map(p => p.id);

        const newLikes = await prisma.like.count({
            where: {
                postId: { in: postIds },
                createdAt: { gt: lastRead }
            }
        });

        const newFollowers = await prisma.follow.count({
            where: {
                followingId: userId,
                createdAt: { gt: lastRead }
            }
        });

        const hasNewActivity = (newLikes + newFollowers) > 0;

        return NextResponse.json({
            hasUnreadDMs: unreadCount > 0,
            hasNewActivity
        });

    } catch (error) {
        // Silent error handling for production
        // Fail gracefully
        return NextResponse.json({ hasUnreadDMs: false, hasNewActivity: false });
    }
}
