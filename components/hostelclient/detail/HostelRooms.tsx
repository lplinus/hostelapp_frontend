"use client";

import { useState } from "react";
import Link from "next/link";
import { Snowflake, Fan, BedDouble, Check } from "lucide-react";
import type { ExtraCharge } from "@/types/hostel.types";

interface RoomType {
    id: number;
    room_category: string;
    category_display: string;
    sharing_display: string;
    base_price: string | null;
    price_per_day: string | null;
    available_beds: number;
    total_beds: number;
    is_available: boolean;
}

interface HostelRoomsProps {
    rooms: readonly RoomType[];
    hostelSlug: string;
    priceMode: "monthly" | "daily";
    extraCharges?: readonly ExtraCharge[];
}

export default function HostelRooms({ rooms, hostelSlug, priceMode, extraCharges }: HostelRoomsProps) {
    const [showAll, setShowAll] = useState(false);
    const hasExtraCharges = extraCharges && extraCharges.length > 0;
    const [activeTab, setActiveTab] = useState<"sharing" | "extra">("sharing");
    const LIMIT = 4;

    if (!rooms || rooms.length === 0) return null;

    // Group rooms by sharing_display to keep them together
    const grouped = rooms.reduce((acc, room) => {
        const key = room.sharing_display;
        if (!acc[key]) acc[key] = [];
        acc[key].push(room);
        return acc;
    }, {} as Record<string, RoomType[]>);

    // Helper to extract sharing numeric value
    const getSharingLevel = (s: string) => {
        const num = Number.parseInt(s);
        if (!Number.isNaN(num)) return num;
        const lower = s.toLowerCase();
        if (lower.includes("four") || lower.includes("4")) return 4;
        if (lower.includes("three") || lower.includes("triple") || lower.includes("3")) return 3;
        if (lower.includes("two") || lower.includes("double") || lower.includes("2")) return 2;
        if (lower.includes("one") || lower.includes("single") || lower.includes("1")) return 1;
        return 0;
    };

    // Sort the sharing groups based strictly on sharing level (4,3,2,1)
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        return getSharingLevel(b) - getSharingLevel(a);
    });

    // Flatten back into a list, ensuring AC comes before Non-AC within each group
    const orderedRooms = sortedKeys.flatMap(key => {
        return grouped[key].sort((a, b) => a.room_category.localeCompare(b.room_category));
    });

    const displayed = showAll ? orderedRooms : orderedRooms.slice(0, LIMIT);

    return (
        <div className="mb-12 pt-6 border-t border-gray-100">
            {/* Tab Header */}
            <div className="flex items-center gap-1 mb-8">
                <button
                    onClick={() => setActiveTab("sharing")}
                    className={`px-5 py-2.5 rounded-full text-[15px] font-semibold tracking-tight transition-all duration-200
                        ${activeTab === "sharing"
                            ? "bg-[#1E1B4B] text-white shadow-lg shadow-indigo-200/50"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        }`}
                >
                    Available Options
                </button>
                {hasExtraCharges && (
                    <button
                        onClick={() => setActiveTab("extra")}
                        className={`px-5 py-2.5 rounded-full text-[15px] font-semibold tracking-tight transition-all duration-200
                            ${activeTab === "extra"
                                ? "bg-[#1E1B4B] text-white shadow-lg shadow-indigo-200/50"
                                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                    >
                        Extra Charges
                    </button>
                )}
            </div>

            {/* Sharing Tab Content */}
            {activeTab === "sharing" && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {displayed.map((room) => (
                            <div
                                key={room.id}
                                className={`rounded-[2rem] overflow-hidden border border-gray-200 transition-all duration-300 group ${room.is_available
                                    ? "bg-white hover:border-[#10B981] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1"
                                    : "bg-gray-50 opacity-60"
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3 gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900 leading-none">{room.sharing_display}</h3>
                                                {!room.is_available && (
                                                    <span className="bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded text-[10px] border border-red-200">Sold Out</span>
                                                )}
                                                {/* {room.is_available && (
                                                    <span className="bg-emerald-50 text-[#10B981] font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                                        {room.available_beds} Beds Left
                                                    </span>
                                                )} */}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 mt-2">
                                                {room.room_category === "AC" ? (
                                                    <Snowflake size={16} className="text-[#3B82F6]" />
                                                ) : (
                                                    <Fan size={16} className="text-gray-500" />
                                                )}
                                                <span>{room.category_display}</span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const displayPrice = priceMode === "monthly" 
                                                ? room.base_price 
                                                : (room.price_per_day || (room.base_price ? (Number(room.base_price) / 30).toString() : null));
                                            
                                            if (!displayPrice) return null;

                                            return (
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-black text-2xl text-gray-900 tracking-tight">
                                                            ₹{Number(displayPrice).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{priceMode === "monthly" ? "/month" : "/day"}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex items-center gap-4 mt-6 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <BedDouble size={16} className="text-gray-400" />
                                            <span>Comfortable Beds</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <Check size={16} className="text-[#10B981]" />
                                            <span>Cleaning included</span>
                                        </div>
                                    </div>

                                    {room.is_available ? (
                                        <Link
                                            href={`/hostels/${hostelSlug}/book?roomId=${room.id}&priceMode=${priceMode}`}
                                            className="w-full flex items-center justify-center py-3.5 text-sm font-bold text-white bg-[#312E81] hover:bg-[#1E1B4B] rounded-xl transition-all shadow-md active:scale-[0.98]"
                                        >
                                            Select Room
                                        </Link>
                                    ) : (
                                        <button disabled className="w-full flex items-center justify-center py-3.5 text-sm font-bold text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed">
                                            Unavailable
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {rooms.length > LIMIT && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-6 px-6 py-3 border border-gray-900 rounded-xl text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
                        >
                            {showAll ? "Show Less" : `View all ${rooms.length} room types`}
                        </button>
                    )}
                </>
            )}

            {/* Extra Charges Tab Content */}
            {activeTab === "extra" && hasExtraCharges && (
                <div className="space-y-0">
                    {extraCharges!.map((charge, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between py-5 ${
                                i !== extraCharges!.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                        >
                            <div>
                                <h4 className="text-[17px] font-semibold text-gray-900 capitalize tracking-tight">
                                    {charge.charge_type.replace('_', ' ')}
                                </h4>
                                {charge.description && (
                                    <p className="text-sm text-gray-400 mt-0.5 font-medium">{charge.description}</p>
                                )}
                            </div>
                            <span className="text-xl font-bold text-[#1E1B4B] tracking-tight tabular-nums">
                                ₹{Number(charge.amount).toLocaleString()}
                                <span className="text-xs font-semibold text-gray-400 ml-1">/mo</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
