const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hostelin.online"

export async function getSEO(page: string) {
    try {
        const res = await fetch(`${API_URL}/api/seo/?page=${page}`, {
            next: { revalidate: 120 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) throw new Error("SEO API failed")

        const data = await res.json()

        // Map page to content_type in Django backend
        const CONTENT_TYPE_MAP: Record<string, number> = {
            "home": 50,
            "landing": 53,
            "about-us": 42,
            "contact-us": 46,
            "pricing": 57,
            "blog": 39,
            "faqs": 34,
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

        // Ensure canonical ends with /
        const pagePath = page === "home" || page === "landing" ? "" : page;
        const canonical = `https://hostelin.online/${pagePath}${pagePath ? "/" : ""}`;

        return {
            meta_title: "Best Hotels & Vacation Rentals Across India | StayNest",
            meta_description:
                "Discover verified luxury hotels, boutique stays, and vacation rentals across India's premier destinations. Compare prices, explore amenities, and book your stay with StayNest.",
            meta_keywords: "hotels in India, vacation rentals, luxury villas, boutique stays, hotel booking platform, verified hotels, resort booking",
            canonical_url: canonical,
            og_title: "Best Hotels & Vacation Rentals Across India | StayNest",
            og_description: "Discover verified luxury hotels, boutique stays, and vacation rentals across India's premier destinations with StayNest.",
            og_image: "https://hostelin.online/images/og-home.jpg",
            robots_directives: "index, follow",
            is_indexed: true,
            structured_data: null
        }
    }
}
