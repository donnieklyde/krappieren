"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";


export default function SearchPage() {
    const router = useRouter();

    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [trigger, setTrigger] = useState(0);

    // Debounce Search
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const url = searchQuery.trim()
                    ? `/api/users?query=${encodeURIComponent(searchQuery)}`
                    : '/api/users'; // Empty query returns all/some users

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();

                    // Handle both array (legacy) and object response
                    const userList = Array.isArray(data) ? data : data.users;
                    setAllUsers(userList);
                } else {
                    setError("API Error");
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
                setError("Network Error");
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchUsers();
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, trigger]);

    const handleUserClick = (username) => {
        router.push(`/profile/${username}`);
    };


    return (
        <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto', color: 'white' }}>
            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link href="/" style={{ fontSize: 24, textDecoration: 'none', color: 'white' }}>←</Link>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', margin: 0 }}>SEARCH</h1>
            </div>

            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Search for users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 16,
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <p style={{ marginBottom: 20, opacity: 0.7 }}>
                Tap to View Profile.
                <span style={{ marginLeft: 10, fontSize: 12, border: '1px solid #333', padding: '2px 6px', borderRadius: 4, opacity: 0.8 }}>
                    {loading ? "Searching..." : error ? "Connection Error" : `${allUsers.length} Users found`}
                </span>
                <button
                    onClick={() => setTrigger(t => t + 1)}
                    style={{ marginLeft: 10, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, padding: 0 }}
                    title="Refresh List"
                >
                    ↻
                </button>
            </p>

            {error && <p style={{ color: '#ff4444', textAlign: 'center', marginBottom: 20 }}>Unable to load users. Please check your connection.</p>}
            {loading && <p style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>Scanning...</p>}

            <ul style={{ listStyle: 'none' }}>
                {allUsers.map(userObj => {
                    const user = userObj.username;
                    const slaveCount = userObj.slaveCount || 0;
                    const bio = userObj.bio ? userObj.bio.substring(0, 25) : (slaveCount === 0 ? "krappiert" : `${slaveCount} slaves`);
                    return (
                        <li key={user} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 0',
                            borderBottom: '1px solid #333',
                            cursor: 'pointer'
                        }}
                            onClick={() => handleUserClick(user)}
                        >
                            <span
                                style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    textTransform: 'uppercase'
                                }}
                            >
                                @{user}
                                <span style={{ marginLeft: 10, fontSize: 12, color: '#888', fontWeight: 'normal' }}>
                                    {bio}
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ul>

            <div style={{ marginTop: 40, textAlign: 'center', opacity: 0.2, fontSize: 10, fontFamily: 'monospace' }}>
                TREEDZ NETWORK
            </div>
        </div>
    );
}
