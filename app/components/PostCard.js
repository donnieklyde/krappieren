"use client";
import { useState, useRef } from "react";
import styles from "./PostCard.module.css";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sanitizeText } from "../utils/sanitizer";

const MoneyIcon = () => (
    <span style={{ fontSize: 32, fontWeight: 'bold', fontFamily: 'Bahnschrift' }}>$</span>
);

// ... imports

export default function PostCard({ id, username, content, time, likes, likedByMe, avatarUrl, comments = [], isStatic = false, onReply, activeReplyId, isGuest = false }) {
    const { toggleLike, followedUsers, toggleFollow } = usePosts();
    const { user } = useUser();
    const [moneyAnims, setMoneyAnims] = useState([]);
    const router = useRouter();

    const isFollowed = followedUsers.includes(username);

    // Long Press Logic State
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const handleMoney = (e) => {
        e.stopPropagation();
        if (isGuest) return; // Should be hidden anyway, but safety check
        const direction = likedByMe ? 'down' : 'up';
        toggleLike(id);
        const newAnim = { id: Date.now(), x: Math.random() * 40 + 20, direction };
        setMoneyAnims(prev => [...prev, newAnim]);
        setTimeout(() => {
            setMoneyAnims(prev => prev.filter(a => a.id !== newAnim.id));
        }, 600);
    };

    // ----- Interaction Handlers -----

    const startPress = (e, targetUser) => {
        if (isGuest) return;
        e.stopPropagation(); // Stop Feed from tracking this touch
        if (e.type === 'click' && e.button !== 0) return;

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            if (targetUser !== "currentUser") {
                toggleFollow(targetUser);
                if (window.navigator && window.navigator.vibrate) {
                    try {
                        window.navigator.vibrate(50);
                    } catch (err) {
                        console.error("Vibration failed", err);
                    }
                }
            }
        }, 600);
    };

    const endPress = (e, targetUser) => {
        if (isGuest) return;
        e.stopPropagation(); // Always stop propagation

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // If it WASN'T a long press, treat as Short Click
        if (!isLongPress.current) {
            if (targetUser === "currentUser") {
                router.push('/profile');
            } else {
                router.push(`/profile/${targetUser}`);
            }
        }

        isLongPress.current = false;
    };

    const cancelPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isLongPress.current = false;
    };

    // Helper for YAHWEH check
    const isYahweh = (name) => name.toLowerCase() === 'yahweh';

    return (
        <article className={styles.card} style={isStatic ? { height: 'auto', background: 'transparent' } : {}}>
            <div
                className={`${styles.contentBox} ${isStatic ? styles.staticBox : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <span style={{ color: '#888', marginRight: 1 }}>@</span>
                    <span
                        className={`${styles.username} ${isFollowed && !isYahweh(username) ? styles.golden : ''}`}

                        onMouseDown={(e) => startPress(e, username)}
                        onMouseUp={(e) => endPress(e, username)}
                        onMouseLeave={cancelPress}

                        onTouchStart={(e) => startPress(e, username)}
                        onTouchEnd={(e) => {
                            endPress(e, username);
                        }}
                        onContextMenu={(e) => e.preventDefault()}

                        title={isFollowed ? "Hold to Quit Boss / Tap for Profile" : "Hold to Serve / Tap for Profile"}
                        style={{
                            cursor: isGuest ? 'default' : 'pointer',
                            userSelect: 'none',
                            color: isYahweh(username) ? '#FFD700' : (isFollowed ? '#FF00FF' : undefined)
                        }}
                    >
                        {username}
                    </span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span className={styles.time}>{time}</span>
                </div>

                <div className={styles.text}>{sanitizeText(content)}</div>

                {!isGuest && (user?.username !== username) && (
                    <div className={styles.splashContainer}>
                        <button
                            className={`${styles.splashBtn} ${likedByMe ? styles.active : ''}`}
                            onClick={handleMoney}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                        >
                            <MoneyIcon />
                            {moneyAnims.map(a => (
                                <div
                                    key={a.id}
                                    className={`${styles.drip} ${a.direction === 'up' ? styles.up : styles.down}`}
                                    style={{ left: a.x }}
                                >
                                    $
                                </div>
                            ))}
                        </button>
                        <div className={styles.splashCount}>${likes}</div>
                    </div>
                )}

                {!isGuest && (
                    <div className={styles.commentsSection}>
                        {comments && comments.length > 0 ? (() => {
                            // 1. Organize comments into a tree
                            const organizeComments = (rawComments) => {
                                const map = {};
                                const roots = [];

                                // Create separate copies to avoid mutation issues
                                const nodes = rawComments.map(c => ({ ...c, children: [] }));
                                nodes.forEach(n => map[n.id] = n);

                                nodes.forEach(n => {
                                    if (n.replyTo && map[n.replyTo.id]) {
                                        map[n.replyTo.id].children.push(n);
                                    } else {
                                        roots.push(n);
                                    }
                                });
                                return roots;
                            };

                            const commentRoots = organizeComments(comments);


                            // 2. Recursive Render Component
                            const CommentNode = ({ comment, depth }) => {
                                const isCommentUserFollowed = followedUsers.includes(comment.user);
                                const isSelected = activeReplyId === comment.id;
                                const isCommentYahweh = isYahweh(comment.user);

                                // Parse text to highlight mentions (words starting with @)
                                const formatText = (text) => {
                                    const parts = text.split(/(@\w+)/g);
                                    return parts.map((part, index) => {
                                        if (part.match(/^@\w+/)) {
                                            return (
                                                <span
                                                    key={index}
                                                    style={{
                                                        color: isSelected ? '#000' : '#fff', // White in dark mode, Black in selected
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {part}
                                                </span>
                                            );
                                        }
                                        return part;
                                    });
                                };

                                return (
                                    <>
                                        <div
                                            key={comment.id}
                                            className={styles.comment}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Set reply target
                                                if (onReply) onReply(comment);
                                            }}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            onTouchEnd={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                            title="Click to reply"
                                            style={isSelected ? {
                                                background: '#ffffff',
                                                color: '#000000',
                                                borderRadius: '5px',
                                                marginLeft: depth * 20,
                                                padding: '15px',
                                                borderLeft: depth > 0 ? '1px solid #444' : 'none'
                                            } : {
                                                marginLeft: depth * 20,
                                                padding: '15px',
                                                borderLeft: depth > 0 ? '1px solid #444' : 'none'
                                            }}
                                        >
                                            <span style={{ color: '#666', marginRight: 1 }}>@</span>
                                            <span
                                                className={`${styles.commentUser} ${isCommentUserFollowed && !isCommentYahweh ? styles.golden : ''}`}
                                                onMouseDown={(e) => { e.stopPropagation(); startPress(e, comment.user); }}
                                                onMouseUp={(e) => { e.stopPropagation(); endPress(e, comment.user); }}
                                                onMouseLeave={cancelPress}
                                                onTouchStart={(e) => { e.stopPropagation(); startPress(e, comment.user); }}
                                                onTouchEnd={(e) => { e.stopPropagation(); endPress(e, comment.user); }}
                                                onContextMenu={(e) => e.preventDefault()}
                                                title={isCommentUserFollowed ? "My Boss" : "Serve"}
                                                style={{
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                    color: isSelected ? 'black' :
                                                        (isCommentYahweh ? '#FFD700' :
                                                            (isCommentUserFollowed ? '#FF00FF' : 'var(--accent)'))
                                                }}
                                            >
                                                {comment.user}
                                            </span>
                                            <span className={styles.commentText} style={{ color: isSelected ? 'black' : 'inherit' }}>
                                                {formatText(sanitizeText(comment.text))}
                                            </span>
                                        </div>
                                        {/* Render Children */}
                                        {comment.children.length > 0 && comment.children.map(child => (
                                            <CommentNode key={child.id} comment={child} depth={depth + 1} />
                                        ))}
                                    </>
                                );
                            };



                            return commentRoots.map(root => (
                                <CommentNode key={root.id} comment={root} depth={0} />
                            ));
                        })() : (
                            <div className={styles.comment} style={{ fontStyle: 'italic', opacity: 0.5 }}>No comments yet.</div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
