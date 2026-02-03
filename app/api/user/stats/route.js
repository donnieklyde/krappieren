import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const session = await getServerSession(authOptions);

    let targetUserId;

    try {
        if (username) {
            const user = await prisma.user.findFirst({
                where: { username: { equals: username, mode: 'insensitive' } }
            });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            targetUserId = user.id;
        } else if (session) {
            targetUserId = session.user.id;
        } else {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [followerCount, followingCount, posts, user] = await Promise.all([
            prisma.follow.count({ where: { followingId: targetUserId } }),
            prisma.follow.count({ where: { followerId: targetUserId } }),
            prisma.post.findMany({
                where: { authorId: targetUserId },
                include: { likes: true }
            }),
            prisma.user.findUnique({
                where: { id: targetUserId },
                select: { username: true, avatar: true, name: true, languages: true, bio: true, link: true, isOnboarded: true }
            })
        ]);

        // Calculate total likes from posts (and eventually comments if we track them per user efficiently)
        // For now, just post likes
        const totalLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);

        return NextResponse.json({
            followerCount,
            followingCount,
            netWorth: totalLikes,
            // Full profile data
            username: user?.username,
            avatar: user?.avatar,
            name: user?.name,
            bio: user?.bio,
            link: user?.link,
            languages: user?.languages,
            isOnboarded: user?.isOnboarded
        });

    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
