// import { getHostels } from "@/services/hostel.service";
// import { getCities, CityItem } from "@/services/location.service";
// import { HostelListItem } from "@/types/hostel.types";

// export default async function sitemap() {
//     const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://staynest.in";

//     let hostels: HostelListItem[] = [];
//     let cities: CityItem[] = [];

//     try {
//         hostels = await getHostels();
//     } catch (error) {
//         console.error("Failed to fetch hostels for sitemap", error);
//     }

//     try {
//         cities = await getCities();
//     } catch (error) {
//         console.error("Failed to fetch cities for sitemap", error);
//     }

//     return [
//         { url: baseUrl, priority: 1 },
//         ...cities.map((city) => ({
//             url: `${baseUrl}/city/${city.slug}`,
//             priority: 0.8,
//         })),
//         ...hostels.map((hostel) => ({
//             url: `${baseUrl}/hostels/${hostel.slug}`,
//             priority: 0.7,
//         })),
//     ];
// }


// import { getHostels } from "@/services/hostel.service";
// import { getCities } from "@/services/location.service";
import { getHostels } from "@/services/hostel.service";
import { getCities } from "@/services/location.service";
import { HostelListItem } from "@/types/hostel.types";
import { CityItem } from "@/services/location.service";

export default async function sitemap() {
    // const baseUrl =
    //     process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

    if (!baseUrl) {
        throw new Error("SITE URL is not defined");
    }

    // let hostels: any = [];
    // let cities: any = [];
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
        { url: baseUrl, priority: 1 },

        ...cities.map((city: any) => ({
            url: `${baseUrl}/city/${city.slug}`,
            priority: 0.8,
        })),

        ...hostels.map((hostel: any) => ({
            url: `${baseUrl}/hostels/${hostel.slug}`,
            priority: 0.7,
        })),
    ];
}