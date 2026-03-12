import { authApiClient } from "@/lib/api/auth-client";

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile_picture?: string;
    role: string;
    is_email_verified: boolean;
    is_phone_verified: boolean;
}

export const getUserProfile = async (): Promise<UserProfile> => {
    return authApiClient.get<UserProfile>("/api/users/me/");
};

export const updateUserProfile = async (data: Partial<UserProfile> | FormData): Promise<UserProfile> => {
    return authApiClient.patch<UserProfile>("/api/users/me/", data);
};
