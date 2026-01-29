"use client";
import { useEffect } from 'react';

export default function MobileAuthCallback() {
    useEffect(() => {
        // Force redirect to the app scheme
        window.location.href = 'com.krappieren.app://home';
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: 'black',
            color: 'white'
        }}>
            <p>Redirecting back to krappieren...</p>
            <button
                onClick={() => window.location.href = 'com.krappieren.app://home'}
                style={{
                    marginTop: 20,
                    padding: '10px 20px',
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: 20,
                    fontWeight: 'bold'
                }}
            >
                Click here if not redirected
            </button>
        </div>
    );
}
