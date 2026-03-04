import { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "@/components/searchclient/search-client";
import { SearchHostelResponse } from "@/types/hostel.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getSearchResults(
    location: string,
    budget: string,
    gender: string
): Promise<SearchHostelResponse | null> {
    if (!BASE_URL) return null;

    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (budget) params.append("budget", budget);
    if (gender) params.append("gender", gender);

    const res = await fetch(
        `${BASE_URL}/api/locations/search/?${params.toString()}`,
        { next: { revalidate: 0 } } // no cache — live search results
    );

    if (!res.ok) {
        console.error(`Search API error: ${res.status}`);
        return null;
    }

    return res.json();
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ location?: string; budget?: string; gender?: string }>;
}): Promise<Metadata> {
    const sp = await searchParams;
    const query = sp.location || "";

    return {
        title: query
            ? `Search results for "${query}" — HostelFinder`
            : "Search Hostels — HostelFinder",
        description: query
            ? `Browse hostels matching "${query}". Find affordable, top-rated hostels.`
            : "Search for hostels by location, budget, and type.",
    };
}

export default async function SearchPage({
    searchParams,
}: {
    readonly searchParams: Promise<{ location?: string; budget?: string; gender?: string }>;
}) {
    const sp = await searchParams;
    const location = sp.location || "";
    const budget = sp.budget || "";
    const gender = sp.gender || "";

    const data = await getSearchResults(location, budget, gender);

    return (
        <div className="py-8 sm:py-10 lg:py-12 bg-gray-50 min-h-screen">
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                <Suspense
                    fallback={
                        <div className="text-center py-20 text-gray-400">
                            Loading results…
                        </div>
                    }
                >
                    <SearchClient
                        data={data}
                        initialQuery={location}
                        initialBudget={budget}
                        initialGender={gender}
                    />
                </Suspense>
            </div>
        </div>
    );
}
