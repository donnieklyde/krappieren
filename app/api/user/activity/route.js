import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json([]);
    }

    try {
        const userId = session.user.id;

        // Fetch Likes on my posts (Income)
        // We find posts authored by me, then find likes on them
        const myPosts = await prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true }
        });
        const postIds = myPosts.map(p => p.id);

        const incomeEvents = await prisma.like.findMany({
            where: {
                postId: { in: postIds },
                userId: { not: userId } // Exclude self-funding
            },
            include: {
                user: { select: { username: true } },
                post: { select: { content: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Fetch Comments (on my posts or replies to my comments)
        // 1. Get my comment IDs to check for replies
        const myComments = await prisma.comment.findMany({
            where: { authorId: userId },
            select: { id: true }
        });
        const myCommentIds = myComments.map(c => c.id);

        const incomingComments = await prisma.comment.findMany({
            where: {
                authorId: { not: userId }, // Exclude my own comments
                OR: [
                    { postId: { in: postIds } }, // Comments on my posts
                    { replyToId: { in: myCommentIds } } // Replies to my comments
                ]
            },
            include: {
                author: { select: { username: true } },
                post: { select: { content: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Fetch New Followers (Slaves)
        const newFollowers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Transform and Merge
        const activities = [];

        // Map Likes to 'Money'
        incomeEvents.forEach(like => {
            activities.push({
                id: `like-${like.id}`,
                type: 'money',
                user: like.user.username || 'Anonymous',
                amount: 1, // $1 per like for now
                time: like.createdAt,
                timestamp: new Date(like.createdAt).getTime(),
                context: like.post?.content,
                postId: like.postId
            });
        });

        // Map Followers to 'Slave'
        newFollowers.forEach(follow => {
            activities.push({
                id: `follow-${follow.id}`,
                type: 'slave',
                user: follow.follower.username || 'Anonymous',
                amount: 0,
                time: follow.createdAt,
                timestamp: new Date(follow.createdAt).getTime()
            });
        });

        // Map Comments
        incomingComments.forEach(comment => {
            activities.push({
                id: `comment-${comment.id}`,
                type: 'comment',
                user: comment.author.username || 'Anonymous',
                amount: 0,
                time: comment.createdAt,
                timestamp: new Date(comment.createdAt).getTime(),
                context: comment.text,
                postId: comment.postId
            });
        });

        // Sort by timestamp desc
        activities.sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json(activities);

    } catch (error) {
        // Silent error handling for production
        return NextResponse.json([], { status: 500 });
    }
}
