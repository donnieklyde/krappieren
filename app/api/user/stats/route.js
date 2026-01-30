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

        const [followerCount, followingCount, posts] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } }),
            prisma.post.findMany({
                where: { authorId: userId },
                include: { likes: true }
            })
        ]);

        const totalLikes = posts.reduce((acc, output) => acc + output.likes.length, 0);

        return NextResponse.json({
            followerCount,
            followingCount,
            netWorth: totalLikes
        });

    } catch (error) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
