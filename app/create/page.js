"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";

export default function CreatePage() {
    const [content, setContent] = useState("");
    const { addPost } = usePosts();
    const { user } = useUser();
    const router = useRouter();

    const handleBroadcast = () => {
        if (!content.trim()) return;
        addPost(content, {
            username: user.username,
            avatarUrl: user.avatar
        });
        router.push('/'); // Go back to feed
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            maxWidth: 600,
            margin: '0 auto',
            color: 'white'
        }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 40 }}>BROADCAST</h1>

            <textarea
                placeholder="What is your command?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'Bahnschrift, sans-serif',
                    fontSize: 24,
                    resize: 'none',
                    outline: 'none'
                }}
                autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 20 }}>
                <button
                    onClick={handleBroadcast}
                    disabled={!content.trim()}
                    style={{
                        background: content.trim() ? 'white' : '#333',
                        color: content.trim() ? 'black' : '#666',
                        border: 'none',
                        padding: '15px 40px',
                        fontSize: 16,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        cursor: content.trim() ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase'
                    }}
                >
                    Broadcast
                </button>
            </div>
        </div>
    );
}
