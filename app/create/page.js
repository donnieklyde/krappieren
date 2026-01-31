"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";
import { sanitizeText } from "../utils/sanitizer";

export default function CreatePage() {
    const [content, setContent] = useState("");
    const { addPost } = usePosts();
    const { user, updateUser } = useUser(); // Ensure updateUser is available
    const router = useRouter();

    const handleBroadcast = async () => {
        console.log("Broadcast initiated with content:", content);
        if (!content.trim()) {
            console.log("Broadcast cancelled: Content empty");
            return;
        }

        if (!user || !user.username) {
            console.error("Broadcast failed: User not ready", user);
            alert("Please wait for your profile to load.");
            return;
        }

        try {
            const language = detectLanguage(content);
            console.log("Detected language:", language);

            await addPost(content, {
                username: user.username,
                avatarUrl: user.avatar || ""
            }, language);

            console.log("Post added successfully, navigating...");

            // Auto-learn language
            const currentLanguages = user.languages || {};
            if (!currentLanguages[language]) {
                const updatedLanguages = {
                    ...currentLanguages,
                    [language]: true
                };
                updateUser({ languages: updatedLanguages });
            }

            router.push('/');
        } catch (error) {
            console.error("Broadcast Execution Error:", error);
            alert("Failed to broadcast. Please try again.");
        }
    };

    const handleContentChange = (e) => {
        let val = sanitizeText(e.target.value);
        if (val.length > 100) val = val.substring(0, 100);
        setContent(val);
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

            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <textarea
                    placeholder="What is your command?"
                    value={content}
                    onChange={handleContentChange}
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

                {/* Character Counter */}
                {content.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: 150, // Adjust position as needed, or place relative to textarea
                        right: 0,
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: `hsl(${120 - ((content.length / 100) * 120)}, 100%, 50%)`,
                        transition: 'color 0.2s',
                        pointerEvents: 'none'
                    }}>
                        {100 - content.length}
                    </div>
                )}
            </div>

            {/* Language buttons removed */}
        </div>
    );
}
