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
        const { postId, text, replyTo } = await req.json();

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
        }

        if (text.length > 280) {
            return NextResponse.json({ error: 'Comment too long (max 280 chars)' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                postId,
                authorId: session.user.id,
                // replyTo logic if schema supports it, for now just text
            },
            include: {
                author: { select: { username: true } }
            }
        });

        return NextResponse.json({
            id: comment.id,
            text: comment.text,
            user: comment.author.username,
            replyTo // Pass back for frontend context
        });
    } catch (error) {
        // Silent error handling for production
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
