import { authApiClient } from "@/lib/api/auth-client";

export interface VendorNotification {
    id: number;
    title: string;
    message: string;
    notification_type: 'order' | 'payment' | 'product' | 'system';
    related_object_id: string | null;
    is_read: boolean;
    created_at: string;
}

export const getVendorNotifications = async (): Promise<VendorNotification[]> => {
    return authApiClient.get<VendorNotification[]>("/api/notifications/vendor/");
};

export const markVendorAsRead = async (id: number): Promise<{status: string}> => {
    return authApiClient.patch<{status: string}>(`/api/notifications/vendor/${id}/read/`, {});
};

export const markAllVendorAsRead = async (): Promise<{status: string, updated_count: number}> => {
    return authApiClient.post<{status: string, updated_count: number}>("/api/notifications/vendor/mark-all-read/", {});
};

export const getVendorUnreadCount = async (): Promise<{unread_count: number}> => {
    return authApiClient.get<{unread_count: number}>("/api/notifications/vendor/unread-count/");
};

export const clearAllVendorNotifications = async (): Promise<void> => {
    return authApiClient.delete("/api/notifications/vendor/clear-all/");
};
