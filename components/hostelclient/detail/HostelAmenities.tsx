"use client";

import { useState } from "react";
import {
    Wifi, Wind, Droplets, WashingMachine, Dumbbell, Lightbulb, Zap,
    UtensilsCrossed, Tv, ParkingCircle, Cctv, ShieldCheck, BookOpen,
    BedDouble, Shirt, Volume2, CircleDot
} from "lucide-react";

const AMENITY_ICON_MAP: Record<string, React.ElementType> = {
    wifi: Wifi,
    ac: Wind,
    "hot water": Droplets,
    "hot-water": Droplets,
    laundry: WashingMachine,
    gym: Dumbbell,
    light: Lightbulb,
    "power backup": Zap,
    "power-backup": Zap,
    food: UtensilsCrossed,
    mess: UtensilsCrossed,
    tv: Tv,
    parking: ParkingCircle,
    cctv: Cctv,
    security: ShieldCheck,
    "study room": BookOpen,
    "study-room": BookOpen,
    bed: BedDouble,
    "washing machine": WashingMachine,
    "iron": Shirt,
    noise: Volume2,
};

function getAmenityIcon(name: string): React.ElementType {
    const lower = name.toLowerCase().trim();
    for (const key of Object.keys(AMENITY_ICON_MAP)) {
        if (lower.includes(key)) return AMENITY_ICON_MAP[key];
    }
    return CircleDot;
}

interface HostelAmenitiesProps {
    amenities: readonly { id: number; name: string }[];
}

export default function HostelAmenities({ amenities }: HostelAmenitiesProps) {
    const [showAll, setShowAll] = useState(false);
    const LIMIT = 6;

    if (!amenities || amenities.length === 0) return null;

    const displayed = showAll ? amenities : amenities.slice(0, LIMIT);

    return (
        <div className="mb-10 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((amenity) => {
                    const IconComp = getAmenityIcon(amenity.name);
                    return (
                        <div
                            key={amenity.id}
                            className="flex flex-row items-center gap-4 px-5 py-4 rounded-2xl border border-gray-200 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                                <IconComp size={22} className="text-slate-700 group-hover:text-blue-600 transition-colors stroke-[1.5]" />
                            </div>
                            <span className="text-[15px] text-gray-700 font-medium leading-tight group-hover:text-gray-900 transition-colors">{amenity.name}</span>
                        </div>
                    );
                })}
            </div>

            {amenities.length > LIMIT && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-6 px-6 py-3 border border-gray-900 rounded-xl text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
                >
                    {showAll ? "Show Less" : `View all ${amenities.length} amenities`}
                </button>
            )}
        </div>
    );
}
