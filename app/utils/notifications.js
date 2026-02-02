"use client";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Check if we're running on a native platform
const isNative = Capacitor.isNativePlatform();

// Initialize and request permissions
export async function initializeNotifications() {
    if (!isNative) return false;

    try {
        const permission = await LocalNotifications.requestPermissions();
        return permission.display === 'granted';
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

// Show a notification
export async function showNotification(title, body, data = {}) {
    if (!isNative) return;

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: body,
                    id: Date.now(),
                    schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
                    sound: 'beep.wav',
                    attachments: [],
                    actionTypeId: "",
                    extra: data
                }
            ]
        });
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Handle notification click
export function setupNotificationListeners(onNotificationClick) {
    if (!isNative) return;

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        if (onNotificationClick) {
            onNotificationClick(notification.notification.extra);
        }
    });
}

export default {
    initializeNotifications,
    showNotification,
    setupNotificationListeners,
    isNative
};
