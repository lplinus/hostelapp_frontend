import { authApiClient } from "@/lib/api/auth-client";

export interface AppNotification {
    id: number;
    title: string;
    message: string;
    notification_type: 'booking' | 'order' | 'hostel' | 'room' | 'system';
    related_object_id: string | null;
    is_read: boolean;
    created_at: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
    return authApiClient.get<AppNotification[]>("/api/notifications/");
};

export const markAsRead = async (id: number): Promise<{status: string}> => {
    return authApiClient.patch<{status: string}>(`/api/notifications/${id}/read/`, {});
};

export const markAllAsRead = async (): Promise<{status: string, updated_count: number}> => {
    return authApiClient.post<{status: string, updated_count: number}>("/api/notifications/mark-all-read/", {});
};

export const getUnreadCount = async (): Promise<{unread_count: number}> => {
    return authApiClient.get<{unread_count: number}>("/api/notifications/unread-count/");
};

export const clearAllNotifications = async (): Promise<void> => {
    return authApiClient.delete("/api/notifications/clear-all/");
};
