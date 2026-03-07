const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export async function getSEO(page: string) {
    try {
        const res = await fetch(`${API_URL}/api/seo/?page=${page}`, {
            next: { revalidate: 120 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) throw new Error("SEO API failed")

        const data = await res.json()

        // Map page to content_type since backend might just return the whole list
        const CONTENT_TYPE_MAP: Record<string, number> = {
            "home": 20,
            "about-us": 22,
            "contact-us": 26,
            "pricing": 30,
            "blog": 34,
        };

        let seo = null;
        if (Array.isArray(data)) {
            const cType = CONTENT_TYPE_MAP[page];
            seo = data.find((item: any) => item.content_type === cType);
        } else {
            seo = data;
        }

        if (!seo) throw new Error("SEO not found")

        return seo;

    } catch (error) {
        console.error("SEO API Error:", error)

        return {
            meta_title: "StayNest – Affordable Hostels Across India",
            meta_description:
                "Find safe and verified hostels for students and professionals across India.",
            meta_keywords: "hostels, student hostels, pg accommodation",
            og_title: "StayNest",
            og_description: "Affordable hostels across India",
            og_image: "/default-og.jpg"
        }
    }
}
