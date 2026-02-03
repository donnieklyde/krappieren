"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./CommentDock.module.css";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";
import { sanitizeText } from "../utils/sanitizer";

export default function CommentDock({ postId, replyTo, onCancelReply }) {
    const [comment, setComment] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState("");
    const { addComment } = usePosts();
    const { user } = useUser();
    const textareaRef = useRef(null);

    // Reset comment when switching posts
    useEffect(() => {
        const t = setTimeout(() => {
            setComment("");
            setShowSuggestions(false);
        }, 0);
        return () => clearTimeout(t);
    }, [postId]);

    // Auto-fill @username when replying
    useEffect(() => {
        if (replyTo) {
            const t = setTimeout(() => {
                setComment(`@${replyTo.user} `);
            }, 0);
            // Focus and move cursor to end
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
            return () => clearTimeout(t);
        }
    }, [replyTo]);

    // Auto-grow effect
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [comment]);

    const handleInput = (e) => {
        const value = e.target.value;
        const cursorPosition = e.target.selectionStart; // Save cursor position
        let sanitizedValue = sanitizeText(value);

        if (sanitizedValue.length > 100) {
            sanitizedValue = sanitizedValue.substring(0, 100);
        }

        setComment(sanitizedValue);

        // Restore cursor position after state update
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }
        });

        // Check for @
        const lastWord = sanitizedValue.split(/[\s\n]+/).pop();
        if (lastWord.startsWith('@')) {
            setShowSuggestions(true);
            setSuggestionQuery(lastWord.substring(1).toLowerCase());
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectUser = (user) => {
        const newContent = comment.replace(/@\w*$/, `@${user} `);
        setComment(newContent);
        setShowSuggestions(false);
        if (textareaRef.current) textareaRef.current.focus();
    };


    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!comment.trim()) return;

        addComment(postId, comment, replyTo, user.username);
        setComment("");
        setShowSuggestions(false);
        if (onCancelReply) onCancelReply();
    };



    return (
        <div
            className={styles.dock}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            {replyTo && (
                <div className={styles.preview}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 12, color: '#aaa' }}>Replying to <b style={{ color: 'white' }}>@{replyTo.user}</b></span>
                        <span style={{ color: '#ccc', fontStyle: 'italic', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13 }}>&quot;{sanitizeText(replyTo.text)}&quot;</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCancelReply(); }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{ color: 'white', fontWeight: 'bold', background: '#333', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}
                    >X</button>
                </div>
            )}



            <form
                className={styles.form}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}
            >
                <textarea
                    ref={textareaRef}
                    className={styles.input}
                    placeholder={replyTo ? `Reply to @${replyTo.user}...` : "SAY SOMETHING..."}
                    value={comment}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        // Allow default behavior (newline) for Enter key
                        // No submission on Enter
                    }}
                    rows={1}
                    style={{ resize: 'none', height: 'auto', minHeight: '44px', paddingTop: '10px', overflow: 'hidden' }}
                />
                {comment.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        right: 125,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: `hsl(${120 - ((comment.length / 100) * 120)}, 100%, 50%)`,
                        pointerEvents: 'none'
                    }}>
                        {100 - comment.length}
                    </div>
                )}
                <button
                    type="submit"
                    className={styles.button}
                >
                    SEND
                </button>
            </form>
        </div>
    );
}
