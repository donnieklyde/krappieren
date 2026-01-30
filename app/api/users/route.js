import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic'; // Ensure this endpoint is never cached statically
export const revalidate = 0;

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let query = searchParams.get('query');

        if (query) {
            if (query.length > 50) {
                query = query.substring(0, 50); // Truncate overly long queries
            }
            query = query.trim();
            if (query.startsWith('@')) {
                query = query.substring(1);
            }
        }


        const where = query ? {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        } : {};

        // Force exact username match if it looks like a username
        if (query && query.length < 20 && !query.includes('@')) {
            where.OR.push({ username: { equals: query, mode: 'insensitive' } });
        }

        // Ensure we only get users with usernames (crucial for DMs)
        where.username = { not: null };

        const users = await prisma.user.findMany({
            where,
            select: {
                username: true,
                name: true,
                image: true,
                bio: true,
                _count: {
                    select: { followers: true }
                }
            },
            orderBy: { username: 'asc' },
            take: 300
        });

        // Map users
        const safeUsers = users.map(u => ({
            username: u.username,
            name: u.name,
            avatar: u.image,
            bio: u.bio,
            slaveCount: u._count.followers
        }));

        return NextResponse.json({ users: safeUsers });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
