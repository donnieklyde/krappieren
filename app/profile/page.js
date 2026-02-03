"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function ProfileRedirect() {
    const { user, isInitialized } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized) {
            if (user && user.username) {
                router.replace(`/profile/${user.username}`);
            } else {
                router.replace('/'); // Redirect to home if not logged in
            }
        }
    }, [user, isInitialized, router]);

    return (
        <div style={{ color: '#fff', padding: 20, textAlign: 'center' }}>
            Loading profile...
        </div>
    );
}
