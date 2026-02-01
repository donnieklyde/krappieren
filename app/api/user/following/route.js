import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json([]); // Return empty if not logged in
    }

    try {
        const following = await prisma.follow.findMany({
            where: { followerId: session.user.id },
            include: {
                following: { select: { username: true } }
            }
        });

        const usernames = following.map(f => f.following.username);
        return NextResponse.json(usernames);
    } catch (error) {
        // Silent error handling for production
        return NextResponse.json([], { status: 500 });
    }
}
