"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./profile.module.css";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";
import MinimalPost from "../components/MinimalPost";

export default function Profile() {
    const { posts } = usePosts();
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState("threads");

    const [isEditing, setIsEditing] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    // Edit State
    const [editBio, setEditBio] = useState(user.bio);
    const fileInputRef = useRef(null);


    // 1. Threads: Posts created by current user
    const myPosts = posts.filter(post => post.username === user.username);

    // 2. Replies: Extract ACTUAL comments made by current user
    const myReplies = posts.flatMap(post =>
        (post.comments || [])
            .filter(c => c.user === user.username)
            .map(c => {
                // Determine the parent. If c.replyTo exists, it's a comment. Else it's the post.
                // We want "chain of interaction".
                // Simple version: Parent is either the ReplyTarget (if comment) or Post (if top-level comment).

                let parentContent = post.content;
                let parentUsername = post.username;
                let isCommentReply = false;

                if (c.replyTo) {
                    // It's a reply to a comment
                    // We try to find the comment text? Or just use the info saved in c.replyTo
                    // postsContext stores replyTo as full object { id, user } usually? 
                    // No, my implementation in PostsContext was `replyTo // { id: 123, user: "somebody" }`
                    // But I didn't store the TEXT of the parent comment.
                    // Ideally we should find it.
                    const parentComment = post.comments.find(pc => pc.id === c.replyTo.id);
                    if (parentComment) {
                        parentContent = parentComment.text;
                        parentUsername = parentComment.user;
                        isCommentReply = true;
                    } else {
                        // Fallback if not found (maybe deleted?)
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
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatar: reader.result }); // Set base64 for now
            };
            reader.readAsDataURL(file);
        }
    };

    // ...

    // (Avatar Upload Code...)

    return (
        <div className={styles.container}>
            {/* ... */}
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div className={styles.nameInfo}>
                        <h1>{user.name || user.username}</h1>
                    </div>
                    <div className={styles.avatar} onClick={() => isEditing ? fileInputRef.current?.click() : setIsAvatarModalOpen(true)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={user.avatar || "https://github.com/shadcn.png"}
                            alt="avatar"
                        />
                        {isEditing && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }}>
                                EDIT
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>
                <div className={styles.bio}>
                    {isEditing ? (
                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={editBio}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length <= 100) setEditBio(val);
                                }}
                                className={styles.bioInput}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    color: 'white',
                                    padding: '10px 10px 24px 10px', // Extra bottom padding for counter
                                    borderRadius: 8,
                                    resize: 'none',
                                    fontFamily: 'inherit'
                                }}
                                rows={3}
                            />
                            {editBio.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 12,
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: `hsl(${120 - ((editBio.length / 100) * 120)}, 100%, 50%)`,
                                    pointerEvents: 'none'
                                }}>
                                    {100 - editBio.length}
                                </div>
                            )}
                        </div>
                    ) : (
                        user.bio
                    )}
                </div>

                <div className={styles.meta}>
                    <span style={{ color: 'gold', fontWeight: 'bold' }}>${stats.netWorth} Net Worth</span>
                    <span>{stats.followers} slaves</span>
                </div>

                <div className={styles.actions}>
                    {isEditing ? (
                        <button className={styles.editButton} onClick={handleSaveProfile} style={{ background: 'white', color: 'black' }}>Save Profile</button>
                    ) : (
                        <button className={styles.editButton} onClick={() => setIsEditing(true)}>Edit profile</button>
                    )}
                    <button className={styles.editButton} onClick={handleShare}>Share profile</button>
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
                    myPosts.length > 0 ? (
                        myPosts.map(post => (
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
            {
                isAvatarModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsAvatarModalOpen(false)}>
                        <div onClick={(e) => e.stopPropagation()}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.avatar}
                                alt="Profile Full"
                                className={styles.modalImage}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
