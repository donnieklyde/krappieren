import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        await prisma.user.update({
            where: { id: userId },
            data: { lastReadActivity: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Mark Read Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
