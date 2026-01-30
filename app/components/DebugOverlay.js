"use client";
import { useSession } from "next-auth/react";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";

export default function DebugOverlay() {
    const { data: session, status } = useSession();
    const { posts } = usePosts();
    const { user, isInitialized } = useUser();



    // Show always for debugging
    // if (process.env.NODE_ENV === 'production' && !session) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.8)',
            color: '#0f0',
            fontSize: '12px',
            padding: '10px',
            zIndex: 99999,
            pointerEvents: 'none',
            fontFamily: 'monospace'
        }}>
            <div>Status: {status}</div>
            <div>Session: {session ? session.user.email : "NULL"}</div>
            <div>UserInit: {isInitialized ? "YES" : "NO"}</div>
            <div>Posts: {posts?.length || 0}</div>
            <div>Onboarded: {user?.isOnboarded ? "TRUE" : "FALSE"}</div>
        </div>
    );
}
