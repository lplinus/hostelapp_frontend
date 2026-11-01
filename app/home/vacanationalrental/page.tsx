import VacationRentalsLayout from "@/components/home/vacanationalrental/vacation-rentals-layout";
import { getVacationRentals } from "@/services/vacanatinalrentalservices/vacationrental.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Vacation Rentals & Private Villas | Verified Holiday Stays in India",
    description: "Discover private beach villas, hillside cabins, lakeside havelis, and luxury farmhouses with instant booking and verified hosts across India.",
    openGraph: {
        title: "Vacation Rentals & Private Villas | Verified Holiday Stays in India",
        description: "Discover private beach villas, hillside cabins, lakeside havelis, and luxury farmhouses with instant booking and verified hosts across India.",
        type: "website",
    },
};

export default async function VacationRentalsPage() {
    let rentals: any[] = [];
    try {
        rentals = await getVacationRentals();
    } catch (err) {
        console.error("Failed to fetch vacation rentals for listing:", err);
    }

    return <VacationRentalsLayout rentals={rentals} />;
}
