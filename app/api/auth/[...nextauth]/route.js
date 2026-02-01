
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
    debug: false, // Disabled for production security
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing username or password");
                }

                // 1. Find User (Case Insensitive)
                const user = await prisma.user.findFirst({
                    where: {
                        username: {
                            equals: credentials.username,
                            mode: 'insensitive'
                        }
                    }
                });

                // 2. If User Exists -> Check Password
                if (user) {
                    // If user was created via Google before (no password), we can't login this way unless we handle it.
                    // But user said "no google authenticator", implying a fresh start or specific flow.
                    // If no password set, we might default to error or allow setting it?
                    // User Request: "if the username doesnt exist it shall create a new profile"
                    // Implies if it DOES exist, it checks password.


                    if (!user.password) {
                        // Allow setting password for existing accounts without one
                        const hashedPassword = await bcrypt.hash(credentials.password, 10);

                        const updatedUser = await prisma.user.update({
                            where: { id: user.id },
                            data: { password: hashedPassword }
                        });

                        return updatedUser;
                    }


                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Invalid password");
                    }

                    return user;
                } else {
                    // User does not exist - return error instead of auto-creating
                    throw new Error("Username not found. Please create an account first.");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;

                // CRITICAL OPTIMIZATION: Explicitly remove large fields that NextAuth adds by default
                // If we don't delete these, the Base64 image stays in the token!
                delete token.picture;
                delete token.image;
                delete token.name;
            }

            // Handle updates (e.g. after onboarding)
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (token && token.id) {
                // Determine user ID
                const userId = token.id;
                session.user.id = userId;

                // Sync latest data from DB to avoid stale session state
                // This is crucial for onboarding persistence
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { username: true, isOnboarded: true, languages: true }
                    });

                    if (dbUser) {
                        session.user.username = dbUser.username;
                        session.user.isOnboarded = dbUser.isOnboarded;
                        session.user.languages = dbUser.languages;
                    }
                } catch (e) {
                    console.error("Session sync failed", e);
                }
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
