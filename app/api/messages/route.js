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
        const { toUser, text } = await req.json();
        const senderId = session.user.id;

        // Find receiver
        const receiver = await prisma.user.findUnique({
            where: { username: toUser }
        });

        if (!receiver) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const message = await prisma.message.create({
            data: {
                text,
                senderId,
                receiverId: receiver.id,
                isRead: false
            }
        });

        return NextResponse.json({
            id: message.id,
            sender: session.user.username,
            text: message.text,
            timestamp: "Just now",
            isMe: true
        });

    } catch (error) {
        // Silent error handling for production
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
