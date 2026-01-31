"use client";
import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./GuestLanding.module.css";

export default function GuestLanding() {
    const [latestPost, setLatestPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLatestPost = async () => {
            try {
                // Fetch posts, ideally we'd just fetch one, but existing API returns all
                // Improving API later is better, for now use existing
                const res = await fetch('/api/posts');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setLatestPost(data[0]); // First one is most recent usually
                    }
                }
            } catch (error) {
                console.error("Failed to fetch latest post", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestPost();
    }, []);

    const handleAuth = async () => {
        if (typeof window !== 'undefined') {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
                try {
                    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                    await GoogleAuth.initialize();
                    await GoogleAuth.signOut(); // Force account picker
                    const user = await GoogleAuth.signIn();

                    const result = await signIn('google-mobile', {
                        idToken: user.authentication.idToken,
                        email: user.email.toLowerCase(),
                        name: user.name,
                        image: user.imageUrl,
                        redirect: false,
                    });

                    if (result?.ok) {
                        router.push('/');
                        router.refresh();
                    }
                } catch (error) {
                    console.error("Native Google Login failed:", error);
                }
            } else {
                signIn('google', { callbackUrl: '/' });
            }
        } else {
            signIn('google', { callbackUrl: '/' });
        }
    };

    if (loading) return <div className={styles.loading}>LOADING...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.postWrapper}>
                {latestPost ? (
                    <PostCard
                        {...latestPost}
                        isGuest={true}
                    />
                ) : (
                    <div className={styles.empty}>No posts yet.</div>
                )}
            </div>

            <div className={styles.buttonContainer}>
                <button onClick={handleAuth} className={styles.comeButton}>
                    COME IN
                </button>
                <div style={{ width: 20 }}></div>
                <button onClick={handleAuth} className={styles.checkupButton}>
                    CHECKUP
                </button>
            </div>
        </div>
    );
}
