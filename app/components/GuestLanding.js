"use client";
import { signIn } from "next-auth/react";
import styles from "./GuestLanding.module.css";

export default function GuestLanding() {
    const handleLogin = () => {
        signIn("google", { callbackUrl: "/" });
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
