"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DMsContext = createContext();


export function DMsProvider({ children }) {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/dms');
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (error) {
                console.error("Failed to fetch DMs:", error);
            }
        };

        fetchConversations();
        // Polling every 10s
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    const getConversation = (username) => {
        // Find existing for basic info, but messages might be empty
        // In real app, we should fetch history here if empty?
        // Let's rely on ChatPage to fetch its own messages?
        // But ChatPage currently uses `getConversation`.
        // I will make `getConversation` simpler.
        return conversations.find(c => c.user === username) || { user: username, messages: [] };
    };

    const sendMessage = async (toUser, text) => {
        // Optimistic UI update
        const newMessage = {
            id: Date.now(),
            sender: "currentUser",
            text,
            timestamp: "Just now"
        };

        setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.user === toUser);
            if (existingIndex >= 0) {
                const updated = {
                    ...prev[existingIndex],
                    lastMessage: text,
                    timestamp: "Just now",
                    messages: [...(prev[existingIndex].messages || []), newMessage]
                };
                return [updated, ...prev.filter(c => c.user !== toUser)];
            } else {
                return [{
                    id: `temp_${Date.now()}`,
                    user: toUser,
                    lastMessage: text,
                    timestamp: "Just now",
                    unread: false,
                    messages: [newMessage]
                }, ...prev];
            }
        });

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toUser, text })
            });
            // Re-fetch to sync IDs or rely on polling
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <DMsContext.Provider value={{ conversations, getConversation, sendMessage }}>
            {children}
        </DMsContext.Provider>
    );
}

export function useDMs() {
    return useContext(DMsContext);
}
