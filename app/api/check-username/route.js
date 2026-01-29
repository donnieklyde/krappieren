import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        // Return true if taken, false if available
        return NextResponse.json({ taken: !!user });
    } catch (error) {
        console.error("Check username error:", error);
        // Fail safe: return taken if DB fails to prevent collisions, or loose?
        // Let's return error status
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
