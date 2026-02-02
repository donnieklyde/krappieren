"use client";
import { useState } from "react";
import styles from "./CreatePost.module.css";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";

import { sanitizeText } from "../utils/sanitizer";

export default function CreatePost() {
    const [content, setContent] = useState("");
    const { addPost } = usePosts();
    const { user, updateUser } = useUser();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState("");

    const isPostable = content.trim().length > 0;

    const handleInput = (e) => {
        const value = e.target.value;
        let sanitizedValue = sanitizeText(value);

        if (sanitizedValue.length > 100) {
            sanitizedValue = sanitizedValue.substring(0, 100);
        }

        setContent(sanitizedValue);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;

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
        // Replace last word with @user
        const words = content.split(/([\s\n]+)/); // split but keep delimiters
        // Find last word that is the trigger
        // Actually simple split by space logic might be tricky with newlines.
        // Let's simple regex replace the end
        const newContent = content.replace(/@\w*$/, `@${user} `);
        setContent(newContent);
        setShowSuggestions(false);

        // Refocus (optional, but good UX)
        const textarea = document.querySelector(`.${styles.input}`);
        if (textarea) textarea.focus();
    };

    const handlePost = () => {
        if (!isPostable) return;

        addPost(content, { username: user.username, avatarUrl: user.avatar }, language); // Pass user object

        // Auto-learn language from posts
        // If user doesn't have this language enabled yet, enable it.
        const currentLanguages = user.languages || {};
        if (!currentLanguages[language]) {
            // We update the user profile to include this language
            const updatedLanguages = {
                ...currentLanguages,
                [language]: true
            };
            updateUser({ languages: updatedLanguages });
        }

        setContent("");
        setShowSuggestions(false);
        // Reset height
        const textarea = document.querySelector(`.${styles.input}`);
        if (textarea) textarea.style.height = 'auto';
    };



    return (
        <div className={styles.container}>

            <div className={styles.inputContainer}>
                <div className={styles.header}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{user.username}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                        {content && (
                            <button
                                className={`${styles.postButton} ${isPostable ? styles.active : ""}`}
                                onClick={handlePost}
                            >
                                Post
                            </button>
                        )}
                    </div>
                </div>
                <textarea
                    className={styles.input}
                    placeholder="Start a thread... (max 100 chars)"
                    maxLength={100}
                    value={content}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (e.ctrlKey) {
                                // Ctrl+Enter: Insert newline
                                e.preventDefault();
                                const start = e.target.selectionStart;
                                const end = e.target.selectionEnd;
                                const newContent = content.substring(0, start) + "\n" + content.substring(end);
                                setContent(newContent);
                            } else {
                                // Enter only: Submit
                                e.preventDefault();
                                handlePost();
                            }
                        }
                    }}
                    rows={1}
                />




                <div className={styles.footer}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {/* Paperclip icon or similar could go here */}
                    </div>
                    {content.length > 0 && (
                        <span style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: `hsl(${120 - ((content.length / 100) * 120)}, 100%, 50%)`, // Green (120) to Red (0)
                            transition: 'color 0.2s'
                        }}>
                            {100 - content.length}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
