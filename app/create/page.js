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

    const [language, setLanguage] = useState("english"); // Default language

    const handleBroadcast = () => {
        if (!content.trim()) return;
        addPost(content, {
            username: user.username,
            avatarUrl: user.avatar,
            language // Pass selected language
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', margin: 0 }}>BROADCAST</h1>
                <button
                    onClick={handleBroadcast}
                    disabled={!content.trim()}
                    style={{
                        background: content.trim() ? 'white' : '#333',
                        color: content.trim() ? 'black' : '#666',
                        border: 'none',
                        padding: '10px 20px',
                        fontSize: 14,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        cursor: content.trim() ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase'
                    }}
                >
                    Broadcast
                </button>
            </div>

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
                    outline: 'none',
                    marginBottom: 20
                }}
                autoFocus
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                {['english', 'german'].map(lang => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        style={{
                            background: language === lang ? 'white' : 'transparent',
                            color: language === lang ? 'black' : '#666',
                            border: '1px solid #333',
                            padding: '6px 12px',
                            borderRadius: 20,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontSize: 12,
                            fontWeight: 'bold'
                        }}
                    >
                        {lang}
                    </button>
                ))}
            </div>
        </div>
    );
}
