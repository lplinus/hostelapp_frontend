import { Metadata } from "next";
import TypeClient from "@/components/hostelclient/type-client";
import { TypeHostelResponse } from "@/types/hostel.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function formatTypeName(slug: string): string {
    return slug
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function getTypeHostels(slug: string): Promise<TypeHostelResponse | null> {
    const res = await fetch(`${BASE_URL}/api/hostels/types/${slug}/hostels/`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        console.error(`Failed to fetch type hostels: ${res.status}`);
        return null;
    }

    return res.json();
}

type Props = {
    readonly params: Promise<{ typeSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { typeSlug } = await params;
    const data = await getTypeHostels(typeSlug);

    if (!data) {
        const typeName = typeSlug === "all" ? "All Hostels" : formatTypeName(typeSlug);
        return {
            title: typeName,
            description: `Browse ${typeName}. Find top-rated, affordable hostels.`,
        };
    }

    return {
        title: `${data.type}s`,
        description: `Browse ${data.total} ${data.type}s. Find top-rated, affordable hostels.`,
    };
}

export default async function TypePage({ params }: Props) {
    const { typeSlug } = await params;
    const data = await getTypeHostels(typeSlug);

    // If no data from API, create an empty response so the page renders with a "no hostels" state
    const typeName = typeSlug === "all" ? "All Hostels" : formatTypeName(typeSlug);
    const safeData: TypeHostelResponse = data ?? {
        type: typeName,
        type_slug: typeSlug,
        total: 0,
        results: [],
    };

    return (
        <div className="py-8 sm:py-10 lg:py-12 bg-gray-50 min-h-screen">
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                <TypeClient data={safeData} />
            </div>
        </div>
    );
}

