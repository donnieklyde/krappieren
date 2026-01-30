import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { targetUsername } = await req.json();

        // Get target user ID
        const targetUser = await prisma.user.findFirst({
            where: { username: targetUsername } // Assuming we follow by username
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (targetUser.id === session.user.id) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        // Check if already following
        const existingFollow = await prisma.follow.findFirst({
            where: {
                followerId: session.user.id,
                followingId: targetUser.id
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: { id: existingFollow.id }
            });
            return NextResponse.json({ following: false });
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId: session.user.id,
                    followingId: targetUser.id
                }
            });
            return NextResponse.json({ following: true });
        }
    } catch (error) {
        console.error("Follow API Error:", error);
        return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
    }
}
