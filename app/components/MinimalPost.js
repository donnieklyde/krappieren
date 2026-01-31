"use client";
import styles from "./MinimalPost.module.css";
import Link from "next/link";

export default function MinimalPost({ username, content, time, isReply = false, parentContent = null, parentUsername = null }) {

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

            <div className={styles.replyContainer}>
                <div className={styles.header}>
                    <span className={styles.username} onContextMenu={(e) => e.preventDefault()}>@{username}</span>
                    <span style={{ color: '#444' }}>•</span>
                    <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: 12 }}>● LIVE</span>
                </div>

                <div className={`${styles.content} ${isReply ? styles.replyContent : styles.postContent}`}>
                    {content}
                </div>
            </div>
        </div>
    );
}
