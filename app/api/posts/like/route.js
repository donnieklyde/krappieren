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
        const { postId } = await req.json();

        // Check if already liked
        const existingLike = await prisma.like.findFirst({
            where: {
                postId: postId,
                userId: session.user.id
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    postId: postId,
                    userId: session.user.id
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("Like API Error:", error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
