"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_POSTS, INITIAL_ACTIVITIES } from "../data/mockData";

const PostsContext = createContext();

export function PostsProvider({ children }) {
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [followedUsers, setFollowedUsers] = useState(['zuck']); // Init with one for testing
    const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/posts');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setPosts(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            }
        };
        fetchPosts();
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

    const addPost = (content, user = { username: "currentUser", avatarUrl: "" }) => {
        const newPost = {
            id: Date.now(),
            username: user.username,
            content,
            time: "Just now",
            likes: 0,
            replies: 0,
            avatarUrl: user.avatarUrl || "",
            comments: []
        };
        setPosts(prev => [newPost, ...prev]);
        checkMentions(content);
    };

    const addComment = (postId, text, replyTo = null, username = "currentUser") => {
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === postId) {
                const newComment = {
                    id: Date.now(),
                    user: username,
                    text,
                    replyTo // { id: 123, user: "somebody" }
                };
                return {
                    ...post,
                    comments: [...(post.comments || []), newComment]
                };
            }
            return post;
        }));
        checkMentions(text);
    };

    const toggleLike = (id) => {
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
    };

    const toggleFollow = (username) => {
        if (followedUsers.includes(username)) {
            setFollowedUsers(followedUsers.filter(u => u !== username));
        } else {
            setFollowedUsers([...followedUsers, username]);
        }
    };

    return (
        <PostsContext.Provider value={{ posts, addPost, toggleLike, addComment, followedUsers, toggleFollow, activities }}>
            {children}
        </PostsContext.Provider>
    );
}

export function usePosts() {
    return useContext(PostsContext);
}
