import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { username, languages } = body;

        // Basic validation
        if (!username || !languages) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Update user in DB
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                username,
                languages,
                isOnboarded: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
