import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // We need to export authOptions from valid route

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { name: true, username: true, image: true }
                },
                comments: {
                    include: { author: { select: { username: true } } }
                },
                likes: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Transform to match frontend format if needed
        const formattedPosts = posts.map(p => ({
            id: p.id,
            content: p.content,
            username: p.author.username || p.author.name || 'Anonymous',
            avatarUrl: p.author.image,
            likes: p.likes.length,
            comments: p.comments.map(c => ({
                id: c.id,
                text: c.text,
                user: c.author.username || 'Anonymous'
            }))
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(req) {
    // Create post logic here
    return NextResponse.json({ status: 'Not implemented yet' });
}
