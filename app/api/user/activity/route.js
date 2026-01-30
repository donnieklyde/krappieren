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
            where: { postId: { in: postIds } },
            include: {
                user: { select: { username: true } }
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
                timestamp: new Date(like.createdAt).getTime()
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

        // Sort by timestamp desc
        activities.sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json(activities);

    } catch (error) {
        console.error("Fetch Activity Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
