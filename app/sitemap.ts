import { getHostels } from "@/services/hostel.service";
import { getCities } from "@/services/location.service";
import { HostelListItem } from "@/types/hostel.types";
import { CityItem } from "@/services/location.service";

export default async function sitemap() {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online";

    let hostels: HostelListItem[] = [];
    let cities: CityItem[] = [];

    try {
        hostels = await getHostels();
    } catch (error) {
        console.error("Failed to fetch hostels for sitemap", error);
    }

    try {
        cities = await getCities();
    } catch (error) {
        console.error("Failed to fetch cities for sitemap", error);
    }

    return [
        // ✅ STATIC PAGES (MANUAL)
        {
            url: baseUrl,
            priority: 1,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/faqs`,
            priority: 0.7,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/about`,
            priority: 0.6,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/contact`,
            priority: 0.6,
            lastModified: new Date(),
        },

        // ✅ CITY PAGES (DYNAMIC)
        ...cities.map((city) => ({
            url: `${baseUrl}/city/${city.slug}`,
            priority: 0.8,
            lastModified: new Date(),
        })),

        // ✅ HOSTEL PAGES (DYNAMIC)
        ...hostels.map((hostel) => ({
            url: `${baseUrl}/hostels/${hostel.slug}`,
            priority: 0.7,
            lastModified: new Date(),
        })),
    ];
}