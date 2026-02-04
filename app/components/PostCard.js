"use client";
import { useState, useRef } from "react";
import styles from "./PostCard.module.css";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { sanitizeText } from "../utils/sanitizer";

export default function PostCard({ id, username, content, time, avatarUrl, comments = [], isStatic = false, onReply, activeReplyId, isGuest = false, likes = 0, hasLiked = false }) {
    const { user } = useUser();
    const router = useRouter();
    const [showBanModal, setShowBanModal] = useState(false);
    const [banTarget, setBanTarget] = useState(null);
    const [banReason, setBanReason] = useState("");
    const [isBanning, setIsBanning] = useState(false);

    // Likes / Same Here State
    const [likeCount, setLikeCount] = useState(likes);
    const [isLiked, setIsLiked] = useState(hasLiked);

    // Stats State

    const [isFollowing, setIsFollowing] = useState(false); // Optimistic, ideally passed as prop


    // Long Press Logic State
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    // Helper function to check if user is Yahweh
    const isYahweh = (targetUser) => {
        return targetUser?.toLowerCase() === 'donnieklyde';
    };

    // ----- Interaction Handlers -----
    const startPress = (e, targetUser) => {
        if (isGuest) return;
        e.stopPropagation();
        if (e.type === 'click' && e.button !== 0) return;

        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            if (user?.username?.toLowerCase() === 'donnieklyde' && !isYahweh(targetUser)) {
                setBanTarget(targetUser);
                setShowBanModal(true);
            } else if (user?.username !== targetUser) {
                // Determine functionality based on target
                // If not Yahweh banning, then it's BOSS functionality (Follow)
                toggleFollow(targetUser);
            }
            if (window.navigator && window.navigator.vibrate) {
                try {
                    window.navigator.vibrate(50);
                } catch (err) {
                    console.error("Vibration failed", err);
                }
            }
        }, 600);
    };

    const endPress = (e, targetUser) => {
        if (isGuest) return;
        e.stopPropagation();

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // If it WASN'T a long press, treat as Short Click
        if (!isLongPress.current) {
            if (targetUser === user?.username) {
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

    const handleDoubleClick = (e, targetUser) => {
        e.stopPropagation();
        cancelPress();
        router.push(`/profile/${targetUser}`);
    };

    const executeBan = async () => {
        setIsBanning(true);
        try {
            const res = await fetch('/api/admin/ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: banTarget, reason: banReason })
            });
            if (res.ok) {
                alert(`${banTarget} has been OBLITERATED.`);
                setShowBanModal(false);
                setBanTarget(null);
                setBanReason("");
                router.refresh();
            }
        } catch (err) {
            alert("Failed to execute");
        } finally {
            setIsBanning(false);
        }
    };

    const toggleSameHere = async () => {
        if (!user) return;

        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!previousLiked);
        setLikeCount(prev => previousLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch('/api/posts/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: id })
            });

            if (!res.ok) {
                setIsLiked(previousLiked);
                setLikeCount(previousCount);
            }
        } catch (err) {
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
        }
    };

    const toggleFollow = async (targetUser) => {
        if (!user) return router.push('/');

        try {
            const res = await fetch('/api/user/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: targetUser })
            });
            const data = await res.json();
            if (data.following) {
                alert(`You are now the BOSS of ${targetUser}`);
            } else {
                alert(`You fired ${targetUser}`);
            }
        } catch (err) {
            console.error("Follow failed", err);
        }
    };




    return (
        <article className={styles.card} style={isStatic ? { height: 'auto', background: 'transparent' } : {}}>
            <div
                className={`${styles.contentBox} ${isStatic ? styles.staticBox : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <span
                        className={styles.username}
                        onMouseDown={(e) => startPress(e, username)}
                        onMouseUp={(e) => endPress(e, username)}
                        onMouseLeave={cancelPress}
                        onDoubleClick={(e) => handleDoubleClick(e, username)}
                        onTouchStart={(e) => startPress(e, username)}
                        onTouchEnd={(e) => endPress(e, username)}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            color: isYahweh(username) ? '#FFD700' : 'var(--accent)'
                        }}
                    >
                        @{username}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#666', fontSize: 13 }}>{time}</span>

                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        className={styles.sameHereBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSameHere();
                        }}
                        style={{
                            fontWeight: isLiked ? 'bold' : 'normal',
                            opacity: isLiked ? 1 : 0.5
                        }}
                    >
                        same here {likeCount > 0 && `(${likeCount})`}
                    </button>
                    <span style={{ color: '#666', fontSize: 13 }}>{time}</span>
                </div>
            </div>


            <div className={styles.text}>{sanitizeText(content)}</div>

            {
                !isGuest && (
                    <div className={styles.commentsSection}>
                        {comments && comments.length > 0 ? (() => {
                            // 1. Organize comments into a tree
                            const organizeComments = (rawComments) => {
                                const map = {};
                                const roots = [];

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
                                const isSelected = activeReplyId === comment.id;
                                const isCommentYahweh = isYahweh(comment.user);

                                const formatText = (text) => {
                                    const parts = text.split(/(@\w+)/g);
                                    return parts.map((part, index) => {
                                        if (part.match(/^@\w+/)) {
                                            return (
                                                <span
                                                    key={index}
                                                    style={{
                                                        color: isSelected ? '#000' : '#fff',
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
                                                borderLeft: depth > 0 ? '1px solid #444' : 'none',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <span style={{ color: '#666', marginRight: 1 }}>@</span>
                                                <span
                                                    className={styles.commentUser}
                                                    onMouseDown={(e) => { e.stopPropagation(); startPress(e, comment.user); }}
                                                    onMouseUp={(e) => { e.stopPropagation(); endPress(e, comment.user); }}
                                                    onMouseLeave={cancelPress}
                                                    onDoubleClick={(e) => handleDoubleClick(e, comment.user)}
                                                    onTouchStart={(e) => { e.stopPropagation(); startPress(e, comment.user); }}
                                                    onTouchEnd={(e) => { e.stopPropagation(); endPress(e, comment.user); }}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    title="Click to reply"
                                                    style={{
                                                        cursor: 'pointer',
                                                        userSelect: 'none',
                                                        color: isSelected ? 'black' : (isCommentYahweh ? '#FFD700' : 'var(--accent)')
                                                    }}
                                                >
                                                    {comment.user}
                                                </span>
                                                <span className={styles.commentText} style={{ color: isSelected ? 'black' : 'inherit' }}>
                                                    {formatText(sanitizeText(comment.text))}
                                                </span>
                                            </div>
                                        </div>
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
                )
            }

            {
                showBanModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.9)', zIndex: 99999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            background: '#220000', border: '2px solid red', padding: 20,
                            width: '90%', maxWidth: 400, textAlign: 'center',
                            display: 'flex', flexDirection: 'column', gap: 15
                        }}>
                            <h2 style={{ color: 'red', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                                JUDGMENT DAY
                            </h2>
                            <p style={{ color: 'white', fontFamily: 'monospace' }}>
                                DELETE <strong>@{banTarget}</strong> FOREVER?
                            </p>
                            <textarea
                                placeholder="REASON FOR EXECUTION"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                style={{
                                    background: 'black', color: 'red', border: '1px solid red',
                                    padding: 10, fontFamily: 'monospace', minHeight: 80
                                }}
                            />
                            <button
                                onClick={executeBan}
                                disabled={isBanning}
                                style={{
                                    background: 'red', color: 'black', fontWeight: 'bold',
                                    padding: 15, border: 'none', cursor: 'pointer', fontFamily: 'monospace'
                                }}
                            >
                                {isBanning ? "OBLITERATING..." : "EXECUTE"}
                            </button>
                            <button
                                onClick={() => { setShowBanModal(false); setBanTarget(null); }}
                                style={{
                                    background: 'transparent', color: '#666',
                                    border: 'none', cursor: 'pointer', fontFamily: 'monospace'
                                }}
                            >
                                MERCY (CANCEL)
                            </button>
                        </div>
                    </div>
                )
            }
        </article >
    );

}
