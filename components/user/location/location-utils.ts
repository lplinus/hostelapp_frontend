export interface DetailedAddress {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    city_district?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
}

export const formatDetailedAddress = (addr: DetailedAddress): string => {
    const addressParts = [
        addr.house_number,
        addr.road,
        addr.neighbourhood,
        addr.suburb,
        addr.village,
        addr.city_district,
        addr.city,
        addr.state,
        addr.postcode,
        addr.country
    ];

    return addressParts.filter(Boolean).join(", ");
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'StayNest-Hostel-Management-App'
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch address");
        }

        const data = await response.json();
        const addr = data.address as DetailedAddress;

        const formatted = formatDetailedAddress(addr);
        return formatted || data.display_name;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw error;
    }
};
