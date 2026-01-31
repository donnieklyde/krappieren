"use client";
import { useState, useRef, useEffect, use } from "react";
import { useDMs } from "../../context/DMsContext";
import styles from "../../components/CommentDock.module.css";
// Reusing CommentDock styles for consistency, or I can define inline for speed if styling differs significantly.
// Let's reuse basic structure but customize input.

export default function ChatPage({ params }) {
    const { username } = use(params);
    const decodedUsername = decodeURIComponent(username);
    const { getConversation, sendMessage } = useDMs();

    // Safety check just in case, though getConversation handles default
    const conversation = getConversation(decodedUsername);
    const [localMessages, setLocalMessages] = useState([]);

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await fetch(`/api/dms/${decodedUsername}`);
            console.log("ChatPage fetch status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("ChatPage fetched messages:", data);
                setLocalMessages(data);
            }
        };
        fetchHistory();

        // Poll for new messages every 5s while chat is open
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [decodedUsername]);

    const messages = localMessages; // Use local state

    const [input, setInput] = useState("");
    const textareaRef = useRef(null);
    const bottomRef = useRef(null);
    const [viewportHeight, setViewportHeight] = useState('100%');
    const [isMobile, setIsMobile] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-grow input
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // Handle viewport resize (keyboard open/close)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                const currentH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const maxH = window.innerHeight;
                const mobile = window.innerWidth < 768;
                setIsMobile(mobile);

                // Detect keyboard (approximate check: viewport significantly smaller than screen)
                const isKeyboardOpen = currentH < maxH * 0.85;

                if (mobile && !isKeyboardOpen) {
                    setViewportHeight(`${maxH * 0.5}px`); // Half height when keyboard closed on mobile
                } else {
                    setViewportHeight(`${currentH}px`); // Full available space otherwise (keyboard open or desktop)
                }
                // Scroll to bottom when keyboard opens to keep latest messages visible
                // Small delay to allow layout to settle
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
                }, 300);
            };
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', handleResize);
            }
            window.addEventListener('resize', handleResize);

            return () => {
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('resize', handleResize);
                }
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!input.trim()) return;

        // Optimistic
        const tempMsg = {
            id: Date.now(),
            sender: 'currentUser',
            text: input,
            timestamp: new Date().toISOString()
        };
        setLocalMessages(prev => [...prev, tempMsg]);

        sendMessage(decodedUsername, input); // Updates Context/API
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey) {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                setInput(input.substring(0, start) + "\n" + input.substring(end));
            } else {
                e.preventDefault();
                handleSend(e);
            }
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: viewportHeight,
            // maxHeight: 'calc(100vh - 80px)', // removed fixed height restriction to let flex grow
            flex: isMobile ? 'none' : 1, // Don't grow on mobile if we set specific height
            overflow: 'hidden',
            marginTop: isMobile ? 'auto' : 20, // Push to bottom on mobile
            border: '1px solid #333',
            borderRadius: 15
        }}>
            {/* Header */}
            <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'black',
                zIndex: 10
            }}>

                <div style={{ fontWeight: 'bold' }}>@{decodedUsername}</div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
                {messages && messages.length > 0 ? messages.map(msg => {
                    const isMe = msg.sender === 'currentUser';
                    return (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                padding: '10px 15px',
                                borderRadius: 15,
                                borderBottomRightRadius: isMe ? 2 : 15,
                                borderBottomLeftRadius: isMe ? 15 : 2,
                                background: isMe ? '#222' : 'transparent',
                                border: isMe ? 'none' : '1px solid #333',
                                color: 'white',
                                fontSize: 15,
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {msg.text}
                        </div>
                    );
                }) : (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: 50 }}>
                        Start a conversation with @{decodedUsername}
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            {/* Input Dock - Flex naturally at bottom */}
            <div style={{
                padding: '20px',
                background: 'black',
                borderTop: '2px solid white',
                zIndex: 100
            }}>
                <form onSubmit={handleSend} className={styles.form}>
                    <textarea
                        ref={textareaRef}
                        className={styles.input} // Reusing class for consistency (lowercase etc)
                        placeholder={`Message @${decodedUsername}...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{
                            resize: 'none',
                            height: 'auto',
                            minHeight: '44px',
                            paddingTop: '10px',
                            overflow: 'hidden',
                            textTransform: 'none',
                            color: 'white',
                            background: 'transparent'
                        }}
                    />
                    <button type="submit" className={styles.button}>SEND</button>
                </form>
            </div>
        </div>
    );
}
