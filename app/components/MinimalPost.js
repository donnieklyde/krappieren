"use client";
import { useState } from "react";
import styles from "./MinimalPost.module.css";
import Link from "next/link";
import { usePosts } from "../context/PostsContext";

export default function MinimalPost({ id, username, content, time, isReply = false, parentContent = null, parentUsername = null, likes, likedByMe }) {
    const { toggleLike, followedUsers } = usePosts();
    const [moneyAnims, setMoneyAnims] = useState([]);

    const handleMoney = (e) => {
        e.stopPropagation();
        if (id === undefined || likes === undefined) return;

        const direction = likedByMe ? 'down' : 'up';
        toggleLike(id);

        const newAnim = { id: Date.now(), x: 0, direction };
        setMoneyAnims(prev => [...prev, newAnim]);
        setTimeout(() => {
            setMoneyAnims(prev => prev.filter(a => a.id !== newAnim.id));
        }, 600);
    };

    return (
        <div className={styles.container} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isReply && parentContent && (
                    <div className={styles.parentContainer}>
                        <div className={styles.parentLine}></div>
                        <div className={styles.parentHeader}>
                            <span className={styles.username} onContextMenu={(e) => e.preventDefault()}>@{parentUsername}</span>
                            <span style={{ color: '#444' }}>•</span>
                            <span>Original Post</span>
                        </div>
                        <div className={styles.parentContent}>
                            {parentContent}
                        </div>
                    </div>
                )}

                <div className={styles.replyContainer}>
                    <div className={styles.header}>
                        <span className={styles.username} onContextMenu={(e) => e.preventDefault()}>@{username}</span>
                        <span style={{ color: '#444' }}>•</span>
                        <span>{time}</span>
                    </div>

                    <div className={`${styles.content} ${isReply ? styles.replyContent : styles.postContent}`}>
                        {content}
                    </div>
                </div>
            </div>

            {(likes !== undefined) && (
                <div
                    onClick={handleMoney}
                    style={{
                        color: likedByMe ? 'gold' : '#333',
                        fontWeight: 'bold',
                        fontSize: 18,
                        paddingLeft: 12,
                        paddingTop: isReply && parentContent ? 40 : 0,
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        userSelect: 'none'
                    }}
                >
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
                                opacity: 1
                            }}
                        >
                            $
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
