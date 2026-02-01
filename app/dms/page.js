"use client";
import { useDMs } from "../context/DMsContext";
import Link from "next/link";

export default function DMs() {
    const { conversations } = useDMs();

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 60 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', margin: '20px 0', padding: '0 20px', color: 'white' }}>DIRECT MESSAGES</h1>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {conversations.length > 0 ? (
                    conversations.map(conv => (
                        <Link
                            href={`/dms/${conv.user}`}
                            key={conv.id}
                            style={{
                                textDecoration: 'none',
                                padding: '15px 20px',
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15,
                                transition: 'background 0.2s',
                                cursor: 'pointer'
                            }}
                        >

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 'bold', color: 'white' }}>@{conv.user}</span>
                                    <span style={{ fontSize: 13, color: '#666' }}>{conv.timestamp}</span>
                                </div>
                                <div style={{
                                    fontSize: 14,
                                    color: conv.unread ? 'white' : '#888',
                                    fontWeight: conv.unread ? 'bold' : 'normal',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {conv.lastMessage}
                                </div>
                            </div>
                            {conv.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></div>}
                        </Link>
                    ))
                ) : (
                    <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                        No active conversations.
                    </div>
                )}
            </div>
        </div>
    );
}
