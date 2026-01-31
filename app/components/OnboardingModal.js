import { useState, useEffect } from "react";
import styles from "./OnboardingModal.module.css";
import { usePosts } from "../context/PostsContext";
import { getTakenUsernames } from "../data/mockData";

export default function OnboardingModal({ onSave }) {
    const [username, setUsername] = useState("");

    const [error, setError] = useState("");

    const handleSave = async () => {
        // Validation
        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        if (username.length < 3) {
            setError("Username must be at least 3 characters.");
            return;
        }

        // Check duplicates (Async vs API)
        try {
            const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.taken) {
                    setError("Username is already taken.");
                    return;
                }
            } else {
                // If API fails (e.g. no DB connection yet), maybe allow or warn?
                // For now, let's assume if it fails, we can't verify, so warn user.
                console.warn("Could not verify username uniqueness");
            }
        } catch (err) {
            console.error("Failed to check username", err);
        }

        // Initialize with no specific languages set (will auto-learn)
        const result = await onSave({ username, languages: null });

        if (result && !result.success) {
            setError(result.error);
        } else {
            // Success - modal will close as parent re-renders or logic dictates
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Welcome to krappieren</h2>
                <p className={styles.subtitle}>Choose your identity and preferences.</p>

                <div className={styles.field}>
                    <label className={styles.label}>Username</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.at}>@</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value.toUpperCase().replace(/[^A-Z ]/g, ''));
                                setError("");
                            }}
                            style={{ textTransform: 'uppercase' }}
                            placeholder="username"
                            maxLength={20}
                        />
                    </div>
                </div>



                {error && <div className={styles.error}>{error}</div>}

                <button className={styles.button} onClick={handleSave}>
                    COME
                </button>
            </div>
        </div>
    );
}
