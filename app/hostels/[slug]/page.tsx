import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHostelBySlug, getHostels } from "@/services/hostel.service";
import HostelDetailClient from "@/components/hostelclient/hostel-detail-client";
import { generateHostelMetadata } from "@/lib/seo/hostelSeo";
import { generateHostelSchema, generateBreadcrumbSchema, generateReviewSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";
export const dynamic = "force-dynamic";

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
            title: "Hostel Not Found | Hostel In",
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

    return (
        <>
            <JsonLd data={generateHostelSchema(hostel)} />
            <JsonLd
                data={generateBreadcrumbSchema([
                    { name: "Home", url: "https://hostelin.online/" },
                    { 
                        name: hostel.city?.name || "City", 
                        url: `https://hostelin.online/hostels-in-${hostel.city?.slug || "all"}/` 
                    },
                    { name: hostel.name }
                ])}
            />
            {hostel.reviews?.map((review) => (
                <JsonLd key={review.id} data={generateReviewSchema(review, hostel.name)} />
            ))}
            <HostelDetailClient hostel={hostel} />
        </>
    );
}
