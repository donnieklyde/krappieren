import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // We need to export authOptions from valid route

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;
        const { searchParams } = new URL(request.url);
        const isSticky = searchParams.get('sticky') === 'true';

        let where = {};
        if (session?.user?.languages) {
            const userLangs = session.user.languages;
            // userLangs example: { english: true, german: false }
            // Filter keys where value is true
            const enabledLangs = Object.keys(userLangs).filter(lang => userLangs[lang]);

            if (enabledLangs.length > 0) {
                where.language = { in: enabledLangs };
            }
        }

        const username = searchParams.get('username');
        if (username) {
            where.author = { username: username };
            // If filtering by user, we might want to ignore language filter? 
            // Usually valid to see all posts from a user regardless of language settings if explicitly visiting profile.
            // Let's remove language constraint if username is present.
            delete where.language;
        }

        const posts = await prisma.post.findMany({
            where,
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

        // Sticky Logic: Latest post from 'donnieklyde' always first
        // Only apply if requested (e.g. initial load)
        let finalPosts = [...posts];

        if (isSticky) {
            const stickyIndex = finalPosts.findIndex(p => p.author.username === 'donnieklyde');
            let stickyPost = null;

            if (stickyIndex !== -1) {
                stickyPost = finalPosts.splice(stickyIndex, 1)[0];
            } else {
                const sticky = await prisma.post.findFirst({
                    where: { author: { username: 'donnieklyde' }, ...where },
                    include: {
                        author: { select: { name: true, username: true, image: true } },
                        comments: { include: { author: { select: { username: true } } } },
                        likes: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                if (sticky) stickyPost = sticky;
            }
            if (stickyPost) {
                finalPosts.unshift(stickyPost);
            }
        }

        // Transform to match frontend format if needed
        const formattedPosts = finalPosts.map(p => ({
            id: p.id,
            content: p.content,
            username: p.author.username || p.author.name || 'Anonymous',
            avatarUrl: p.author.image,
            likes: p.likes.length,
            comments: p.comments.map(c => ({
                id: c.id,
                text: c.text,
                user: c.author.username || 'Anonymous'
            })),
            likedByMe: currentUserId ? p.likes.some(l => l.userId === currentUserId) : false,
            language: p.language
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

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
        }

        if (content.length > 280) { // Standard tweet limit, or 500? I'll stick to a reasonable max. User didn't specify, likely short.
            return NextResponse.json({ error: 'Post too long (max 280 chars)' }, { status: 400 });
        }

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
