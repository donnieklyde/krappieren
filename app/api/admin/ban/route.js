
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        // 1. Verify Authorization (YAHWEH only)
        if (!session || session.user?.username?.toLowerCase() !== 'yahweh') {
            return NextResponse.json({ error: "Unauthorized. Divine power required." }, { status: 403 });
        }

        const { targetUsername, reason } = await req.json();

        if (!targetUsername) {
            return NextResponse.json({ error: "Target required" }, { status: 400 });
        }

        const normalizedTarget = targetUsername.toLowerCase(); // Treat as case insensitive for finding

        if (normalizedTarget === 'yahweh') {
            return NextResponse.json({ error: "You cannot ban yourself, My Lord." }, { status: 400 });
        }

        // 2. Find Target User
        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: targetUsername,
                    mode: 'insensitive'
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log(`🔨 BANHAMMER: Striking ${user.username}...`);

        // 3. Create Ban Record (Persist Reason)
        // Store the exact username casing they used, or normalized? 
        // Normalized is safer to prevent re-registration with case variants.
        // But schema says unique.
        await prisma.bannedUser.upsert({
            where: { username: normalizedTarget }, // Use lower for uniqueness key if possible, but schema is just String @unique
            update: { reason, bannedAt: new Date() },
            create: {
                username: normalizedTarget,
                reason: reason || "The Ban Hammer has spoken.",
            }
        });

        // 4. CASCADE DELETE EVERYTHING
        const userId = user.id;

        // Transactions to ensure clean wipe
        await prisma.$transaction(async (tx) => {
            // Delete Follows
            await tx.follow.deleteMany({
                where: { OR: [{ followerId: userId }, { followingId: userId }] }
            });

            // Delete Messages
            await tx.message.deleteMany({
                where: { OR: [{ senderId: userId }, { receiverId: userId }] }
            });

            // Delete Likes
            await tx.like.deleteMany({ where: { userId: userId } });

            // Delete Comments by User
            await tx.comment.deleteMany({ where: { authorId: userId } });

            // Delete Posts by User (and their comments/likes - handled by cascade? No, manual safety)
            // First find posts to delete their child comments/likes?
            // Actually, if we delete posts, we need to delete incoming likes/comments on them first if FK constraints exist.

            const userPosts = await tx.post.findMany({ where: { authorId: userId }, select: { id: true } });
            const postIds = userPosts.map(p => p.id);

            if (postIds.length > 0) {
                // Delete comments on these posts
                await tx.comment.deleteMany({ where: { postId: { in: postIds } } });
                // Delete likes on these posts
                await tx.like.deleteMany({ where: { postId: { in: postIds } } });
                // Delete the posts
                await tx.post.deleteMany({ where: { authorId: userId } });
            }

            // Delete Sessions/Accounts
            await tx.session.deleteMany({ where: { userId: userId } });
            await tx.account.deleteMany({ where: { userId: userId } });

            // Finally, Delete User
            await tx.user.delete({ where: { id: userId } });
        });

        console.log(`✅ ${user.username} successfully obliterated.`);

        return NextResponse.json({ success: true, message: `User ${user.username} has been obliterated.` });

    } catch (error) {
        console.error("Ban Error:", error);
        return NextResponse.json({ error: "Failed to execute judgment." }, { status: 500 });
    }
}
