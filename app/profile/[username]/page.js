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

    const { posts } = usePosts();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("threads");

    // Check if this is the logged-in user's profile
    const isCurrentUser = user && user.username && user.username.toLowerCase() === decodedUsername.toLowerCase();

    // Local state for user posts and stats
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (decodedUsername) {
            // Fetch User Posts
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

            // Fetch User Stats (Slaves & Net Worth)
            fetch(`/api/user/stats?username=${decodedUsername}`)
                .then(res => res.json())
                .then(data => {
                    setStats(data);
                })
                .catch(err => {
                    console.error("Failed to fetch user stats", err);
                });
        }
    }, [decodedUsername]);

    // 1. Threads: Use fetched posts
    const displayPosts = userPosts;

    // 2. Replies: Extract ACTUAL comments made by this user
    // Relying on global `posts` context for now (fallback)
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src={stats?.avatar || "https://github.com/shadcn.png"}
                            alt={decodedUsername}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #333'
                            }}
                        />
                        <div className={styles.nameInfo}>
                            <h1 style={{ margin: 0, fontSize: '24px', color: decodedUsername?.toLowerCase() === 'donnieklyde' ? '#FFD700' : undefined }}>
                                {decodedUsername}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginTop: '15px',
                    fontSize: '14px',
                    color: '#888'
                }}>
                    <span>
                        <strong style={{ color: 'white' }}>{stats?.followerCount || 0}</strong> Slaves
                    </span>
                    <span>
                        <strong style={{ color: '#FFD700' }}>${stats?.netWorth || 0}</strong> Net Worth
                    </span>
                </div>

                {/* Bio and Link */}
                <div style={{ marginTop: '15px' }}>
                    {stats?.bio && (
                        <p style={{ color: '#ccc', fontSize: '14px', margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>
                            {stats.bio}
                        </p>
                    )}
                    {stats?.link && (
                        <a
                            href={stats.link.startsWith('http') ? stats.link : `https://${stats.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent)', fontSize: '14px', textDecoration: 'none' }}
                        >
                            🔗 {stats.link}
                        </a>
                    )}
                </div>

                {isCurrentUser && (
                    <button
                        onClick={() => router.push('/settings')}
                        style={{
                            marginTop: '15px',
                            background: 'transparent',
                            border: '1px solid #444',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Edit Profile
                    </button>
                )}

            </div>

            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'threads' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('threads')}
                >
                    Threads
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
