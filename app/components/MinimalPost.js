"use client";
import { useState } from "react";
import styles from "./MinimalPost.module.css";
import Link from "next/link";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";

import { useRouter } from "next/navigation";
import { sanitizeText } from "../utils/sanitizer";

export default function MinimalPost({ id, username, content, time, isReply = false, parentId, parentContent = null, parentUsername = null, likes, likedByMe }) {
    const { toggleLike } = usePosts();
    const { user } = useUser();
    const router = useRouter(); // Hook for navigation
    const [moneyAnims, setMoneyAnims] = useState([]);

    const handleMoney = (e) => {
        e.stopPropagation();
        if (id === undefined || likes === undefined) return;

        const direction = likedByMe ? 'down' : 'up';
        toggleLike(id);

        // Use Math.random for uniqueness to prevent key collision on rapid taps
        const newAnim = { id: Date.now() + Math.random(), x: 0, direction };
        setMoneyAnims(prev => [...prev, newAnim]);
        setTimeout(() => {
            setMoneyAnims(prev => prev.filter(a => a.id !== newAnim.id));
        }, 600);
    };

    const handlePostClick = () => {
        if (isReply && parentId) {
            router.push(`/thread/${parentId}`);
        } else if (id) {
            router.push(`/thread/${id}`);
        }
    };

    return (
        <div className={styles.container} onClick={handlePostClick} style={{ cursor: 'pointer' }}>
            {isReply && parentContent && (
                <div className={styles.parentContainer}>
                    <div className={styles.parentLine}></div>
                    <div className={styles.parentHeader}>
                        <span className={styles.username} onClick={(e) => { e.stopPropagation(); router.push(`/profile/${parentUsername}`); }}>@{parentUsername}</span>
                        <span style={{ color: '#444' }}>•</span>
                        <span>Original Post</span>
                    </div>
                    <div className={styles.parentContent}>
                        {sanitizeText(parentContent)}
                    </div>
                </div>
            )}

            <div className={styles.replyContainer} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className={styles.header}>
                        <span className={styles.username} onClick={(e) => { e.stopPropagation(); router.push(`/profile/${username}`); }}>@{username}</span>
                        <span style={{ color: '#444' }}>•</span>
                        <span>{time}</span>
                    </div>

                    <div className={`${styles.content} ${isReply ? styles.replyContent : styles.postContent}`}>
                        {sanitizeText(content)}
                    </div>
                </div>

                {(likes !== undefined && user?.username !== username) && (
                    <div
                        onClick={handleMoney}
                        style={{
                            color: likedByMe ? 'gold' : 'white',
                            fontWeight: 'bold',
                            fontSize: 20,
                            paddingLeft: 16,
                            paddingRight: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            userSelect: 'none',
                            alignSelf: 'stretch'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            $
                            {moneyAnims.map(a => (
                                <div
                                    key={a.id}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        color: 'gold',
                                        pointerEvents: 'none',
                                        animation: a.direction === 'up' ? 'flyUp 0.6s ease-out forwards' : 'flyDown 0.6s ease-out forwards',
                                        opacity: 1,
                                        zIndex: 10
                                    }}
                                >
                                    $
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
