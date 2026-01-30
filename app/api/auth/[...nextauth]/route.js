
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error("Missing GOOGLE_CLIENT_ID") })(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error("Missing GOOGLE_CLIENT_SECRET") })(),
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
                // Ideally verify validation of idToken here using google-auth-library
                // For MVP, we trust the client-side Google Auth plugin response
                if (credentials.email) {
                    const email = credentials.email.toLowerCase();
                    return {
                        id: email, // Use email as ID for simple mapping
                        name: credentials.name,
                        email: email,
                        image: credentials.image
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (session?.user && user?.id) {
                session.user.id = user.id; // Populate ID from DB user
                session.user.languages = user.languages; // Populate languages from DB
                session.user.isOnboarded = user.isOnboarded;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
