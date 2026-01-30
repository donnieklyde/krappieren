"use client";
import { useState, useRef } from "react";
import { usePosts } from "../context/PostsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Mock activity data
// Mock activity data moved to PostsContext

export default function ActivityPage() {
    const { followedUsers, toggleFollow, activities } = usePosts();
    const router = useRouter();

    useEffect(() => {
        // Mark activity as read
        fetch('/api/user/activity/read', { method: 'POST' }).catch(err => console.error(err));
    }, []);

    // Long Press Logic State
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const startPress = (e, targetUser) => {
        if (e.type === 'click' && e.button !== 0) return;

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            // Long Press Action: Toggle Follow
            if (targetUser !== "currentUser") {
                toggleFollow(targetUser);
                if (window.navigator && window.navigator.vibrate) {
                    try {
                        window.navigator.vibrate(50);
                    } catch (err) {
                        // ignore
                    }
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
            <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 20 }}>INCOME STREAM</h1>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activities.map(item => {
                    const isEnslaved = followedUsers.includes(item.user);

                    return (
                        <div key={item.id} style={{
                            borderBottom: '1px solid #333',
                            padding: '20px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            userSelect: 'none',
                        }}>
                            <div>
                                {item.type === 'money' ? (
                                    <span>
                                        Received <span style={{ color: 'gold', fontWeight: 'bold' }}>${item.amount}</span> from <span
                                            onMouseDown={(e) => startPress(e, item.user)}
                                            onMouseUp={(e) => endPress(e, item.user)}
                                            onMouseLeave={cancelPress}
                                            onTouchStart={(e) => startPress(e, item.user)}
                                            onTouchEnd={(e) => endPress(e, item.user)}
                                            onContextMenu={(e) => e.preventDefault()}
                                            style={{
                                                fontWeight: 'bold',
                                                color: isEnslaved ? 'gold' : 'white',
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            @{item.user}
                                        </span>
                                    </span>
                                ) : item.type === 'mention' ? (
                                    <span>
                                        Mentioned <span
                                            onMouseDown={(e) => startPress(e, item.user)}
                                            onMouseUp={(e) => endPress(e, item.user)}
                                            onMouseLeave={cancelPress}
                                            onTouchStart={(e) => startPress(e, item.user)}
                                            onTouchEnd={(e) => endPress(e, item.user)}
                                            onContextMenu={(e) => e.preventDefault()}
                                            style={{
                                                fontWeight: 'bold',
                                                color: isEnslaved ? 'gold' : 'white',
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            @{item.user}
                                        </span>
                                    </span>
                                ) : (
                                    <span>
                                        New Slave: <span
                                            onMouseDown={(e) => startPress(e, item.user)}
                                            onMouseUp={(e) => endPress(e, item.user)}
                                            onMouseLeave={cancelPress}
                                            onTouchStart={(e) => startPress(e, item.user)}
                                            onTouchEnd={(e) => endPress(e, item.user)}
                                            onContextMenu={(e) => e.preventDefault()}
                                            style={{
                                                fontWeight: 'bold',
                                                // color: isEnslaved ? 'gold' : 'gold', 
                                                color: isEnslaved ? 'gold' : 'white',
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            @{item.user}
                                        </span>
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>{item.time}</div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
