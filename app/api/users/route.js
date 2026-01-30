import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this endpoint is never cached statically
export const revalidate = 0;

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let query = searchParams.get('query');
        console.log(`[API] Search Query Raw: "${query}"`);

        if (query) {
            query = query.trim(); // Trim whitespace first!
            if (query.startsWith('@')) {
                query = query.substring(1);
            }
        }
        console.log(`[API] Search Query Processed: "${query}"`);

        const where = query ? {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        } : {};

        const users = await prisma.user.findMany({
            where,
            select: { username: true, name: true, image: true },
            orderBy: { username: 'asc' },
            take: 100
        });

        console.log(`[API] Found ${users.length} users for query: "${query}"`);

        // Ensure username exists, fallback to name or default
        const safeUsers = users.map(u => ({
            username: u.username || u.name?.replace(/\s+/g, '').toLowerCase() || `user${Math.floor(Math.random() * 1000)}`,
            avatar: u.image
        }));

        const dbId = (process.env.POSTGRES_URL || "").slice(-4);

        return NextResponse.json({ users: safeUsers, dbId });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
