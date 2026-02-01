import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const normalizedUsername = username.toUpperCase();

        // Validate username format (A-Z and spaces only)
        if (!/^[A-Z ]+$/.test(normalizedUsername)) {
            return NextResponse.json({ error: 'Username must contain only letters and spaces' }, { status: 400 });
        }

        if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
            return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: normalizedUsername }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: normalizedUsername,
                password: hashedPassword,
                name: normalizedUsername,
                isOnboarded: true,
                email: null,
                image: `https://github.com/identicons/${normalizedUsername}.png`
            }
        });

        return NextResponse.json({
            success: true,
            username: newUser.username
        });

    } catch (error) {
        // Silent error handling for production
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
