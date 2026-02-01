import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const [followerCount, followingCount, posts, user] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } }),
            prisma.post.findMany({
                where: { authorId: userId },
                include: { likes: true }
            }),
            prisma.user.findUnique({ where: { id: userId }, select: { username: true, avatar: true, name: true, languages: true, bio: true, isOnboarded: true } })
        ]);

        const totalLikes = posts.reduce((acc, output) => acc + output.likes.length, 0);

        return NextResponse.json({
            followerCount,
            followingCount,
            netWorth: totalLikes,
            // Full profile data for client-side hydration
            username: user?.username,
            avatar: user?.avatar,
            name: user?.name,
            bio: user?.bio,
            languages: user?.languages,
            isOnboarded: user?.isOnboarded
        });

    } catch (error) {
        // Silent error handling for production
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
