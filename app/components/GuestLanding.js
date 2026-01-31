"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./GuestLanding.module.css";
import { useRouter } from "next/navigation";

export default function GuestLanding() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please fill in both fields");
            return;
        }

        setLoading(true);

        try {
            const res = await signIn("credentials", {
                username: username,
                password: password,
                redirect: false
            });

            if (res?.error) {
                setError(res.error);
                setLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            console.error("Login crashed", err);
            setError("Something went wrong");
            setLoading(false);
        }
    };

    const handleUsernameChange = (e) => {
        // Strict sanitization: A-Z 0-9 SPACE only
        const val = e.target.value.toUpperCase().replace(/[^A-Z ]/g, '');
        setUsername(val);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>every action is a mistake</h1>

                <form onSubmit={handleLogin} className={styles.form}>
                    <input
                        type="text"
                        placeholder="USERNAME"
                        className={styles.input}
                        value={username}
                        onChange={handleUsernameChange}
                        autoCapitalize="none"
                    />
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <div style={{ color: 'red', textAlign: 'center', fontFamily: 'monospace', fontSize: 12 }}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? "..." : "COME"}
                    </button>
                </form>
            </div>
        </div>
    );
}
