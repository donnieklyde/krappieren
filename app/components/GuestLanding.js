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
    const [showModal, setShowModal] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please fill in both fields");
            return;
        }

        setLoading(true);

        // Check if username exists first
        try {
            const checkRes = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
            const checkData = await checkRes.json();

            if (!checkData.taken) {
                // Username doesn't exist - show confirmation modal
                setShowModal(true);
                setLoading(false);
                return;
            }
        } catch (err) {
            // If check fails, proceed with login attempt
        }

        // Username exists or check failed - proceed with login
        await attemptLogin();
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
        setShowModal(false);
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

            {/* Confirmation Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        border: '2px solid white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20
                    }}>
                        <h2 style={{
                            color: 'white',
                            fontFamily: 'monospace',
                            fontSize: 18,
                            marginBottom: 0
                        }}>
                            REGISTER NEW ACCOUNT
                        </h2>

                        <div style={{ fontFamily: 'monospace', color: '#888', fontSize: 14 }}>
                            @{username}
                        </div>

                        {/* Invite Code Input */}
                        <div style={{ width: '100%', marginTop: 10 }}>
                            <input
                                type="text"
                                placeholder="INVITATION CODE"
                                style={{
                                    width: '100%',
                                    background: 'black',
                                    border: '1px solid #333',
                                    color: 'white',
                                    padding: '12px',
                                    textAlign: 'center',
                                    fontFamily: 'monospace',
                                    marginBottom: 10,
                                    outline: 'none'
                                }}
                                id="inviteCode"
                                autoComplete="off"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, width: '100%' }}>
                            {/* Option 1: Enter with Code */}
                            <button
                                onClick={() => {
                                    const code = document.getElementById('inviteCode').value;
                                    if (code === 'saints_and_angles') {
                                        handleCreateAccount();
                                    } else {
                                        const btn = document.getElementById('payBtn');
                                        if (btn) btn.style.display = 'flex';
                                        alert("WRONG CODE. PAY 10€ TO ENTER.");
                                    }
                                }}
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    padding: '12px',
                                    fontFamily: 'monospace',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    width: '100%'
                                }}
                            >
                                USE CODE
                            </button>

                            {/* Option 2: Pay (Hidden initially or shown if code fails) */}
                            <button
                                id="payBtn"
                                onClick={() => {
                                    // Mock Payment Flow
                                    if (confirm("Confirm payment of 10€?")) {
                                        handleCreateAccount();
                                    }
                                }}
                                style={{
                                    background: '#FFD700', // Gold for payment
                                    color: 'black',
                                    border: 'none',
                                    padding: '12px',
                                    fontFamily: 'monospace',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    width: '100%',
                                    display: 'none', // Hidden until code fails or user wants to pay
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 10
                                }}
                            >
                                PAY 10€
                            </button>

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setLoading(false);
                                }}
                                style={{
                                    background: 'transparent',
                                    color: '#666',
                                    border: 'none',
                                    padding: '10px',
                                    fontFamily: 'monospace',
                                    cursor: 'pointer',
                                    fontSize: 12
                                }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
