"use client";
import { useState, useRef, useEffect } from "react";
import { usePosts } from "../context/PostsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ActivityPage() {
    const { activities } = usePosts();
    const router = useRouter();

    useEffect(() => {
        // Mark activity as read
        fetch('/api/user/activity/read', { method: 'POST' }).catch(err => console.error(err));
    }, []);

    const handleUserClick = (targetUser) => {
        router.push(`/profile/${targetUser}`);
    };

    return (
        <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', margin: '20px 0' }}>INCOME STREAM</h1>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activities.map(item => {
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
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>
                                            Received <span style={{ color: 'gold', fontWeight: 'bold' }}>${item.amount}</span> from <span
                                                onClick={() => handleUserClick(item.user)}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                @{item.user}
                                            </span>
                                        </span>
                                        {item.context && (
                                            <Link href={`/thread/${item.postId}`} style={{ color: '#888', fontSize: 13, marginTop: 4, textDecoration: 'none', display: 'block' }}>
                                                &quot;{item.context.substring(0, 20)}...&quot;
                                            </Link>
                                        )}
                                    </div>
                                ) : item.type === 'mention' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>
                                            Mentioned <span
                                                onClick={() => handleUserClick(item.user)}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                @{item.user}
                                            </span>
                                        </span>
                                        {item.context && (
                                            <Link href={`/thread/${item.postId}`} style={{ color: '#888', fontSize: 13, marginTop: 4, textDecoration: 'none', display: 'block' }}>
                                                &quot;{item.context.substring(0, 50)}{item.context.length > 50 ? '...' : ''}&quot;
                                            </Link>
                                        )}
                                    </div>
                                ) : item.type === 'comment' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>
                                            Commented by <span
                                                onClick={() => handleUserClick(item.user)}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                @{item.user}
                                            </span>
                                        </span>
                                        {item.context && (
                                            <Link href={`/thread/${item.postId}`} style={{ color: '#888', fontSize: 13, marginTop: 4, textDecoration: 'none', display: 'block' }}>
                                                &quot;{item.context.substring(0, 50)}{item.context.length > 50 ? '...' : ''}&quot;
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <span>
                                        New Slave: <span
                                            onClick={() => handleUserClick(item.user)}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'white',
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
