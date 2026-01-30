import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Fetch recent messages involving the user
        // We want to group by conversation partner.
        // Prisma doesn't support complex grouping easily. We'll fetch last 100 messages and process in JS.
        const recentMessages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
            include: {
                sender: { select: { id: true, username: true } },
                receiver: { select: { id: true, username: true } }
            }
        });

        const conversationsMap = new Map();

        for (const msg of recentMessages) {
            const isMe = msg.senderId === userId;
            const partner = isMe ? msg.receiver : msg.sender;
            const partnerName = partner.username || 'Unknown';

            if (!conversationsMap.has(partnerName)) {
                conversationsMap.set(partnerName, {
                    id: `conv_${partner.id}`,
                    user: partnerName,
                    lastMessage: msg.text,
                    timestamp: timeAgo(msg.createdAt),
                    rawTime: msg.createdAt,
                    unread: !isMe && !msg.isRead,
                    messages: [] // We don't load full history in list view usually, but context might expect it?
                    // Context expects `messages` array. We can load recent ones or leave empty and let dynamic page load it.
                    // For now, let's leave empty to save bandwidth, detail page loads history.
                });
            } else {
                // Update unread count if we found a newer unread message (though we iterate desc, so first hit is newest)
                // Actually if we found the conversation already, we have the latest message.
                // We might want to sum unread messages?
                const conv = conversationsMap.get(partnerName);
                if (!isMe && !msg.isRead) {
                    // If we want to track *any* unread logic, we could.
                    // But strictly speaking, the list shows "unread" dot if the *latest* is unread? or any?
                    // Usually any. Set unread to true if any message is unread.
                    conv.unread = true;
                }
            }
        }

        const conversations = Array.from(conversationsMap.values());

        return NextResponse.json(conversations);

    } catch (error) {
        console.error("Fetch DMs Error:", error);
        return NextResponse.json({ error: 'Failed to fetch DMs' }, { status: 500 });
    }
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "just now";
}
