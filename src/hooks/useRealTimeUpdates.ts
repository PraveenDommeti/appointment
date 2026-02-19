import { useEffect, useState } from "react";

/**
 * Real-Time Update Hook
 * Provides automatic data refresh when database changes occur
 * Supports both localStorage events (cross-tab) and polling (same-tab)
 */

export function useRealTimeUpdates(refreshCallback: () => void, pollingInterval: number = 3000) {
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        // Listen for localStorage changes (cross-tab sync)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key && e.key.startsWith('classbook_')) {
                refreshCallback();
            }
        };

        // Listen for custom db-update events (same-tab)
        const handleDbUpdate = () => {
            refreshCallback();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('db-update', handleDbUpdate);

        // Polling for same-tab updates (fallback)
        let intervalId: NodeJS.Timeout | null = null;
        if (isPolling && pollingInterval > 0) {
            intervalId = setInterval(() => {
                refreshCallback();
            }, pollingInterval);
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('db-update', handleDbUpdate);
            if (intervalId) clearInterval(intervalId);
        };
    }, [refreshCallback, isPolling, pollingInterval]);

    return {
        isPolling,
        startPolling: () => setIsPolling(true),
        stopPolling: () => setIsPolling(false)
    };
}

/**
 * Notification Hook
 * Manages real-time notifications for the current user
 */
export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotifications = () => {
        if (!userId) return;

        // Import db dynamically to avoid circular dependencies
        import('@/lib/db').then(({ db }) => {
            const userNotifications = db.getNotifications(userId);
            setNotifications(userNotifications);
            setUnreadCount(userNotifications.filter(n => !n.read).length);
        });
    };

    useEffect(() => {
        refreshNotifications();
    }, [userId]);

    useRealTimeUpdates(refreshNotifications, 5000);

    const markAsRead = (notificationId: string) => {
        import('@/lib/db').then(({ db }) => {
            db.markNotificationAsRead(notificationId);
            refreshNotifications();
        });
    };

    const markAllAsRead = () => {
        if (!userId) return;
        import('@/lib/db').then(({ db }) => {
            db.markAllNotificationsAsRead(userId);
            refreshNotifications();
        });
    };

    const deleteNotification = (notificationId: string) => {
        import('@/lib/db').then(({ db }) => {
            db.deleteNotification(notificationId);
            refreshNotifications();
        });
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: refreshNotifications
    };
}
