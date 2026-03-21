import { Metadata } from "next";
import CityClient from "../../../components/cityclients/city-client";
import { CityHostelResponse } from "@/types/hostel.types";
import { generateCityListingSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function formatCityName(slug: string): string {
    return slug
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function getCityHostels(slug: string): Promise<CityHostelResponse | null> {
    if (!BASE_URL) return null;

    const res = await fetch(`${BASE_URL}/api/locations/cities/${slug}/hostels/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        console.error(`Failed to fetch city hostels: ${res.status}`);
        return null;
    }

    return res.json();
}

type Props = {
    readonly params: Promise<{ citySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { citySlug } = await params;
    const data = await getCityHostels(citySlug);

    if (!data) {
        const cityName = citySlug === "all" ? "All Cities" : formatCityName(citySlug);
        return {
            title: `Hostels in ${cityName}`,
            description: `Browse hostels in ${cityName}. Find top-rated, affordable student and professional hostels.`,
        };
    }

    return {
        title: `Hostels in ${data.city}`,
        description: `Browse ${data.total} hostels in ${data.city}. Find top-rated, affordable student and professional hostels.`,
    };
}

export default async function CityPage({ params }: Props) {
    const { citySlug } = await params;
    const data = await getCityHostels(citySlug);

    // If no data from API, create an empty response so the page renders with a "no hostels" state
    const cityName = citySlug === "all" ? "All Cities" : formatCityName(citySlug);
    const safeData: CityHostelResponse = data ?? {
        city: cityName,
        total: 0,
        results: [],
    };

    return (
        <div className="py-8 sm:py-10 lg:py-12 bg-gray-50 min-h-screen">
            <JsonLd
                data={generateBreadcrumbSchema([
                    { name: "Home", url: "https://hostelin.in/" },
                    { name: cityName }
                ])}
            />
            {safeData.results && safeData.results.length > 0 && (
                <JsonLd data={generateCityListingSchema(citySlug, cityName, safeData.results)} />
            )}
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                <CityClient data={safeData} />
            </div>
        </div>
    );
}
