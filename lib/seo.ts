const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
// const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://34.80.15.95"

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
            "landing": 43,
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
            meta_title: "Affordable Student Hostels Across India | Hostel In",
            meta_description:
                "Find verified and affordable student hostels across India's major cities. Compare prices, explore amenities, read real reviews and book your perfect hostel near campus with Hostel In.",
            meta_keywords: "student hostels in India, affordable hostels India, hostel booking platform, verified hostels near college, budget student hostels, safe hostels for students, hostel accommodation India, find hostels near me, hostelin hostels",
            canonical_url: "https://hostelin.online/",
            og_title: "Affordable Student Hostels Across India | Hostel In",
            og_description: "Discover safe and verified student hostels across India. Hostel In helps students compare hostels, explore amenities and book their perfect stay near campus.",
            og_image: "https://hostelin.online/images/og-home.jpg",
            robots_directives: "index, follow",
            is_indexed: true,
            structured_data: null
        }
    }
}
