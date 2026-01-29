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
    const messages = conversation.messages || [];

    const [input, setInput] = useState("");
    const textareaRef = useRef(null);
    const bottomRef = useRef(null);

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

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(decodedUsername, input);
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
            height: 'calc(100vh - 80px)',
            maxHeight: 'calc(100vh - 80px)',
            overflow: 'hidden',
            marginTop: 20,
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 15 }}>
                {messages.length > 0 ? messages.map(msg => {
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

            {/* Input Dock - Floating like CommentDock */}
            <div className={styles.dock} style={{ position: 'sticky', bottom: 0 }}>
                <form onSubmit={handleSend} className={styles.form}>
                    <textarea
                        ref={textareaRef}
                        className={styles.input} // Reusing class for consistency (lowercase etc)
                        placeholder={`Message @${decodedUsername}...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ resize: 'none', height: 'auto', minHeight: '44px', paddingTop: '10px', overflow: 'hidden', textTransform: 'none' }}
                    />
                    <button type="submit" className={styles.button}>SEND</button>
                </form>
            </div>
        </div>
    );
}
