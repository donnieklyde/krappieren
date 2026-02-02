"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GlobalListeners() {
    const { data: session } = useSession();
    const router = useRouter();
    const shownNotifications = useRef(new Set()); // Track shown notifications

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Initialize notifications and polling
        const initNotifications = async () => {
            if (typeof window !== 'undefined') {
                const { initializeNotifications, showNotification, setupNotificationListeners } = await import('@/app/utils/notifications');

                // Request permissions
                await initializeNotifications();

                // Setup click handler
                setupNotificationListeners((data) => {
                    // Navigate to activity page when notification is clicked
                    router.push('/activity');
                });

                // Poll for new notifications if user is logged in
                if (session) {
                    const pollInterval = setInterval(async () => {
                        try {
                            const res = await fetch('/api/notifications');
                            if (res.ok) {
                                const data = await res.json();

                                // Show notifications for new activities
                                if (data.newActivities && data.newActivities.length > 0) {
                                    for (const activity of data.newActivities) {
                                        const activityKey = `${activity.type}-${activity.username}-${activity.createdAt}`;

                                        // Only show if we haven't shown this notification before
                                        if (!shownNotifications.current.has(activityKey)) {
                                            shownNotifications.current.add(activityKey);

                                            if (activity.type === 'comment') {
                                                await showNotification(
                                                    `${activity.username} commented`,
                                                    `"${activity.text.substring(0, 50)}${activity.text.length > 50 ? '...' : ''}"`,
                                                    { type: 'comment', username: activity.username }
                                                );
                                            } else if (activity.type === 'follow') {
                                                await showNotification(
                                                    'New follower',
                                                    `${activity.username} started following you`,
                                                    { type: 'follow', username: activity.username }
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('Notification poll error:', error);
                        }
                    }, 30000); // Poll every 30 seconds

                    return () => clearInterval(pollInterval);
                }
            }
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

                        // Initialize notifications
                        initNotifications();
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
    }, [session, router]);

    return null;
}
