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

        // Use Math.random for uniqueness to prevent key collision on rapid taps
        const newAnim = { id: Date.now() + Math.random(), x: 0, direction };
        setMoneyAnims(prev => [...prev, newAnim]);
        setTimeout(() => {
            setMoneyAnims(prev => prev.filter(a => a.id !== newAnim.id));
        }, 600);
    };

    return (
        <div className={styles.container}>
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

            <div className={styles.replyContainer} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className={styles.header}>
                        <span className={styles.username} onContextMenu={(e) => e.preventDefault()}>@{username}</span>
                        <span style={{ color: '#444' }}>•</span>
                        <span>{time}</span>
                    </div>

                    <div className={`${styles.content} ${isReply ? styles.replyContent : styles.postContent}`}>
                        {content}
                    </div>
                </div>

                {(likes !== undefined) && (
                    <div
                        onClick={handleMoney}
                        style={{
                            color: likedByMe ? 'gold' : '#333',
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
