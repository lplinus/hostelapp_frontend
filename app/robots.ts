import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online";

    return {
        rules: [
            {
                userAgent: "*",

                // ✅ Allow main pages
                allow: [
                    "/",
                    "/hostels",
                    "/hostels/",
                    "/hostels-in-",
                    "/blog",
                ],

                // 🚨 Block unwanted URLs
                disallow: [
                    "/api/",
                    "/admin/",
                    "/book",
                    "/*?*",
                    "/&",
                    "/$",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}