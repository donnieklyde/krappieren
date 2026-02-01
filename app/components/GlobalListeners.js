"use client";
import { useEffect } from "react";

export default function GlobalListeners() {
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        if (typeof window !== 'undefined') {
            import('@capacitor/core').then(async (Capacitor) => {
                if (Capacitor.Capacitor.isNativePlatform()) {
                    try {
                        const { StatusBar } = await import('@capacitor/status-bar');
                        const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
                        const { App } = await import('@capacitor/app');
                        const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');

                        // Listen for deep links (e.g. from auth redirect)
                        App.addListener('appUrlOpen', data => {
                            // com.krappieren.app://home
                            if (data.url.includes('com.krappieren.app')) {
                                // Navigate to home or refresh
                                window.location.href = '/';
                            }
                        });

                        // Hide Status Bar (Fullscreen)
                        await StatusBar.hide();

                        // Hide Navigation Bar (Immersive)
                        await NavigationBar.hide();
                        // await NavigationBar.setBackgroundColor({ color: '#000000' }); // Fallback if hide fails? Hide is better.

                        // Force Native Resize Mode (Crucial for correct keyboard behavior)
                        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
                    } catch (err) {
                        console.error("Capacitor UI Error:", err);
                    }
                }
            });
        }

        window.addEventListener("contextmenu", handleContextMenu);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return null;
}
