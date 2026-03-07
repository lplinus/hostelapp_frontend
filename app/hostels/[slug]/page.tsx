import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHostelBySlug, getHostels } from "@/services/hostel.service";
import HostelDetailClient from "@/components/hostelclient/hostel-detail-client";
import { generateHostelMetadata } from "@/lib/seo/hostelSeo";
import { generateHostelJsonLd } from "@/lib/seo/structuredData";

export async function generateStaticParams() {
    try {
        const hostels = await getHostels();
        return hostels.map((hostel) => ({
            slug: hostel.slug,
        }));
    } catch {
        return [];
    }
}

interface Props {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const hostel = await getHostelBySlug(slug);
        return generateHostelMetadata(hostel);
    } catch {
        return {
            title: "Hostel Not Found | StayNest",
            description: "The hostel you are looking for could not be found.",
            robots: "noindex,nofollow",
        };
    }
}

export default async function HostelDetailPage({ params }: Props) {
    const { slug } = await params;

    let hostel;
    try {
        hostel = await getHostelBySlug(slug);
    } catch {
        notFound();
    }

    if (!hostel) {
        notFound();
    }

    const jsonLd = generateHostelJsonLd(hostel);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd),
                }}
            />
            <HostelDetailClient hostel={hostel} />
        </>
    );
}
