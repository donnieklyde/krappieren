"use client";
import Link from 'next/link';
import { usePosts } from '../context/PostsContext';

export default function BossesPage() {
    const { followedUsers } = usePosts();

    return (
        <div style={{
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto',
            color: 'white',
            fontFamily: 'Bahnschrift, sans-serif'
        }}>
            <h1 style={{
                fontSize: '24px',
                marginBottom: '30px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                MY BOSSES ({followedUsers?.length || 0})
            </h1>

            {!followedUsers || followedUsers.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    color: '#666',
                    marginTop: '50px',
                    fontStyle: 'italic'
                }}>
                    You serve no one.
                    <br />
                    <Link href="/search" style={{ color: 'white', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                        Find a Boss
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {followedUsers.map(boss => (
                        <Link
                            key={boss}
                            href={`/profile/${boss}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px',
                                background: '#111',
                                textDecoration: 'none',
                                color: 'white',
                                borderRadius: '4px',
                                transition: 'background 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>@{boss}</span>
                            <span style={{ color: '#888', fontSize: '20px' }}>→</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
