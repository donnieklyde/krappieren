import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { username, languages, bio, avatar } = body;

        // Construct update data dynamically
        const updateData = {};
        if (username) updateData.username = username;
        if (languages) updateData.languages = languages;
        if (bio !== undefined) updateData.bio = bio; // Allow empty string
        if (avatar) updateData.image = avatar; // Map avatar to image field

        // Always mark onboarded if we are updating? Or maybe keep it separate.
        // If username is provided, likely we are onboarding or fixing profile.
        if (username || languages) updateData.isOnboarded = true;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No changes' });
        }

        // Update user in DB
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
