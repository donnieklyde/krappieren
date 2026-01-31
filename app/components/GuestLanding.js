"use client";
import { signIn } from "next-auth/react";
import styles from "./GuestLanding.module.css";
import { useRouter } from "next/navigation";

export default function GuestLanding() {
    const router = useRouter();

    const handleLogin = async () => {
        if (typeof window !== 'undefined') {
            try {
                const { Capacitor } = await import('@capacitor/core');
                if (Capacitor.isNativePlatform()) {
                    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                    await GoogleAuth.initialize();

                    // Force sign-out locally to ensure account picker
                    await GoogleAuth.signOut();

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
                } else {
                    signIn("google", { callbackUrl: "/" });
                }
            } catch (error) {
                console.error("Login failed:", error);
                // Fallback if native fails for some reason?
                signIn("google", { callbackUrl: "/" });
            }
        } else {
            signIn("google", { callbackUrl: "/" });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>every action is a mistake</h1>
                <button
                    className={styles.button}
                    onClick={handleLogin}
                >
                    see the good
                </button>
            </div>
        </div>
    );
}
