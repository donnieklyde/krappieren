"use client";

import { createContext, useContext, useState, useEffect } from "react";

const PostsContext = createContext();

export function PostsProvider({ children }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchPosts = async (isSticky = false) => {
            try {
                const url = isSticky ? '/api/posts?sticky=true' : '/api/posts';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setPosts(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };



        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/user/activity');
                if (res.ok) {
                    const data = await res.json();
                    // Format time relative (simple version)
                    const formattedData = data.map(item => ({
                        ...item,
                        time: new Date(item.time).toLocaleDateString() === new Date().toLocaleDateString()
                            ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(item.time).toLocaleDateString()
                    }));
                    setActivities(formattedData);
                }
            } catch (error) {
                console.error("Failed to fetch activity:", error);
            }
        };

        fetchPosts(true); // Initial load: Sticky
        fetchActivity();

        // Poll for updates every 5 seconds (No Sticky)
        const interval = setInterval(() => {
            fetchActivity();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const checkMentions = (text) => {
        const mentions = text.match(/@(\w+)/g);
        if (mentions) {
            mentions.forEach(mention => {
                const username = mention.substring(1); // remove @
                // Add to activities
                const newActivity = {
                    id: Date.now() + Math.random(),
                    type: 'mention',
                    user: username,
                    amount: 0,
                    time: 'Just now'
                };
                setActivities(prev => [newActivity, ...prev]);
            });
        }
    };

    const addPost = async (content, user = { username: "currentUser", avatarUrl: "" }, language = 'english') => {
        // Optimistic update
        const tempId = Date.now();
        const optimisticPost = {
            id: tempId,
            username: user.username || "currentUser", // Fallback
            content,
            time: "Just now",
            likes: 0,
            replies: 0,
            avatarUrl: user.avatarUrl || "",
            comments: [],
            language // Optimistic language
        };
        setPosts(prev => [optimisticPost, ...prev]);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, language }) // Use detected language
            });
            if (res.ok) {
                const realPost = await res.json();
                // Replace optimistic post with real one
                setPosts(prev => prev.map(p => p.id === tempId ? realPost : p));
            }
        } catch (error) {
            console.error("Failed to save post", error);
            // Could revert here
        }

        checkMentions(content);
    };

    const addComment = async (postId, text, replyTo = null, username = "currentUser") => {
        // Optimistic
        const tempId = Date.now();
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === postId) {
                const newComment = {
                    id: tempId,
                    user: username,
                    text,
                    replyTo
                };
                return {
                    ...post,
                    comments: [...(post.comments || []), newComment]
                };
            }
            return post;
        }));

        try {
            const res = await fetch('/api/posts/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, text, replyTo })
            });
            // We don't necessarily need to replace the comment if ID isn't critical immediately
        } catch (error) {
            console.error("Failed to save comment", error);
        }

        checkMentions(text);
    };

    const toggleLike = async (id) => {
        // Optimistic update
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === id) {
                const likedByMe = post.likedByMe || false; // default false
                return {
                    ...post,
                    likes: likedByMe ? post.likes - 1 : post.likes + 1,
                    likedByMe: !likedByMe
                };
            }
            return post;
        }));

        // API Call
        try {
            await fetch('/api/posts/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: id })
            });
            // Could re-fetch posts here to ensure sync, or just trust optimistic update
        } catch (error) {
            console.error("Failed to toggle like API", error);
            // Revert on error (optional, but good practice. skipped for brevity in this step)
        }
    };



    const toggleCommentLike = async (commentId, postId) => {
        // Optimistic update
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: post.comments.map(c => {
                        if (c.id === commentId) {
                            return { ...c, likedByMe: !c.likedByMe };
                        }
                        return c;
                    })
                };
            }
            return post;
        }));

        try {
            await fetch('/api/posts/comment/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId })
            });
        } catch (error) {
            console.error("Failed to toggle comment like", error);
        }
    };

    return (
        <PostsContext.Provider value={{ posts, loading, addPost, toggleLike, addComment, activities, toggleCommentLike }}>
            {children}
        </PostsContext.Provider>
    );
}

export function usePosts() {
    return useContext(PostsContext);
}
