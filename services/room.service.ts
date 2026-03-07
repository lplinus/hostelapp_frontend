import { authApiClient } from "@/lib/api/auth-client";

export interface RoomType {
    id?: number;
    hostel: number | string;
    room_category: string;
    category_display?: string;
    sharing_type: string | number;
    sharing_display?: string;
    price?: string | number;
    base_price?: string | number;
    total_beds?: number;
    available_beds?: number;
}

export const getMyRooms = async (): Promise<RoomType[]> => {
    return authApiClient.get<RoomType[]>("/api/rooms/room-types/my-rooms/");
};

export const createRoom = async (data: RoomType): Promise<RoomType> => {
    return authApiClient.post<RoomType>("/api/rooms/room-types/", data);
};

export const updateRoom = async (id: number | string, data: Partial<RoomType>): Promise<RoomType> => {
    return authApiClient.patch<RoomType>(`/api/rooms/room-types/${id}/`, data);
};

export const deleteRoom = async (id: number | string): Promise<void> => {
    return authApiClient.delete<void>(`/api/rooms/room-types/${id}/`);
};
