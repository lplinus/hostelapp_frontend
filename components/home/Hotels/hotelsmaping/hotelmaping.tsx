"use client";

import { useEffect, useState } from "react";
import HotelsLayout from "@/components/home/Hotels/hotels-layout";
import { getHotels } from "@/services/hotelservices/hotel.service";
import { Hotel } from "@/types/hotel.types";
import { Loader2 } from "lucide-react";

interface HotelMappingProps {
    readonly initialHotels?: readonly Hotel[];
}

export default function HotelMapping({ initialHotels }: HotelMappingProps) {
    const [hotels, setHotels] = useState<readonly Hotel[]>(initialHotels || []);
    const [isLoading, setIsLoading] = useState(!initialHotels || initialHotels.length === 0);

    useEffect(() => {
        if (!initialHotels || initialHotels.length === 0) {
            getHotels()
                .then((data) => setHotels(data))
                .catch((err) => console.error("Failed to load hotels:", err))
                .finally(() => setIsLoading(false));
        }
    }, [initialHotels]);

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#312E81]" />
                <span className="text-xs font-semibold text-slate-600">Loading Hotels & Suites...</span>
            </div>
        );
    }

    return <HotelsLayout hotels={hotels} />;
}
