import { authApiClient } from "@/lib/api/auth-client";

export interface HostelImageData {
    id?: number;
    hostel: number;
    image: string | null;
    image2: string | null;
    image3: string | null;
    image4: string | null;
    image5?: string | null;
    image6?: string | null;
    image7?: string | null;
    image8?: string | null;
    image9?: string | null;
    image10?: string | null;
    alt_text: string;
    is_primary: boolean;
    order: number;
}

export async function uploadHostelImages(data: FormData): Promise<HostelImageData> {
    return authApiClient.post<HostelImageData>("/api/hostels/images/", data);
}

export async function updateHostelImages(id: number, data: FormData): Promise<HostelImageData> {
    return authApiClient.patch<HostelImageData>(`/api/hostels/images/${id}/`, data);
}

export async function deleteHostelImage(id: number): Promise<void> {
    return authApiClient.delete<void>(`/api/hostels/images/${id}/`);
}
