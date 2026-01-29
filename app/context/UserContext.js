"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

const INITIAL_USER = {
    username: "currentUser",
    bio: "Building the future of social media. AI enthusiast.",
    avatar: "https://github.com/shadcn.png" // Placeholder
};

export function UserProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState({
        ...INITIAL_USER,
        isOnboarded: false
    });

    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user) return;

        const storedStr = localStorage.getItem('krappieren_user');
        let stored = storedStr ? JSON.parse(storedStr) : null;

        // Check if stored data matches current logged-in Google user
        if (stored && (!stored.email || stored.email.toLowerCase() !== session.user.email?.toLowerCase())) {
            stored = null; // Invalidate match
            localStorage.removeItem('krappieren_user');
        }

        if (stored) {
            setUser(stored);
        } else {
            // New user or fresh login on this device
            setUser(prev => ({
                ...prev,
                username: session.user.name?.replace(/\s+/g, '').toLowerCase() || "newuser",
                email: session.user.email, // Store email for validation
                avatar: session.user.image || prev.avatar,
                isOnboarded: false // Force onboarding
            }));
        }
        setIsInitialized(true);
    }, [session]);

    const updateUser = (updates) => {
        setUser(prev => {
            const newState = { ...prev, ...updates };
            localStorage.setItem('krappieren_user', JSON.stringify(newState));
            return newState;
        });
    };

    const completeOnboarding = (data) => {
        setUser(prev => {
            const newUser = {
                ...prev,
                username: data.username,
                languages: data.languages,
                isOnboarded: true
            };
            localStorage.setItem('krappieren_user', JSON.stringify(newUser));
            return newUser;
        });
        // Here you would typically save to DB
    };

    return (
        <UserContext.Provider value={{ user, updateUser, completeOnboarding, isInitialized }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
