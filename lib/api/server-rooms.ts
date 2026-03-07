import { cookies } from "next/headers";
import { GroupedHostelRooms } from "@/services/room.service";

export async function getGroupedRoomsServer(): Promise<GroupedHostelRooms[]> {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Attempt at finding an access token elsewhere if it was in cookies
    // For this project, access tokens are in-memory (client-side), so we may
    // need to rely on the HttpOnly refresh token cookie on the server to authenticate.

    // We fetch the refresh endpoint on the server, get an access token, then call the grouped endpoint.
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

    try {
        // Step 1: Refresh to get an access token
        const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/refresh/`, {
            method: "POST",
            headers: {
                Cookie: cookieString,
            },
        });

        if (!refreshResponse.ok) {
            return [];
        }

        const { access } = await refreshResponse.json();

        // Step 2: Use access token to fetch grouped rooms
        const response = await fetch(`${apiBaseUrl}/api/rooms/room-types/grouped-my-rooms/`, {
            headers: {
                Authorization: `Bearer ${access}`,
            },
            next: { revalidate: 0 }, // Disable caching for initial dashboard load
        });

        if (!response.ok) {
            return [];
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching grouped rooms on server:", error);
        return [];
    }
}
