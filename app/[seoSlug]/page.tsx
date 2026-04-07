import { Metadata } from "next";
import { notFound } from "next/navigation";
import CityClient from "@/components/cityclients/city-client";
import { CityHostelResponse } from "@/types/hostel.types";
import { generateCityListingSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function isCitySEOSlug(slug: string): boolean {
    return slug.startsWith("hostels-in-");
}

function parseCitySlug(slug: string): string {
    return slug.replace("hostels-in-", "");
}

function formatCityName(slug: string): string {
    const citySlug = parseCitySlug(slug);
    return citySlug
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function getCityHostels(slug: string): Promise<CityHostelResponse | null> {
    if (!BASE_URL) return null;

    // API expects the raw city slug (e.g. hyderabad)
    const citySlug = parseCitySlug(slug);

    const res = await fetch(`${BASE_URL}/api/locations/cities/${citySlug}/hostels/`, {
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
    readonly params: Promise<{ seoSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { seoSlug } = await params;

    if (!isCitySEOSlug(seoSlug)) {
        return {};
    }

    const data = await getCityHostels(seoSlug);

    if (!data) {
        const cityName = formatCityName(seoSlug);
        return {
            title: `Hostels in ${cityName} | Hostel In`,
            description: `Browse hostels in ${cityName}. Find top-rated, affordable student and professional hostels on Hostel In.`,
        };
    }

    return {
        title: `Best Hostels in ${data.city} | Verified Stays - Hostel In`,
        description: `Browse ${data.total} verified hostels in ${data.city}. Find top-rated, affordable student and professional hostels starting from best prices.`,
        alternates: {
            canonical: `https://hostelin.online/hostels-in-${parseCitySlug(seoSlug)}/`,
        }
    };
}

export default async function SEORoutePage({ params }: Props) {
    const { seoSlug } = await params;

    // Only handle slugs that match our SEO pattern
    if (!isCitySEOSlug(seoSlug)) {
        notFound();
    }

    const data = await getCityHostels(seoSlug);

    // If no data from API, create an empty response so the page renders with a "no hostels" state
    const cityName = formatCityName(seoSlug);
    const safeData: CityHostelResponse = data ?? {
        city: cityName,
        total: 0,
        results: [],
    };

    return (
        <div className="py-8 sm:py-10 lg:py-12 bg-gray-50 min-h-screen">
            <JsonLd
                data={generateBreadcrumbSchema([
                    { name: "Home", url: "https://hostelin.online/" },
                    { name: `Hostels in ${cityName}` }
                ])}
            />
            {safeData.results && safeData.results.length > 0 && (
                <JsonLd data={generateCityListingSchema(parseCitySlug(seoSlug), cityName, safeData.results)} />
            )}
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                <CityClient data={safeData} />
            </div>
        </div>
    );
}
