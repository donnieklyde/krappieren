"use client";

import { createContext, useContext, useState } from "react";

const DMsContext = createContext();

const INITIAL_CONVERSATIONS = [
    {
        id: "conv_1",
        user: "zuck",
        lastMessage: "Metaverse is the future, trust me.",
        timestamp: "2h",
        unread: true,
        messages: [
            { id: 1, sender: "zuck", text: "Yo, you seeing this?", timestamp: "2h" },
            { id: 2, sender: "currentUser", text: "Seeing what?", timestamp: "2h" },
            { id: 3, sender: "zuck", text: "Metaverse is the future, trust me.", timestamp: "2h" }
        ]
    },
    {
        id: "conv_2",
        user: "elonmusk",
        lastMessage: "Looking into it.",
        timestamp: "5h",
        unread: false,
        messages: [
            { id: 1, sender: "currentUser", text: "When is the next flight?", timestamp: "6h" },
            { id: 2, sender: "elonmusk", text: "Looking into it.", timestamp: "5h" }
        ]
    },
    {
        id: "conv_3",
        user: "mom",
        lastMessage: "Call me when you can.",
        timestamp: "1d",
        unread: true,
        messages: []
    },
    {
        id: "conv_4",
        user: "ex_girlfriend",
        lastMessage: "I miss the dog.",
        timestamp: "2d",
        unread: false,
        messages: []
    },
    {
        id: "conv_5",
        user: "boss_man",
        lastMessage: "Can you come in on Saturday?",
        timestamp: "3d",
        unread: true,
        messages: []
    },
    {
        id: "conv_6",
        user: "recruiter_dave",
        lastMessage: "I have a great opportunity for you...",
        timestamp: "4d",
        unread: false,
        messages: []
    },
    {
        id: "conv_7",
        user: "crypto_scam",
        lastMessage: "Invest $500 get $5000 in 24h!",
        timestamp: "5d",
        unread: false,
        messages: []
    },
    {
        id: "conv_8",
        user: "pizza_place",
        lastMessage: "Your order is out for delivery.",
        timestamp: "1w",
        unread: false,
        messages: []
    },
    {
        id: "conv_9",
        user: "gym_buddy",
        lastMessage: "Leg day tomorrow?",
        timestamp: "1w",
        unread: false,
        messages: []
    },
    {
        id: "conv_10",
        user: "landlord",
        lastMessage: "Rent is due.",
        timestamp: "1w",
        unread: false,
        messages: []
    },
    {
        id: "conv_11",
        user: "uber_driver",
        lastMessage: "I'm here.",
        timestamp: "2w",
        unread: false,
        messages: []
    },
    {
        id: "conv_12",
        user: "amazon_delivery",
        lastMessage: "Package delivered to front door.",
        timestamp: "2w",
        unread: false,
        messages: []
    },
    {
        id: "conv_13",
        user: "unknown_number",
        lastMessage: "Is this Steve?",
        timestamp: "3w",
        unread: false,
        messages: []
    },
    {
        id: "conv_14",
        user: "tech_support",
        lastMessage: "Did you try turning it off and on again?",
        timestamp: "1mo",
        unread: false,
        messages: []
    },
    {
        id: "conv_15",
        user: "bestie",
        lastMessage: "LOL",
        timestamp: "1mo",
        unread: false,
        messages: []
    },
    {
        id: "conv_16",
        user: "study_group",
        lastMessage: "Exam is cancelled!",
        timestamp: "1mo",
        unread: false,
        messages: []
    },
    {
        id: "conv_17",
        user: "marketing_spam",
        lastMessage: "Huge sale! 50% off everything.",
        timestamp: "2mo",
        unread: false,
        messages: []
    },
    {
        id: "conv_18",
        user: "linkedin_bot",
        lastMessage: "Congrats on your work anniversary!",
        timestamp: "3mo",
        unread: false,
        messages: []
    },
    {
        id: "conv_19",
        user: "old_friend",
        lastMessage: "Long time no see.",
        timestamp: "1y",
        unread: false,
        messages: []
    },
    {
        id: "conv_20",
        user: "myself",
        lastMessage: "Grocery list: Eggs, Milk, Bread.",
        timestamp: "1y",
        unread: false,
        messages: []
    }
];

export function DMsProvider({ children }) {
    const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);

    const getConversation = (username) => {
        return conversations.find(c => c.user === username) || { user: username, messages: [] };
    };

    const sendMessage = (toUser, text) => {
        setConversations(prev => {
            const existingConvIndex = prev.findIndex(c => c.user === toUser);

            const newMessage = {
                id: Date.now(),
                sender: "currentUser",
                text,
                timestamp: "Just now"
            };

            if (existingConvIndex >= 0) {
                // Update existing conversation
                const newConvs = [...prev];
                const conv = newConvs[existingConvIndex];
                newConvs[existingConvIndex] = {
                    ...conv,
                    lastMessage: text,
                    timestamp: "Just now",
                    messages: [...conv.messages, newMessage]
                };
                // Move to top
                newConvs.splice(existingConvIndex, 1);
                newConvs.unshift(newConvs[existingConvIndex]); // Wait, I just removed it. 
                // Correct logic: remove then unshift the updated one
                // Actually safer:
                const updatedConv = {
                    ...conv,
                    lastMessage: text,
                    timestamp: "Just now",
                    messages: [...conv.messages, newMessage]
                };
                return [updatedConv, ...prev.filter(c => c.user !== toUser)];
            } else {
                // Create new conversation
                const newConv = {
                    id: Date.now().toString(),
                    user: toUser,
                    lastMessage: text,
                    timestamp: "Just now",
                    unread: false,
                    messages: [newMessage]
                };
                return [newConv, ...prev];
            }
        });
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
