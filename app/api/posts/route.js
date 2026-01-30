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
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { content, language } = await req.json();

        const post = await prisma.post.create({
            data: {
                content,
                authorId: session.user.id,
                language // e.g., 'english' or 'german'
            },
            include: {
                author: {
                    select: { name: true, username: true, image: true }
                }
            }
        });

        // Format for frontend
        const formattedPost = {
            id: post.id,
            content: post.content,
            username: post.author.username || post.author.name || 'Anonymous',
            avatarUrl: post.author.image,
            time: "Just now",
            likes: 0,
            replies: 0,
            comments: [],
            likedByMe: false,
            language: post.language
        };

        return NextResponse.json(formattedPost);
    } catch (error) {
        console.error("Create Post Error:", error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
