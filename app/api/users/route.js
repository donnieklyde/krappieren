import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this endpoint is never cached statically
export const revalidate = 0;

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: { username: true, name: true, image: true },
            orderBy: { username: 'asc' },
            take: 100 // Limit for now
        });

        // Ensure username exists, fallback to name or default
        const safeUsers = users.map(u => ({
            username: u.username || u.name?.replace(/\s+/g, '').toLowerCase() || `user${Math.floor(Math.random() * 1000)}`,
            avatar: u.image
        }));

        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
