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

    // State for modal registration flow
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please fill in both fields");
            return;
        }

        setLoading(true);

        try {
            // Check if username exists first
            const checkRes = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
            const checkData = await checkRes.json();

            if (!checkData.taken) {
                // Username doesn't exist - Show Registration Modal
                setIsRegistering(true);
                setLoading(false);
                return;
            }

            // Username exists - Login
            await attemptLogin();
        } catch (err) {
            // If check fails, try logging in anyway
            await attemptLogin();
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
                // Force hard redirect to ensure session is picked up
                window.location.href = '/';
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        // Keep loading true
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
        setError("");
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

            {/* Registration Modal */}
            {isRegistering && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1a1a1a', border: '2px solid white',
                        padding: '30px', width: '90%', maxWidth: '400px',
                        display: 'flex', flexDirection: 'column', gap: 20,
                        textAlign: 'center'
                    }}>
                        <h2 style={{ color: 'white', fontFamily: 'monospace', margin: 0, fontSize: 18 }}>
                            NEW USERNAME
                        </h2>

                        <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 14 }}>
                            WANT NEW PROFILE?
                        </div>

                        <input
                            type="text"
                            placeholder="INVITATION CODE"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            style={{
                                background: 'black', border: '1px solid #333',
                                color: 'white', padding: '12px', textAlign: 'center',
                                fontFamily: 'monospace', outline: 'none'
                            }}
                            autoComplete="off"
                        />

                        <button
                            onClick={() => {
                                if (inviteCode === 'ANGLE') {
                                    handleCreateAccount();
                                } else {
                                    alert("WRONG CODE. PAY THE TOLL.");
                                    setShowPayment(true);
                                }
                            }}
                            style={{
                                background: 'white', color: 'black', border: 'none',
                                padding: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            USE CODE
                        </button>

                        {showPayment && (
                            <button
                                onClick={() => {
                                    if (confirm("Offering 10€... Confirm?")) handleCreateAccount();
                                }}
                                style={{
                                    background: '#FFD700', color: 'black', border: 'none',
                                    padding: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                                }}
                            >
                                PAY 10€ 🪙
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setIsRegistering(false);
                                setShowPayment(false);
                                setInviteCode("");
                                setLoading(false);
                            }}
                            style={{
                                background: 'transparent', color: '#666', border: 'none',
                                padding: '10px', fontFamily: 'monospace', cursor: 'pointer', fontSize: 12
                            }}
                        >
                            RETREAT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
