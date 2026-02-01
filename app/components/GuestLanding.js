"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./GuestLanding.module.css";
import { useRouter } from "next/navigation";

export default function GuestLanding() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // State for inline registration flow
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please fill in both fields");
            return;
        }

        if (isRegistering) {
            // Handle Registration Attempt
            if (!inviteCode && !showPayment) {
                setError("ENTER INVITE CODE OR PAY");
                return;
            }

            if (inviteCode === 'saints_and_angles') {
                await handleCreateAccount();
            } else {
                setError("WRONG CODE.");
                setShowPayment(true);
            }
        } else {
            // Handle Login / Check Attempt
            setLoading(true);
            try {
                // Check if username exists first
                const checkRes = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
                const checkData = await checkRes.json();

                if (!checkData.taken) {
                    // Username doesn't exist - Switch to Inline Registration Mode
                    setIsRegistering(true);
                    setLoading(false);
                    setError("UNKNOWN USER. ENTER CODE TO JOIN.");
                    return;
                }

                // Username exists - Login
                await attemptLogin();
            } catch (err) {
                // Fallback
                await attemptLogin();
            }
        }
    };

    const attemptLogin = async () => {
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
            setError("Something went wrong");
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create account');
                setLoading(false);
                return;
            }

            // Account created successfully - now login
            await attemptLogin();
        } catch (err) {
            setError("Failed to create account");
            setLoading(false);
        }
    };

    const handleUsernameChange = (e) => {
        // Strict sanitization: A-Z SPACE only
        const val = e.target.value.toUpperCase().replace(/[^A-Z ]/g, '');
        setUsername(val);
        // Reset registration state if username changes
        setIsRegistering(false);
        setShowPayment(false);
        setError("");
        setInviteCode("");
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>every action is a mistake</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="USERNAME"
                        className={styles.input}
                        value={username}
                        onChange={handleUsernameChange}
                        autoCapitalize="none"
                        autoComplete="off"
                    />
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Inline Invite Code Field - Only shows when registering */}
                    {isRegistering && (
                        <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
                            <input
                                type="text"
                                placeholder="INVITATION CODE"
                                className={styles.input}
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                autoComplete="off"
                                style={{
                                    border: '1px solid #FFD700',
                                    color: '#FFD700'
                                }}
                            />
                        </div>
                    )}

                    {error && <div style={{ color: 'red', textAlign: 'center', fontFamily: 'monospace', fontSize: 12 }}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? "..." : (isRegistering ? "JOIIN" : "COME")}
                    </button>

                    {/* Inline Payment Button - Shows if code fails */}
                    {showPayment && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm("Confirm payment of 10€?")) {
                                    handleCreateAccount();
                                }
                            }}
                            style={{
                                background: '#FFD700',
                                color: 'black',
                                border: 'none',
                                padding: '15px',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginTop: 10,
                                width: '100%'
                            }}
                        >
                            PAY 10€
                        </button>
                    )}

                    {isRegistering && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(false);
                                setShowPayment(false);
                                setInviteCode("");
                                setError("");
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#555',
                                marginTop: 5,
                                fontSize: 10,
                                cursor: 'pointer',
                                fontFamily: 'monospace'
                            }}
                        >
                            CANCEL
                        </button>
                    )}

                </form>
            </div>
        </div>
    );
}
