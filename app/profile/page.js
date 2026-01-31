"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./profile.module.css";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";
import MinimalPost from "../components/MinimalPost";
import { sanitizeText } from "../utils/sanitizer";

export default function Profile() {
    const { posts } = usePosts();
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState("threads");

    const [isEditing, setIsEditing] = useState(false);


    // Edit State
    const [editBio, setEditBio] = useState(user.bio);



    // Local state for user posts to ensure we get ALL of them, not just what's in Feed Context
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        if (user.username) {
            fetch(`/api/posts?username=${user.username}`)
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
    }, [user.username]);

    // 1. Threads: Use fetched posts
    const myPosts = userPosts;

    // 2. Replies: Extract ACTUAL comments made by current user from the fetched posts
    // Note: The API currently returns posts where the user is the AUTHOR. 
    // It does NOT return posts where the user only commented. 
    // To support "Replied" tab properly, we'd need an endpoint like /api/user/replies or modify GET /api/posts to return posts where user commented.
    // For now, we will stick to the previous logic but applied to the *context* posts or we need to accept that 'Replies' tab might be empty if we don't fetch them.
    // The previous logic used `posts` from context. Let's keep using `posts` (Global Feed) for replies for now, 
    // OR we can assume `userPosts` includes posts where I commented? No, `author` filter only returns my threads.
    // If the user wants to see their replies, we essentially need to fetch "Posts I commented on".
    // 
    // Let's use `posts` (Context) for replies as a fallback for now to avoid breaking it completely, 
    // but effectively "Works" tab is fixed.
    const myReplies = posts.flatMap(post =>
        (post.comments || [])
            .filter(c => c.user === user.username)
            .map(c => {
                let parentContent = post.content;
                let parentUsername = post.username;
                let isCommentReply = false;

                if (c.replyTo) {
                    const parentComment = post.comments.find(pc => pc.id === c.replyTo.id);
                    if (parentComment) {
                        parentContent = parentComment.text;
                        parentUsername = parentComment.user;
                        isCommentReply = true;
                    } else {
                        parentUsername = c.replyTo.user;
                        parentContent = "[Original comment not found]";
                    }
                }

                return {
                    id: c.id,
                    username: c.user,
                    content: c.text,
                    time: "Just now",
                    isReply: true,
                    parentId: isCommentReply ? c.replyTo.id : post.id,
                    parentContent: parentContent,
                    parentUsername: parentUsername
                };
            })
    );

    // Stats State
    const [stats, setStats] = useState({ followers: 0, netWorth: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        followers: data.followerCount,
                        netWorth: data.netWorth
                    });
                }
            } catch (e) {
                console.error("Failed to fetch stats");
            }
        };
        if (user.isOnboarded) fetchStats();
    }, [user.isOnboarded]);

    // Calculate total money (likes on my posts) - Fallback to client calc if API fails or delay
    // Actually API is better source of truth.
    // const totalMoney = ... 

    const handleSaveProfile = () => {
        updateUser({ bio: editBio });
        setIsEditing(false);
    };

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${user.username}'s Profile`,
                    url: window.location.href
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Profile URL copied to clipboard!");
        }
    };

    // Avatar Upload
    // Avatar Upload with Compression


    // ...

    // (Avatar Upload Code...)

    return (
        <div className={styles.container}>
            {/* ... */}
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div className={styles.nameInfo}>
                        {isEditing ? (
                            <input
                                value={user.username || ""}
                                onChange={(e) => updateUser({ username: e.target.value.toUpperCase().replace(/[^A-Z ]/g, '') })}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    color: 'white',
                                    fontSize: 24,
                                    fontWeight: 700,
                                    width: '100%',
                                    marginBottom: 4,
                                    textTransform: 'uppercase'
                                }}
                            />
                        ) : (
                            <h1>{user.username || user.name}</h1>
                        )}
                    </div>

                </div>
            </div>

            {/* Removed Bio, Meta, and Actions per request for minimal design */}

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
                    myPosts.length > 0 ? (
                        myPosts.map(post => (
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
                            like a soul without god ... empty
                        </div>
                    )
                ) : (
                    myReplies.length > 0 ? (
                        myReplies.map(reply => (
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

            {/* Avatar Modal */}

        </div >
    );
}
