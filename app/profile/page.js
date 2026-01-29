"use client";
import { useState } from "react";
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

    // Calculate total money (likes on my posts)
    const totalMoney = myPosts.reduce((acc, post) => acc + (post.likes || 0), 0);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Profile link copied to clipboard!");
    };

    const handleSaveProfile = () => {
        updateUser({ bio: editBio });
        setIsEditing(false);
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

    return (
        <div className={styles.container}>
            {/* Edit Modal */}
            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#111', padding: 20, borderRadius: 15, width: '90%', maxWidth: 400,
                        border: '1px solid #333'
                    }}>
                        <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>Edit Profile</h2>

                        <div style={{ marginBottom: 15, textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={user.avatar}
                                    alt="Profile"
                                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', opacity: 0.7 }}
                                />
                                <label htmlFor="avatar-upload" style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer', color: 'white', fontWeight: 'bold', fontSize: 12, textShadow: '0 1px 3px black'
                                }}>
                                    CHANGE
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, color: '#888' }}>Bio</label>
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value.replace(/[;,:._\-'#*+~`´?=\(\)/&%$§"!²³\{\[\]}\\]/g, ""))}
                                style={{ width: '100%', background: 'black', border: '1px solid #333', color: 'white', padding: 10, borderRadius: 5, resize: 'none', height: 80 }}
                            />
                        </div>



                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{ flex: 1, padding: 10, border: '1px solid #333', borderRadius: 8, color: 'white' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                style={{ flex: 1, padding: 10, background: 'white', color: 'black', borderRadius: 8, fontWeight: 'bold' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div onClick={() => setIsAvatarModalOpen(true)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className={styles.avatar}
                            />
                        </div>
                        <div className={styles.nameInfo}>
                            <h1>{user.username}</h1>
                            <div className={styles.username}>
                                {user.username}
                            </div>
                        </div>
                    </div>

                </div>

                <div className={styles.bio}>
                    {user.bio}
                </div>

                <div className={styles.meta}>
                    <span style={{ color: 'gold', fontWeight: 'bold' }}>${totalMoney} Net Worth</span>
                    <span>12 slaves</span>
                </div>

                <div className={styles.actions}>
                    <button className={styles.editButton} onClick={() => setIsEditing(true)}>Edit profile</button>
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
