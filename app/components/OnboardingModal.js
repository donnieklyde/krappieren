import { useState, useEffect } from "react";
import styles from "./OnboardingModal.module.css";
import { usePosts } from "../context/PostsContext";
import { getTakenUsernames } from "../data/mockData";

export default function OnboardingModal({ onSave }) {
    const [username, setUsername] = useState("");
    const [languages, setLanguages] = useState({
        english: false,
        german: false
    });
    const [error, setError] = useState("");

    const handleSave = () => {
        // Validation
        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        if (username.length < 3) {
            setError("Username must be at least 3 characters.");
            return;
        }

        // Check duplicates
        const taken = getTakenUsernames().map(u => u.toLowerCase());
        if (taken.includes(username.toLowerCase())) {
            setError("Username is already taken.");
            return;
        }

        if (!languages.english && !languages.german) {
            setError("Please select at least one language.");
            return;
        }

        onSave({ username, languages });
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
                                setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                                setError("");
                            }}
                            placeholder="username"
                            maxLength={20}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Languages</label>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={languages.english}
                                onChange={(e) => setLanguages(prev => ({ ...prev, english: e.target.checked }))}
                            />
                            <span>English</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={languages.german}
                                onChange={(e) => setLanguages(prev => ({ ...prev, german: e.target.checked }))}
                            />
                            <span>German</span>
                        </label>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button className={styles.button} onClick={handleSave}>
                    COMPLETE REGISTRATION
                </button>
            </div>
        </div>
    );
}
