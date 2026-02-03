"use client";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
    const { user, updateUser } = useUser();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [link, setLink] = useState("");
    const [avatar, setAvatar] = useState("");

    useEffect(() => {
        if (user) {
            const t = setTimeout(() => {
                setUsername(user.username || "");
                setBio(user.bio || "");
                setLink(user.link || "");
                setAvatar(user.avatar || "");
            }, 0);
            return () => clearTimeout(t);
        }
    }, [user]);

    const handleSave = () => {
        updateUser({ bio, link, avatar }); // Username usually immutable or requires server check
        router.push(`/profile/${user.username}`);
    };

    const handleLogout = () => {
        // Implement logout logic if needed, or just clear storage
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('krappieren_user');
            window.location.href = "/";
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: '0 auto', color: 'white' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link href={`/profile/${user?.username}`} style={{ fontSize: 24 }}>←</Link>
                <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Edit Profile</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Username (Read Only)</label>
                    <input
                        type="text"
                        value={username}
                        disabled
                        style={{
                            width: '100%',
                            padding: 10,
                            background: '#333',
                            border: '1px solid #444',
                            borderRadius: 8,
                            color: '#aaa'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a bio..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: 10,
                            background: '#222',
                            border: '1px solid #444',
                            borderRadius: 8,
                            color: 'white',
                            resize: 'none'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Link</label>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="+ Add link"
                        style={{
                            width: '100%',
                            padding: 10,
                            background: '#222',
                            border: '1px solid #444',
                            borderRadius: 8,
                            color: 'white'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Avatar URL</label>
                    <input
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://..."
                        style={{
                            width: '100%',
                            padding: 10,
                            background: '#222',
                            border: '1px solid #444',
                            borderRadius: 8,
                            color: 'white'
                        }}
                    />
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        padding: 15,
                        background: 'white',
                        color: 'black',
                        fontWeight: 'bold',
                        borderRadius: 12,
                        marginTop: 10,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Done
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: 15,
                        background: 'transparent',
                        color: 'red',
                        fontWeight: 'bold',
                        borderRadius: 12,
                        marginTop: 20,
                        border: '1px solid red',
                        cursor: 'pointer'
                    }}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}
