"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

const INITIAL_USER = {
    username: "currentUser",
    bio: "",
    avatar: "https://github.com/shadcn.png" // Placeholder
};

export function UserProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState({
        ...INITIAL_USER,
        isOnboarded: true // Optimistic: Assume onboarded to prevent blocking valid users if API fails
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

        // Invalidate if stored data says "newuser" but claims to be onboarded (fix for stuck state)
        if (stored && stored.username && stored.username.toLowerCase() === 'newuser') {
            stored.isOnboarded = false;
        }

        if (stored) {
            setUser(stored);
        } else {
            // New user or fresh login on this device
            // Prioritize Session data from DB
            setUser(prev => ({
                ...prev,
                username: session.user.username || session.user.name?.replace(/\s+/g, '').toLowerCase() || "newuser",
                email: session.user.email,
                avatar: session.user.image || prev.avatar,
                // Only optimistic if we actually have a valid username
                isOnboarded: (session.user.username && session.user.username.toLowerCase() !== 'newuser'),
                languages: session.user.languages || prev.languages
            }));
        }

        // Sync with DB (username, etc.)
        fetch('/api/user/stats')
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    setUser(prev => {
                        const updated = {
                            ...prev,
                            username: data.username,
                            avatar: data.avatar || prev.avatar,
                            // Hydrate other fields from API
                            name: data.name || prev.name,
                            languages: data.languages || prev.languages,
                            // Correctly handle onboarding state:
                            // If API says false, it's false.
                            // If username is "newuser" (default), it's false.
                            // Otherwise default to true (optimistic).
                            isOnboarded: (data.isOnboarded === false || data.username?.toLowerCase() === 'newuser') ? false : true,
                            bio: data.bio || prev.bio
                        };
                        localStorage.setItem('krappieren_user', JSON.stringify(updated));
                        return updated;
                    });
                }
            })
            .catch(err => console.error("Sync user failed", err))
            .finally(() => setIsInitialized(true));
    }, [session]);

    const updateUser = async (updates) => {
        setUser(prev => {
            const newState = { ...prev, ...updates };
            localStorage.setItem('krappieren_user', JSON.stringify(newState));
            return newState;
        });

        // Persist to DB
        try {
            await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error("Failed to persist user updates", err);
        }
    };

    const completeOnboarding = async (data) => {
        // Optimistic update
        const previousUser = user; // backup
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

        // Persist to DB
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Failed to save user data", errorData);
                // Revert optimistic update? Or just warn?
                // For onboarding, we should probably revert and show error.
                setUser(previousUser);
                localStorage.setItem('krappieren_user', JSON.stringify(previousUser));
                return { success: false, error: errorData.error || 'Failed to update' };
            }
            return { success: true };
        } catch (err) {
            console.error("Failed to save user data", err);
            setUser(previousUser);
            return { success: false, error: 'Network error' };
        }
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
