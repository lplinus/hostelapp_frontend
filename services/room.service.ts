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
    price_per_day?: string | number;
    total_beds?: number;
    available_beds?: number;
    show_this_price?: boolean;
}

export interface GroupedRoom {
    id: number;
    sharing: string;
    price: string | number;
    price_per_day: string | number;
    total_beds: number;
    available_beds: number;
    is_available: boolean;
    show_this_price: boolean;
}

export interface GroupedRoomCategory {
    category_name: string;
    rooms: GroupedRoom[];
}

export interface GroupedHostelRooms {
    hostel_id: number;
    hostel_name: string;
    categories: GroupedRoomCategory[];
}

export const getMyRooms = async (): Promise<RoomType[]> => {
    return authApiClient.get<RoomType[]>("/api/rooms/room-types/my-rooms/");
};

export const getGroupedMyRooms = async (): Promise<GroupedHostelRooms[]> => {
    return authApiClient.get<GroupedHostelRooms[]>("/api/rooms/room-types/grouped-my-rooms/");
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
