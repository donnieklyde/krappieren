"use client";
import Link from "next/link";
import { usePosts } from "../context/PostsContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTakenUsernames } from "../data/mockData";

export default function BossesPage() {
    const { followedUsers, toggleFollow, posts, activities } = usePosts();
    const router = useRouter();

    // Derive all unique users from current posts (authors + commenters) and activities
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setAllUsers(data.map(u => u.username).filter(u => u !== "currentUser" && u));
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    // Long Press Logic State
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const startPress = (e, targetUser) => {
        if (e.type === 'click' && e.button !== 0) return;

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            // Long Press Action: Toggle Follow (Quit Boss / Serve)
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
        <div style={{ padding: 40, maxWidth: 600, margin: '0 auto', color: 'white' }}>
            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link href="/" style={{ fontSize: 24 }}>←</Link>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace' }}>FIND A BOSS</h1>
            </div>

            <p style={{ marginBottom: 20, opacity: 0.7 }}>
                Hold to Serve/Quit. Tap to View Profile.
                <span style={{ marginLeft: 10, fontSize: 12, border: '1px solid #333', padding: '2px 6px', borderRadius: 4 }}>
                    {allUsers.length} Bosses Found
                </span>
            </p>

            <ul style={{ listStyle: 'none' }}>
                {allUsers.map(user => {
                    const isBoss = followedUsers.includes(user);
                    return (
                        <li key={user} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 0',
                            borderBottom: '1px solid #333'
                        }}>
                            <span
                                style={{
                                    color: isBoss ? 'gold' : 'white',
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}
                                onMouseDown={(e) => startPress(e, user)}
                                onMouseUp={(e) => endPress(e, user)}
                                onMouseLeave={cancelPress}
                                onTouchStart={(e) => startPress(e, user)}
                                onTouchEnd={(e) => endPress(e, user)}
                                onContextMenu={(e) => e.preventDefault()}
                                title={isBoss ? "Hold to Quit Boss" : "Hold to Serve"}
                            >
                                @{user}
                                {isBoss && <span style={{ fontSize: 10, border: '1px solid gold', padding: '2px 4px', borderRadius: 4 }}>BOSS</span>}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
