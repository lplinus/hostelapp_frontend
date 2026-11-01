import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVacationRentalBySlug } from "@/services/vacanatinalrentalservices/vacationrental.service";
import VacationRentalDetailClient from "@/components/home/vacanationalrental/vacationrentaldetails/vacation-rental-detail-client";

export const dynamic = "force-dynamic";

interface Props {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const rental = await getVacationRentalBySlug(slug);
        const title = `${rental.title} - ${rental.category_display || "Vacation Villa"} in ${rental.city_name || "India"}`;
        const description =
            rental.short_description ||
            rental.tagline ||
            (rental.description ? `${rental.description.slice(0, 155)}...` : `Reserve your private stay at ${rental.title}.`);

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: rental.images?.[0]?.image ? [rental.images[0].image] : [],
                type: "website",
            },
        };
    } catch {
        return {
            title: "Vacation Rental Not Found | Hostel In",
            description: "The vacation rental you are looking for could not be found.",
            robots: "noindex,nofollow",
        };
    }
}

export default async function VacationRentalDetailPage({ params }: Props) {
    const { slug } = await params;

    let rental;
    try {
        rental = await getVacationRentalBySlug(slug);
    } catch (err) {
        notFound();
    }

    if (!rental) {
        notFound();
    }

    return <VacationRentalDetailClient rental={rental} />;
}
