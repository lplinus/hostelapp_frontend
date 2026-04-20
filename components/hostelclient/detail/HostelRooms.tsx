"use client";

import { useState } from "react";
import Link from "next/link";
import { Snowflake, Fan, Check, Lock } from "lucide-react";
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
    suitableFor?: string[];
}

export default function HostelRooms({ rooms, hostelSlug, priceMode, extraCharges, suitableFor }: HostelRoomsProps) {
    const [showAll, setShowAll] = useState(false);
    const hasExtraCharges = extraCharges && extraCharges.length > 0;
    const [activeTab, setActiveTab] = useState<"sharing" | "extra" | "suitable">("sharing");
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

    // Room feature bullets based on room type
    const getRoomFeatures = (room: RoomType): string[] => {
        const features: string[] = [];
        if (room.room_category === "AC") {
            features.push("Air conditioning included");
        } else {
            features.push("Well-ventilated room");
        }
        if (room.sharing_display.toLowerCase().includes("single") || getSharingLevel(room.sharing_display) === 1) {
            features.push("Private room with workspace");
            features.push("En-suite private bathroom");
        } else {
            features.push("Privacy pods with curtains");
            features.push("Individual lockable lockers");
        }
        return features;
    };

    return (
        <section className="mb-10 pt-8 border-t border-gray-100">
            {/* Section Header */}
            <h2 className="text-lg font-bold text-gray-900 mb-6">Select your Room</h2>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-6 bg-gray-50 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab("sharing")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${activeTab === "sharing"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Rooms
                </button>
                {hasExtraCharges && (
                    <button
                        onClick={() => setActiveTab("extra")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === "extra"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Extra Charges
                    </button>
                )}
                {suitableFor && suitableFor.length > 0 && (
                    <button
                        onClick={() => setActiveTab("suitable")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === "suitable"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Suitable For
                    </button>
                )}
            </div>

            {/* Sharing Tab Content */}
            {activeTab === "sharing" && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displayed.map((room) => {
                            const features = getRoomFeatures(room);
                            return (
                                <div
                                    key={room.id}
                                    className={`rounded-2xl border transition-all duration-300 ${room.is_available
                                        ? "bg-white border-gray-200 hover:border-indigo-200 hover:shadow-lg"
                                        : "bg-gray-50 border-gray-100 opacity-60"
                                        }`}
                                >
                                    <div className="p-5">
                                        {/* Room Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1">{room.sharing_display}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    {room.room_category === "AC" ? (
                                                        <Snowflake size={13} className="text-blue-500" />
                                                    ) : (
                                                        <Fan size={13} className="text-gray-400" />
                                                    )}
                                                    <span className="font-medium">{room.category_display}</span>
                                                    {!room.is_available && (
                                                        <span className="ml-1 bg-red-50 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">Sold Out</span>
                                                    )}
                                                </div>
                                            </div>

                                            {(() => {
                                                const displayPrice = priceMode === "monthly" 
                                                    ? room.base_price 
                                                    : (room.price_per_day || (room.base_price ? (Number(room.base_price) / 30).toString() : null));
                                                
                                                if (!displayPrice) return null;

                                                return (
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-0.5">
                                                            <span className="text-xl font-bold text-gray-900">
                                                                ₹{Number(displayPrice).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {priceMode === "monthly" ? "/mo" : "/day"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Room Features */}
                                        <ul className="space-y-2 mb-5">
                                            {features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check size={14} className="text-indigo-500 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        {room.is_available ? (
                                            <Link
                                                href={`/hostels/${hostelSlug}/book?roomId=${room.id}&priceMode=${priceMode}`}
                                                className="w-full flex items-center justify-center py-3 text-sm font-bold text-white bg-[#312E81] hover:bg-[#1E1B4B] rounded-xl transition-all active:scale-[0.98] shadow-sm"
                                            >
                                                Select Room
                                            </Link>
                                        ) : (
                                            <button disabled className="w-full flex items-center justify-center py-3 text-sm font-medium text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed gap-2">
                                                <Lock size={14} />
                                                Unavailable
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {rooms.length > LIMIT && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-5 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
                        >
                            {showAll ? "Show Less" : `View all ${rooms.length} room types`}
                        </button>
                    )}
                </>
            )}

            {/* Extra Charges Tab Content */}
            {activeTab === "extra" && hasExtraCharges && (
                <div className="space-y-0 bg-gray-50 rounded-2xl p-5">
                    {extraCharges!.map((charge, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between py-4 ${
                                i !== extraCharges!.length - 1 ? "border-b border-gray-200" : ""
                            }`}
                        >
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 capitalize">
                                    {charge.charge_type.replace('_', ' ')}
                                </h4>
                                {charge.description && (
                                    <p className="text-xs text-gray-400 mt-0.5">{charge.description}</p>
                                )}
                            </div>
                            <span className="text-sm font-bold text-gray-900 tabular-nums">
                                ₹{Number(charge.amount).toLocaleString()}
                                <span className="text-xs font-medium text-gray-400 ml-0.5">/mo</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Suitable For Tab Content */}
            {activeTab === "suitable" && suitableFor && suitableFor.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {suitableFor.map((item) => (
                        <span
                            key={item}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full"
                        >
                            {item.replace(/_/g, " ")}
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}
