import { tokenManager } from "@/lib/token";
import { env } from "@/config/env";

const API_BASE_URL = typeof window !== 'undefined' ? '' : env.NEXT_PUBLIC_API_BASE_URL;

export interface StateItem {
    id: number;
    name: string;
    slug: string;
    country: number;
}

export interface CityItem {
    id: number;
    name: string;
    slug: string;
}

export interface AreaItem {
    id: number;
    name: string;
    slug: string;
    city: number;
}

// export async function getStates(): Promise<StateItem[]> {
//     const res = await fetch(`${API_BASE_URL}/api/locations/states/`);
//     if (!res.ok) throw new Error("Failed to fetch states");
//     return res.json();
// }
export async function getStates(): Promise<StateItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/locations/states/`);
    if (!res.ok) throw new Error("Failed to fetch states");

    const data = await res.json();

    return Array.isArray(data) ? data : data?.results || [];
}

// export async function getCities(): Promise<CityItem[]> {
//     const res = await fetch(`${API_BASE_URL}/api/locations/cities/`);
//     if (!res.ok) throw new Error("Failed to fetch cities");
//     return res.json();
// }
export async function getCities(): Promise<CityItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/locations/cities/`);
    if (!res.ok) throw new Error("Failed to fetch cities");

    const data = await res.json();

    return Array.isArray(data) ? data : data?.results || [];
}



// export async function getAreas(): Promise<AreaItem[]> {
//     const res = await fetch(`${API_BASE_URL}/api/locations/areas/`);
//     if (!res.ok) throw new Error("Failed to fetch areas");
//     return res.json();
// }

export async function getAreas(): Promise<AreaItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/locations/areas/`);
    if (!res.ok) throw new Error("Failed to fetch areas");

    const data = await res.json();

    return Array.isArray(data) ? data : data?.results || [];
}



export async function createCity(data: { name: string; state: number }): Promise<CityItem> {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/locations/cities/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw { message: "Failed to create city", errors: errorData };
    }
    return res.json();
}

export async function createArea(data: { name: string; city: number }): Promise<AreaItem> {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/locations/areas/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw { message: "Failed to create area", errors: errorData };
    }
    return res.json();
}
