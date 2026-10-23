"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { CityHostel } from "@/types/hostel.types";

import type L from "leaflet";

interface HostelListingMapProps {
    readonly hostels: readonly CityHostel[];
    readonly allHostels?: readonly CityHostel[];
    readonly cityName: string;
    readonly hoveredHostelId?: number | string | null;
    readonly onMarkerClick?: (hostel: CityHostel) => void;
    readonly onSearchThisArea?: (bounds: L.LatLngBounds) => void;
}

const HostelListingMapClient = dynamic(
    () => import("./hostel-listing-map-inner"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-[22px] text-slate-400 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-emerald-600 animate-bounce" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Loading Map
                    </span>
                    <span className="text-[11px] text-slate-400">
                        Locating hostels across the area...
                    </span>
                </div>
            </div>
        ),
    }
);

export default function HostelListingMap(props: HostelListingMapProps) {
    return <HostelListingMapClient {...props} />;
}
