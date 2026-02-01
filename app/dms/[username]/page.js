"use client";
import { useState, useRef, useEffect, use } from "react";
import { useDMs } from "../../context/DMsContext";
import { usePosts } from "../../context/PostsContext";
import styles from "../../components/CommentDock.module.css";
import { sanitizeText } from "../../utils/sanitizer";
// Reusing CommentDock styles for consistency, or I can define inline for speed if styling differs significantly.
// Let's reuse basic structure but customize input.

export default function ChatPage({ params }) {
    const { username } = use(params);
    const decodedUsername = decodeURIComponent(username);
    const { getConversation, sendMessage } = useDMs();
    const { followedUsers } = usePosts();
    const isFollowed = followedUsers.includes(decodedUsername);

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
    const chatAreaRef = useRef(null); // Added ref for chat area
    const [viewportHeight, setViewportHeight] = useState('100%');
    const [isMobile, setIsMobile] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

    // Handle viewport/keyboard changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                const currentH = window.sessionStorage && window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const screenH = window.screen.height;

                // Mobile check
                const mobile = window.innerWidth < 768;
                setIsMobile(mobile);

                // Keyboard check
                const keyboardOpen = window.visualViewport ? (window.visualViewport.height < screenH * 0.75) : (window.innerHeight < screenH * 0.75);
                setIsKeyboardOpen(keyboardOpen);

                // Update precise viewport height with safety buffer
                // Subtracting 50px to create a top margin/gap
                if (window.visualViewport) {
                    setViewportHeight(`${window.visualViewport.height - 50}px`);
                } else {
                    setViewportHeight(`${window.innerHeight - 50}px`);
                }

                // Scroll to bottom
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
            };

            handleResize();

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
        // User requested: Enter always does newline, never submits.
        // So we strictly allow default behavior (which is newline in textarea)
        // and do NOT call handleSend.
    };

    return (
        // Outer Wrapper - Fullscreen container
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'black',
            paddingLeft: isMobile ? '0' : '56px', // Account for desktop navbar
            paddingBottom: isMobile ? '70px' : '0' // Account for mobile navbar
        }}>
            {/* Actual Chat Card */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                flex: 1,
                overflow: 'hidden',
                background: 'black'
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

                    <div style={{
                        fontWeight: 'bold',
                        color: decodedUsername.toLowerCase() === 'yahweh' ? '#FFD700' : (isFollowed ? '#FF00FF' : 'white')
                    }}>
                        @{decodedUsername}
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={chatAreaRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
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
                                {msg.text.toLowerCase()}
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
                            className={styles.input}
                            placeholder={`Message @${decodedUsername}...`}
                            value={input}
                            onChange={(e) => setInput(sanitizeText(e.target.value))}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                // Scroll chat area to bottom when textbox is focused
                                setTimeout(() => {
                                    if (chatAreaRef.current) {
                                        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
                                    }
                                }, 300); // Longer delay for mobile keyboard
                            }}
                            rows={1}
                            style={{
                                resize: 'none',
                                height: 'auto',
                                minHeight: '44px',
                                paddingTop: '10px',
                                overflow: 'hidden',
                                textTransform: 'lowercase',
                                color: 'white',
                                background: 'transparent'
                            }}
                        />
                        <button type="submit" className={styles.button}>SEND</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
