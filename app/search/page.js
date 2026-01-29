"use client";
import { useState, useRef } from "react";
import { usePosts } from "../context/PostsContext";
import { useRouter } from "next/navigation";

const MOCK_USERS = [
    "fan1",
    "hater0",
    "observer",
    "elonmusk",
    "zuck",
    "webdesigner",
    "cryptoking",
    "aigod"
];

export default function SearchPage() {
    const { followedUsers, toggleFollow } = usePosts();
    const [query, setQuery] = useState("");
    const router = useRouter();

    const filteredUsers = MOCK_USERS.filter(u => u.toLowerCase().includes(query.toLowerCase()));

    // Long Press Logic State
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const startPress = (e, targetUser) => {
        if (e.type === 'click' && e.button !== 0) return;

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            // Long Press Action: Toggle Follow
            toggleFollow(targetUser);
            if (window.navigator && window.navigator.vibrate) {
                try {
                    window.navigator.vibrate(50);
                } catch (err) {
                    // ignore
                }
            }
        }, 600);
    };

    const endPress = (e, targetUser) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // If it WASN'T a long press, treat as Short Click (Navigation)
        if (!isLongPress.current) {
            e.stopPropagation();
            router.push(`/profile/${targetUser}`);
        }

        isLongPress.current = false;
    };

    const cancelPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isLongPress.current = false;
    };


    return (
        <div style={{ padding: 20, maxWidth: 600, margin: '0 auto', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 20 }}>FIND A BOSS</h1>

            <input
                type="text"
                placeholder="SEARCH..."
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/[;,:._\-'#*+~`´?=\(\)/&%$§"!²³\{\[\]}\\]/g, ""))}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid white',
                    color: 'white',
                    fontFamily: 'Bahnschrift, sans-serif',
                    fontSize: 24,
                    padding: '10px 0',
                    outline: 'none',
                    marginBottom: 40,
                    textTransform: 'uppercase'
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {filteredUsers.map(user => {
                    const isEnslaved = followedUsers.includes(user);
                    return (
                        <div key={user} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                                style={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: isEnslaved ? 'gold' : 'white',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onMouseDown={(e) => startPress(e, user)}
                                onMouseUp={(e) => endPress(e, user)}
                                onMouseLeave={cancelPress}
                                onTouchStart={(e) => startPress(e, user)}
                                onTouchEnd={(e) => endPress(e, user)}
                                onContextMenu={(e) => e.preventDefault()}
                                title={isEnslaved ? "Hold to Quit Boss / Tap for Profile" : "Hold to Serve / Tap for Profile"}
                            >
                                @{user}
                            </span>
                            {/* Button removed */}
                        </div>
                    );
                })}

                {
                    filteredUsers.length === 0 && (
                        <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No subjects found.</div>
                    )
                }
            </div >
        </div >
    );
}
