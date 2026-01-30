"use client";
import { useState, use } from "react";
import styles from "../profile.module.css";
import { usePosts } from "../../context/PostsContext";
import { useUser } from "../../context/UserContext";
import MinimalPost from "../../components/MinimalPost";

export default function UserProfile({ params }) {
    const { username } = use(params);
    const decodedUsername = decodeURIComponent(username);

    const { posts, followedUsers, toggleFollow } = usePosts();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("threads");

    // Check if this is the logged-in user's profile
    // Optional: normalize both to lower case for safety
    const isCurrentUser = user && user.username && user.username.toLowerCase() === decodedUsername.toLowerCase();

    const isEnslaved = followedUsers.includes(decodedUsername);

    // 1. Threads: Posts created by this user
    const userPosts = posts.filter(post => post.username === decodedUsername);

    // 2. Replies: Extract ACTUAL comments made by this user
    const userReplies = posts.flatMap(post =>
        (post.comments || [])
            .filter(c => c.user === decodedUsername)
            .map(c => ({
                id: c.id,
                username: c.user,
                content: c.text,
                time: "2h", // Mock time
                isReply: true,
                parentId: post.id,
                parentContent: post.content,
                parentUsername: post.username
            }))
    );

    // Calculate Net Worth (Likes on their threads)
    const totalMoney = userPosts.reduce((acc, post) => acc + (post.likes || 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div className={styles.nameInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1>{decodedUsername}</h1>
                            {/* BOSS Status Indicator */}
                            {isEnslaved && <span style={{ color: 'gold', border: '1px solid gold', fontSize: 10, padding: '2px 6px' }}>MY BOSS</span>}
                        </div>
                        <div className={styles.username}>
                            @{decodedUsername}
                        </div>
                    </div>

                </div>

                <div className={styles.bio}>
                    {isCurrentUser ? (
                        user?.bio
                    ) : (
                        user?.bio
                    )}
                    {isCurrentUser && user?.link && (
                        <div style={{ marginTop: 5 }}>
                            <a href={user.link} target="_blank" rel="noreferrer" style={{ color: '#666' }}>🔗 {user.link}</a>
                        </div>
                    )}
                </div>

                <div className={styles.meta}>
                    <span style={{ color: 'gold', fontWeight: 'bold' }}>${totalMoney} Net Worth</span>
                    <span>{isEnslaved ? "1 slave" : "0 slaves"}</span>
                </div>

                <div className={styles.actions}>
                    {isCurrentUser ? (
                        <button className={styles.editButton} onClick={() => window.location.href = '/settings'}>Edit Profile</button>
                    ) : (
                        <button
                            className={styles.editButton}
                            onClick={() => toggleFollow(decodedUsername)}
                            style={{
                                background: isEnslaved ? 'gold' : 'transparent',
                                color: isEnslaved ? 'black' : 'white',
                                borderColor: isEnslaved ? 'gold' : 'var(--border-color)'
                            }}
                        >
                            {isEnslaved ? "Quit Boss" : "Serve"}
                        </button>
                    )}
                    <button className={styles.editButton}>Share profile</button>
                    {!isCurrentUser && <button className={styles.editButton} onClick={() => window.location.href = `/dms/${decodedUsername}`}>DM</button>}
                </div>
            </div>

            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'threads' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('threads')}
                >
                    Works
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'replies' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('replies')}
                >
                    Replies
                </div>
            </div>

            <div className="feed">
                {activeTab === 'threads' ? (
                    userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <MinimalPost
                                key={post.id}
                                username={post.username}
                                content={post.content}
                                time={post.time}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No threads yet.
                        </div>
                    )
                ) : (
                    userReplies.length > 0 ? (
                        userReplies.map(reply => (
                            <MinimalPost
                                key={reply.id}
                                username={reply.username}
                                content={reply.content}
                                time={reply.time}
                                isReply={true}
                                parentContent={reply.parentContent}
                                parentUsername={reply.parentUsername}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No replies yet.
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
