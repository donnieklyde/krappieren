"use client";
import styles from "./MinimalPost.module.css";
import Link from "next/link";

export default function MinimalPost({ username, content, time, isReply = false, parentContent = null, parentUsername = null }) {

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
            <div style={{
                color: 'gold',
                fontWeight: 'bold',
                fontSize: 18,
                paddingLeft: 12,
                paddingTop: isReply && parentContent ? 40 : 0, // Adjust alignment if parent connection exists
                display: 'flex',
                alignItems: 'center',
                height: '100%'
            }}>
                $
            </div>
        </div>
    );
}
