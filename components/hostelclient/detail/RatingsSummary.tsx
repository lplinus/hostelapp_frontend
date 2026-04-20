"use client";

import { Star, MapPin, UtensilsCrossed, Armchair, ShieldCheck, Sparkles } from "lucide-react";

interface KeyInfoProps {
    ratingAvg: number;
    ratingCount: number;
    areaName?: string;
    cityName?: string;
    price: string;
    hostelRating: number;
    foodRating: number;
    roomRating: number;
}

export default function RatingsSummary({
    ratingAvg,
    ratingCount,
    areaName,
    cityName,
    price,
    hostelRating,
    foodRating,
    roomRating,
}: KeyInfoProps) {
    const highlights = [
        { icon: UtensilsCrossed, label: "Curated Meals", sub: "Nutritious & fresh" },
        { icon: Armchair, label: "Ergo Design", sub: "Comfort-first spaces" },
        { icon: ShieldCheck, label: "24/7 Safety", sub: "Secure campus" },
        { icon: Sparkles, label: "Sanitized Daily", sub: "Deep-cleaned rooms" },
    ];

    return (
        <div className="mb-8 mt-4">
            {/* Location & Rating Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                    <MapPin size={14} className="text-gray-400" />
                    <span>
                        {areaName ? `${areaName}, ` : ""}{cityName || "Location"}
                    </span>
                </div>
                <span className="text-gray-300 hidden sm:inline">·</span>
                <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">{ratingAvg.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({ratingCount} reviews)</span>
                </div>
            </div>

            {/* Property Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-6 border-y border-gray-100">
                {highlights.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center text-center gap-2 py-3 group cursor-default"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300">
                            <item.icon size={20} className="text-gray-600 group-hover:text-[#312E81] transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-gray-800 leading-tight">{item.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
