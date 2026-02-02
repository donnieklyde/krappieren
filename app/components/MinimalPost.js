"use client";
import styles from "./MinimalPost.module.css";
import { useRouter } from "next/navigation";
import { sanitizeText } from "../utils/sanitizer";

export default function MinimalPost({ id, username, content, time, isReply = false, parentId, parentContent = null, parentUsername = null }) {
    const router = useRouter();

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

            <div className={styles.replyContainer}>
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
            </div>
        </div>
    );
}
