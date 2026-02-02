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
    <div className={styles.text}>{sanitizeText(content)}</div>

    {
        !isGuest && (
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
                                        borderLeft: depth > 0 ? '1px solid #444' : 'none',
                                        position: 'relative' // For absolute button
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
                                </div >
                                {/* Render Children */}
                                {
                                    comment.children.length > 0 && comment.children.map(child => (
                                        <CommentNode key={child.id} comment={child} depth={depth + 1} />
                                    ))
                                }
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
            </div >
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
