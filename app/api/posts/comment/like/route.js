import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { commentId } = await req.json();

        // Check if already liked
        const existingLike = await prisma.commentLike.findFirst({
            where: {
                commentId: commentId,
                userId: session.user.id
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.commentLike.delete({
                where: { id: existingLike.id }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.commentLike.create({
                data: {
                    commentId: commentId,
                    userId: session.user.id
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle comment like' }, { status: 500 });
    }
}
