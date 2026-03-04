import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHostelBySlug, getHostels } from "@/services/hostel.service";
import HostelDetailClient from "@/components/hostelclient/hostel-detail-client";

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
        return {
            title: `${hostel.name} | StayNext`,
            description: hostel.short_description,
        };
    } catch {
        return { title: "Hostel Not Found | StayNext" };
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

    return <HostelDetailClient hostel={hostel} />;
}
