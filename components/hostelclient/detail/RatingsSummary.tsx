"use client";

import { Star, MapPin, IndianRupee, UtensilsCrossed, BedDouble } from "lucide-react";

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
    const subRatings = [
        { label: "Food", val: foodRating, icon: UtensilsCrossed, color: "text-[#312E81]", bg: "bg-indigo-50", border: "border-indigo-100" },
        { label: "Room", val: roomRating, icon: BedDouble, color: "text-[#10B981]", bg: "bg-emerald-50", border: "border-emerald-100" }
    ];

    return (
        <div className="mb-10 mt-6 relative">
            {/* Primary Key Info Strip */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#1E1B4B] border border-indigo-900 rounded-full shadow-sm text-white">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm tracking-wide">{ratingAvg.toFixed(1)} Rating</span>
                </div>
                
                {/* 
                <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-full shadow-sm text-rose-700 hover:bg-rose-100 transition-all hover:-translate-y-0.5 cursor-default">
                    <MessageCircle size={16} className="text-rose-500 fill-rose-500/10" />
                    <span className="font-bold text-sm">{ratingCount} Reviews</span>
                </div>
                */}
                
                <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm text-indigo-700 hover:bg-indigo-100 transition-all hover:-translate-y-0.5 cursor-default">
                    <MapPin size={16} className="text-indigo-500 fill-indigo-500/10" />
                    <span className="font-bold text-sm truncate max-w-[200px]">
                        {areaName ? `${areaName}, ` : ""}{cityName || "Location"}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm text-emerald-700 ml-auto hidden sm:flex hover:bg-emerald-100 transition-all hover:-translate-y-0.5 cursor-default">
                    <IndianRupee size={15} className="bg-[#10B981] text-white rounded-full p-0.5" />
                    <span className="font-black text-sm tracking-tight">Starts at ₹{Number(price).toLocaleString()} <span className="text-[10px] opacity-70">/ MONTH</span></span>
                </div>
            </div>

            {/* Sub-ratings Breakdown */}
            <div className="grid grid-cols-3 gap-3">
                {subRatings.map((cat, idx) => (
                    <div key={idx} className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${cat.bg} ${cat.border}`}>
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                            <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${cat.color}`}>
                                <cat.icon size={20} />
                            </div>
                            <span className="font-bold text-[#1E1B4B] text-sm">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-white/50 shadow-sm">
                            <span className="font-black text-[#1E1B4B]">{Number(cat.val || 5.0).toFixed(1)}</span>
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
