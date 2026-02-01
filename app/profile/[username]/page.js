"use client";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../profile.module.css";
import { usePosts } from "../../context/PostsContext";
import { useUser } from "../../context/UserContext";
import MinimalPost from "../../components/MinimalPost";

export default function UserProfile({ params }) {
    const { username } = use(params);
    const decodedUsername = decodeURIComponent(username);
    const router = useRouter();

    const { posts, followedUsers, toggleFollow } = usePosts();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("threads");

    // Check if this is the logged-in user's profile
    // Optional: normalize both to lower case for safety
    const isCurrentUser = user && user.username && user.username.toLowerCase() === decodedUsername.toLowerCase();

    const isEnslaved = followedUsers.includes(decodedUsername);

    // Local state for user posts
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        if (decodedUsername) {
            fetch(`/api/posts?username=${decodedUsername}`)
                .then(res => res.json())
                .then(data => {
                    setUserPosts(data);
                    setLoadingPosts(false);
                })
                .catch(err => {
                    console.error("Failed to fetch user posts", err);
                    setLoadingPosts(false);
                });
        }
    }, [decodedUsername]);

    // 1. Threads: Use fetched posts
    // Fallback? No, userPosts is authoritative for that user's profile.
    const displayPosts = userPosts;

    // 2. Replies: Extract ACTUAL comments made by this user
    // Same limitation as own profile: API only returns posts authored by user.
    // For now, relying on global `posts` context for replies (inaccurate but safe fallback)
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
                    </div>

                </div>

            </div>
            {/* End topRow */}

            {/* Minimal Design: Bio and Stats removed. Only Serve button remains for others. */}
            {!isCurrentUser && (
                <div className={styles.actions}>
                    <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 10 }}>
                        <button
                            className={styles.editButton}
                            onClick={() => toggleFollow(decodedUsername)}
                            style={{
                                background: isEnslaved ? 'gold' : 'transparent',
                                color: isEnslaved ? 'black' : 'white',
                                borderColor: isEnslaved ? 'gold' : 'var(--border-color)',
                                flex: 1
                            }}
                        >
                            {isEnslaved ? "Quit Boss" : "Serve"}
                        </button>
                        <button
                            className={styles.editButton}
                            onClick={() => router.push(`/dms/${decodedUsername}`)}
                            style={{
                                background: 'transparent',
                                color: 'white',
                                borderColor: 'var(--border-color)',
                                flex: 1
                            }}
                        >
                            DM
                        </button>
                    </div>
                </div>
            )}
            {/* End header */}

            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'threads' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('threads')}
                >
                    Intel
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
                                id={post.id}
                                username={post.username}
                                content={post.content}
                                time={post.time}
                                likes={post.likes}
                                likedByMe={post.likedByMe}
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
        </div >
    );
}
