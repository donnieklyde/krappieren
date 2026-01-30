
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const authOptions = {
    debug: true, // Enable debugging to see exact error in Vercel logs
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error("Missing GOOGLE_CLIENT_ID") })(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error("Missing GOOGLE_CLIENT_SECRET") })(),
            allowDangerousEmailAccountLinking: true, // Allow signing in with Google even if user exists
        }),
        CredentialsProvider({
            name: "Mock Login",
            credentials: {},
            async authorize(credentials, req) {
                return {
                    id: "mock-user-1",
                    name: "Mock User",
                    email: "mock@example.com",
                    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix"
                };
            }
        }),
        CredentialsProvider({
            id: "google-mobile",
            name: "Google Mobile",
            credentials: {
                idToken: { label: "ID Token", type: "text" },
                email: { label: "Email", type: "text" },
                name: { label: "Name", type: "text" },
                image: { label: "Image", type: "text" }
            },
            async authorize(credentials, req) {
                if (credentials.email) {
                    const email = credentials.email.toLowerCase();

                    // Upsert user in DB (Create if not exists, Update if exists)
                    // We need this because CredentialsProvider doesn't use the Adapter automatically
                    const user = await prisma.user.upsert({
                        where: { email: email },
                        update: {
                            name: credentials.name,
                            image: credentials.image
                        },
                        create: {
                            email: email,
                            name: credentials.name,
                            image: credentials.image,
                            username: credentials.name?.replace(/\s+/g, '').toLowerCase(),
                        }
                    });

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        isOnboarded: user.isOnboarded,
                        languages: user.languages
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.isOnboarded = user.isOnboarded;
                token.languages = user.languages;
                token.username = user.username;
            }

            // Handle updates (e.g. after onboarding)
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.isOnboarded = token.isOnboarded;
                session.user.languages = token.languages;
                session.user.username = token.username;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
