import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;
        const { username } = await params;
        const targetUsername = decodeURIComponent(username);

        // Find target user ID
        const targetUser = await prisma.user.findUnique({
            where: { username: targetUsername }
        });

        if (!targetUser) {
            return NextResponse.json([], { status: 404 });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: targetUser.id },
                    { senderId: targetUser.id, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: 100
        });

        // Mark as read
        // We really should mark messages where sender is target and receiver is me as read
        await prisma.message.updateMany({
            where: {
                senderId: targetUser.id,
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });

        // Format
        const formatted = messages.map(m => ({
            id: m.id,
            sender: m.senderId === userId ? 'currentUser' : targetUsername,
            text: m.text,
            timestamp: m.createdAt // or formatted
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Fetch History Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
