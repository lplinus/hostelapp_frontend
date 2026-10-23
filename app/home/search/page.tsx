import { Metadata } from "next";
import { redirect } from "next/navigation";
import { slugify, getCitySEOLink } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// [CANONICAL ROUTING REDIRECT]
// Replaces the old SearchClient view (Screenshot 1: plain list with sidebar filter)
// by redirecting all incoming /search requests to the canonical /hostels-in-[city]/
// route which renders CityClient with the interactive map (Screenshot 2).
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ location?: string; city?: string; budget?: string; gender?: string }>;
}): Promise<Metadata> {
    const sp = await searchParams;
    const query = sp.location || sp.city || "";

    return {
        title: query
            ? `Hostels in ${query} — Hostel In`
            : "Search Hostels — Hostel In",
        description: query
            ? `Browse verified hostels in ${query}. Find affordable, top-rated hostels with live map.`
            : "Search for hostels with live map view.",
    };
}

export default async function SearchPage({
    searchParams,
}: {
    readonly searchParams: Promise<{
        location?: string;
        city?: string;
        budget?: string;
        gender?: string;
        checkIn?: string;
        checkOut?: string;
        guests?: string;
        rooms?: string;
    }>;
}) {
    const sp = await searchParams;
    const rawLoc = (sp.location || sp.city || "").trim();

    // Map the location to the canonical city slug
    const citySlug = rawLoc ? slugify(rawLoc) : "all";

    // Safely forward any provided search parameters (check-in, check-out, guests, rooms)
    const params = new URLSearchParams();
    if (sp.checkIn) params.append("checkIn", sp.checkIn);
    if (sp.checkOut) params.append("checkOut", sp.checkOut);
    if (sp.guests && Number(sp.guests) > 1) params.append("guests", sp.guests);
    if (sp.rooms && Number(sp.rooms) > 1) params.append("rooms", sp.rooms);

    const queryString = params.toString();
    const destination = `${getCitySEOLink(citySlug)}${queryString ? `?${queryString}` : ""}`;

    // Redirect to canonical SEO listings page with interactive map (Screenshot 2)
    redirect(destination);
}

/*
================================================================================
[OLD CODE COMMENTED OUT BELOW]
Previous implementation that rendered SearchClient (Screenshot 1 sidebar view)
without interactive map:
================================================================================

import { Suspense } from "react";
import SearchClient from "@/components/home/searchclient/search-client";
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

// Old JSX return that rendered the sidebar SearchClient:
// <div className="py-8 sm:py-10 lg:py-12 bg-gray-50 min-h-screen">
//     <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
//         <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading results…</div>}>
//             <SearchClient
//                 data={data}
//                 initialQuery={location}
//                 initialBudget={budget}
//                 initialGender={gender}
//             />
//         </Suspense>
//     </div>
// </div>
================================================================================
*/
