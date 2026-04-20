"use client";

import { useState } from "react";
import {
    Wifi, Wind, Droplets, WashingMachine, Dumbbell, Lightbulb, Zap,
    UtensilsCrossed, Tv, ParkingCircle, Cctv, ShieldCheck, BookOpen,
    BedDouble, Shirt, Volume2, CircleDot, Coffee, Laptop
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
    cafe: Coffee,
    "co-working": Laptop,
    coworking: Laptop,
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
    const LIMIT = 8;

    if (!amenities || amenities.length === 0) return null;

    const displayed = showAll ? amenities : amenities.slice(0, LIMIT);

    return (
        <section className="mb-10 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Amenities</h2>

            {/* Horizontal scrollable chip layout */}
            <div className="flex flex-wrap gap-2.5">
                {displayed.map((amenity) => {
                    const IconComp = getAmenityIcon(amenity.name);
                    return (
                        <div
                            key={amenity.id}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 cursor-default group"
                        >
                            <IconComp size={16} className="text-gray-400 group-hover:text-[#312E81] transition-colors" strokeWidth={1.5} />
                            <span>{amenity.name}</span>
                        </div>
                    );
                })}
            </div>

            {amenities.length > LIMIT && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 text-sm font-semibold text-[#312E81] hover:text-[#1E1B4B] underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-400 transition-colors"
                >
                    {showAll ? "Show less" : `Show all ${amenities.length} amenities`}
                </button>
            )}
        </section>
    );
}
