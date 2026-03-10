export interface DetailedAddress {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city_district?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
}

/**
 * Formats the address into a precise, human-readable English string.
 * Includes all available components for maximum detail.
 * e.g. "1-2-3, Some Road, Ameerpet, Hyderabad, Telangana, 500016, India"
 */
export const formatDetailedAddress = (addr: DetailedAddress): string => {
    const addressParts = [
        addr.house_number,
        addr.road,
        addr.neighbourhood,
        addr.suburb,
        addr.village,
        addr.town,
        addr.city_district,
        addr.city,
        addr.state_district,
        addr.state,
        addr.postcode,
        addr.country
    ];

    // Filter out empty/undefined parts and deduplicate consecutive identical values
    const filtered = addressParts.filter(Boolean) as string[];
    const deduped = filtered.filter((val, idx) => idx === 0 || val !== filtered[idx - 1]);

    return deduped.join(", ");
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18&accept-language=en`,
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

        // display_name is the most complete address from Nominatim (includes pincode)
        // e.g. "Keesara, Medchal-Malkajgiri, Telangana, 501301, India"
        if (data.display_name) {
            return data.display_name;
        }

        // Fallback to our custom formatter if display_name is missing
        const addr = data.address as DetailedAddress;
        return formatDetailedAddress(addr);
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw error;
    }
};
