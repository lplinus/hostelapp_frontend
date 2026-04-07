import { HostelDetail, CityHostel, HostelReview } from "@/types/hostel.types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online";

// Helper for trailing slash consistency in schema
const withTrailingSlash = (url: string) => url.endsWith("/") ? url : `${url}/`;

export function generateHostelSchema(data: HostelDetail) {
    const defaultImage = data.images?.[0]?.image || data.default_images?.image1 || `${baseUrl}/default-hostel.jpg`;

    return {
        "@context": "https://schema.org",
        "@type": "Hostel",
        "@id": `${withTrailingSlash(`${baseUrl}/hostels/${data.slug}`)}#hostel`,
        name: data.name,
        description: data.description || data.short_description,
        image: defaultImage,
        address: {
            "@type": "PostalAddress",
            streetAddress: data.address,
            addressLocality: data.city?.name,
            addressRegion: data.city?.name,
            postalCode: data.postal_code || undefined,
            addressCountry: "IN",
        },
        geo: data.latitude && data.longitude ? {
            "@type": "GeoCoordinates",
            latitude: data.latitude,
            longitude: data.longitude,
        } : undefined,
        aggregateRating: data.rating_count > 0 ? {
            "@type": "AggregateRating",
            ratingValue: data.rating_avg > 0 ? data.rating_avg.toFixed(1) : "5.0",
            reviewCount: data.rating_count,
        } : undefined,
        priceRange: "₹₹",
        telephone: undefined, // Optionally add if available
        url: withTrailingSlash(`${baseUrl}/hostels/${data.slug}`),
    };
}

export function generateBreadcrumbSchema(items: { name: string; url?: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            ...(item.url ? { item: item.url } : {}),
        })),
    };
}

export function generateCityListingSchema(citySlug: string, cityName: string, hostels: readonly CityHostel[]) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${withTrailingSlash(`${baseUrl}/hostels-in-${citySlug}`)}#city`,
        name: `Hostels in ${cityName}`,
        description: `Top rated hostels available in ${cityName}`,
        itemListElement: hostels.map((hostel, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Hostel",
                name: hostel.name,
                url: withTrailingSlash(`${baseUrl}/hostels/${hostel.slug}`),
                image: hostel.thumbnail || `${baseUrl}/default-hostel.jpg`,
                aggregateRating: hostel.rating > 0 ? {
                    "@type": "AggregateRating",
                    ratingValue: hostel.rating.toFixed(1),
                    reviewCount: 1, // Defaulting if not available
                } : undefined,
            },
        })),
    };
}

export function generateReviewSchema(review: HostelReview, hostelName: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: {
            "@type": "Hostel",
            name: hostelName,
        },
        author: {
            "@type": "Person",
            name: review.user_name || "Anonymous",
        },
        publisher: {
            "@type": "Organization",
            name: "Hostel In",
        },
        reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating > 0 ? review.rating : 5,
            bestRating: "5",
        },
        reviewBody: review.comment,
        datePublished: review.created_at ? new Date(review.created_at).toISOString() : undefined,
    };
}

export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Hostel In",
        url: withTrailingSlash(baseUrl),
        logo: `${baseUrl}/logo.png`, // Use accurate URL in production
        sameAs: [
            "https://www.facebook.com/hostelin",
            "https://www.twitter.com/hostelin",
            "https://www.instagram.com/hostelin",
        ],
    };
}

export function generateWebsiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Hostel In",
        url: withTrailingSlash(baseUrl),
        potentialAction: {
            "@type": "SearchAction",
            target: `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };
}
