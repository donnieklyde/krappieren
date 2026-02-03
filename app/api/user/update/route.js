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
        let { username, languages, bio, avatar, link } = body;

        // SERVER-SIDE VALIDATION
        if (username) {
            // Enforce Uppercase
            username = username.toUpperCase();

            // Length check
            if (username.length < 3 || username.length > 20) {
                return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
            }
            // Format check (Alphanumeric only)
            if (!/^[A-Z0-9]+$/.test(username)) {
                return NextResponse.json({ error: 'Username must be alphanumeric' }, { status: 400 });
            }
        }

        if (bio && bio.length > 500) {
            return NextResponse.json({ error: 'Bio must be under 500 characters' }, { status: 400 });
        }

        // Check for uniqueness if username is changing
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username,
                    NOT: { email: session.user.email } // Exclude self
                }
            });

            if (existingUser) {
                return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
            }
        }

        // Construct update data dynamically
        const updateData = {};
        if (username) updateData.username = username;
        if (languages) updateData.languages = languages;
        if (bio !== undefined) updateData.bio = bio; // Allow empty string
        if (avatar) updateData.image = avatar; // Map avatar to image field
        if (link !== undefined) updateData.link = link; // Support link updates

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
        // Silent error handling for production
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
