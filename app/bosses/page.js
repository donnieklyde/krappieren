"use client";
import Link from "next/link";
import { usePosts } from "../context/PostsContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";


export default function BossesPage() {
    const { followedUsers, toggleFollow, posts, activities } = usePosts();
    const router = useRouter();

    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [trigger, setTrigger] = useState(0);

    // Debounce Search
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const url = searchQuery.trim()
                    ? `/api/users?query=${encodeURIComponent(searchQuery)}`
                    : '/api/users'; // Empty query returns all/some users

                console.log(`[Frontend] Fetching: ${url}`);
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    console.log("[Frontend] Received:", data);
                    // Handle both array (legacy) and object response
                    const userList = Array.isArray(data) ? data : data.users;
                    // if (data.dbId) setDbId(data.dbId); // Removed for production

                    setAllUsers(userList.map(u => u.username).filter(Boolean));
                } else {
                    setError("API Error");
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
                setError("Network Error");
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchUsers();
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, trigger]);

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

            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Search for a boss..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 16,
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <p style={{ marginBottom: 20, opacity: 0.7 }}>
                Hold to Serve/Quit. Tap to View Profile.
                <span style={{ marginLeft: 10, fontSize: 12, border: '1px solid #333', padding: '2px 6px', borderRadius: 4, opacity: 0.8 }}>
                    {loading ? "Searching..." : error ? "Connection Error" : `${allUsers.length} Bosses found`}
                </span>
                <button
                    onClick={() => setTrigger(t => t + 1)}
                    style={{ marginLeft: 10, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, padding: 0 }}
                    title="Refresh List"
                >
                    ↻
                </button>
            </p>

            {error && <p style={{ color: '#ff4444', textAlign: 'center', marginBottom: 20 }}>Unable to load bosses. Please check your connection.</p>}
            {loading && <p style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>Scanning frequency...</p>}

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
                                    gap: 10,
                                    textTransform: 'uppercase'
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

            <div style={{ marginTop: 40, textAlign: 'center', opacity: 0.2, fontSize: 10, fontFamily: 'monospace' }}>
                TREEDZ NETWORK
            </div>
        </div>
    );
}
