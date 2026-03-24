"use client";

import { Share2, Heart } from "lucide-react";
import { useState } from "react";
import StarRating from "./StarRating";

interface HostelHeaderProps {
    name: string;
    areaName?: string;
    cityName?: string;
    ratingAvg: number;
    ratingCount: number;
}

export default function HostelHeader({
    name,
    areaName,
    cityName,
    ratingAvg,
    ratingCount,
}: HostelHeaderProps) {
    const [saved, setSaved] = useState(false);

    return (
        <div className="mt-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                        {name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 font-medium">
                        <span>
                            {areaName ? `${areaName}, ` : ""}
                            {cityName || "Unknown"}
                        </span>
                        <span className="text-gray-300 hidden sm:inline">|</span>
                        <div className="flex items-center gap-1">
                            <StarRating rating={ratingAvg} />
                            <span className="ml-1 text-gray-900 font-bold">
                                {ratingAvg.toFixed(1)}
                            </span>
                            <span className="text-gray-400 font-normal">
                                ({ratingCount} reviews)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700 underline underline-offset-4"
                        onClick={() => {
                            navigator.share?.({
                                title: name,
                                url: typeof window !== "undefined" ? window.location.href : "",
                            });
                        }}
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                    <button
                        onClick={() => setSaved(!saved)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700 underline underline-offset-4"
                    >
                        <Heart
                            size={16}
                            className={saved ? "fill-red-500 text-red-500" : ""}
                        />
                        <span>{saved ? "Saved" : "Save"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
