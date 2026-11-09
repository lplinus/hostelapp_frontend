"use client";

import type { Hotel } from "@/types/hotel.types";
import type { UseMutationResult } from "@tanstack/react-query";
import type { TabType } from "./hotel-management-types";
import { toLocalMediaPath } from "@/lib/utils";
import {
    Hotel as HotelIcon,
    Star,
    MapPin,
    Clock,
    BedDouble,
    Pencil,
    Trash2,
    Image as ImageIcon,
    Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HotelCardProps {
    hotel: Hotel;
    startEdit: (hotel: Hotel) => void;
    setPhotoModalHotel: React.Dispatch<React.SetStateAction<Hotel | null>>;
    setSelectedHotelForRooms: React.Dispatch<React.SetStateAction<string>>;
    handleTabChange: (tab: TabType) => void;
    deleteMutation: UseMutationResult<unknown, unknown, string>;
}

export default function HotelCard({
    hotel, startEdit, setPhotoModalHotel, setSelectedHotelForRooms,
    handleTabChange, deleteMutation,
}: HotelCardProps) {
    const roomCount = hotel.room_types?.length || 0;
    const imagesCount = hotel.images?.length || 0;
    const coverImg = hotel.images?.[0]?.image || hotel.og_image;
    const startingPrice = hotel.starting_price_per_night
        ? `₹${parseFloat(hotel.starting_price_per_night).toLocaleString()}`
        : "Rates on request";

    return (
        <Card className="p-0 py-0 gap-0 border border-border/80 bg-card rounded-lg sm:rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            {/* Card Image */}
            {coverImg ? (
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                        src={toLocalMediaPath(coverImg) || coverImg}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes("ik.imagekit.io") && !target.src.includes("tr=")) {
                                target.src = `${target.src}${target.src.includes("?") ? "&" : "?"}tr=w-800,f-auto`;
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                    <div className="absolute top-3 left-3">
                        <span className={`text-[10px] px-2.5 py-1 font-bold tracking-wider uppercase rounded-md shadow-xs ${hotel.is_active ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}`}>
                            {hotel.is_active ? "Active" : "Draft"}
                        </span>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold gap-1 px-2.5 py-1 rounded-md flex items-center shadow-xs">
                            <ImageIcon size={11} />
                            {imagesCount} Photo{imagesCount === 1 ? "" : "s"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="h-48 w-full bg-slate-900 dark:bg-slate-950 flex flex-col items-center justify-center p-4 border-b border-border/60 text-slate-400 gap-2 relative">
                    <HotelIcon size={28} className="text-[#312E81] dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300">No Cover Photo</span>
                    <button type="button" onClick={() => setPhotoModalHotel(hotel)} className="text-xs font-semibold text-white bg-[#312E81] flex items-center gap-1.5 px-3 py-1 rounded-md shadow-2xs cursor-pointer border border-[#312E81] hover:bg-[#1E1B4B] transition-colors">
                        <Upload size={12} className="text-white" /> Upload Photos
                    </button>
                    <div className="absolute top-3 left-3">
                        <span className={`text-[10px] px-2.5 py-1 font-bold tracking-wider uppercase rounded-md shadow-xs ${hotel.is_active ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}`}>
                            {hotel.is_active ? "Active" : "Draft"}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                    {/* Classification Label & Star Rating */}
                    <div className="flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#312E81]/10 text-[#312E81] dark:bg-indigo-950/70 dark:text-indigo-300 border border-[#312E81]/25">
                            {hotel.hotel_type_display || hotel.hotel_type || "Hotel"}
                        </span>
                        <div className="flex items-center gap-1" title={`${hotel.star_rating || 5} Star Hotel`}>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={12} className={i < (hotel.star_rating || 5) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-300 dark:fill-slate-800 dark:text-slate-700"} />
                                ))}
                            </div>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 ml-0.5">
                                {hotel.star_rating || 5} Star
                            </span>
                        </div>
                    </div>

                    {/* Hotel Name */}
                    <div>
                        <h3 className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-[#312E81] transition-colors" title={hotel.name}>
                            {hotel.name}
                        </h3>
                    </div>

                    {/* Location & Address */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <MapPin size={13} className="shrink-0 text-[#312E81] dark:text-indigo-400" />
                        <span className="truncate font-medium">
                            {hotel.area_name ? `${hotel.area_name}, ` : ""}{hotel.city_name || "City"}{hotel.address ? ` • ${hotel.address}` : ""}
                        </span>
                    </div>

                    {/* Room inventory & Check-in specs bar */}
                    <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <BedDouble size={13} className="text-[#312E81] dark:text-indigo-400 shrink-0" />
                            <span className="font-semibold truncate">{roomCount} {roomCount === 1 ? "Category" : "Categories"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Clock size={13} className="text-[#312E81] dark:text-indigo-400 shrink-0" />
                            <span className="text-muted-foreground truncate font-medium">In: {hotel.check_in_time ? hotel.check_in_time.slice(0, 5) : "14:00"}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Pricing & Actions */}
                <div className="space-y-2.5 pt-1">
                    {/* Enterprise Pricing Block */}
                    <div className="pt-2 border-t border-border/60 flex items-end justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">Starting Rate</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-bold text-foreground tabular-nums tracking-tight">{startingPrice}</span>
                                {hotel.starting_price_per_night && (<span className="text-xs text-muted-foreground font-normal">/ night</span>)}
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground/80 font-medium">+ taxes & fees</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <Button size="sm" className="text-xs h-8 px-3 gap-1.5 bg-[#312E81] text-white font-semibold rounded-md border border-[#312E81] shadow-2xs cursor-pointer hover:bg-[#1E1B4B] transition-colors" onClick={() => setPhotoModalHotel(hotel)}>
                                <ImageIcon size={12} className="text-white" /> Photos ({imagesCount})
                            </Button>
                            <Button size="sm" className="text-xs h-8 px-2.5 gap-1.5 bg-[#312E81] text-white font-semibold rounded-md border border-[#312E81] shadow-2xs cursor-pointer hover:bg-[#1E1B4B] transition-colors" onClick={() => { setSelectedHotelForRooms(hotel.id); handleTabChange("rooms"); }}>
                                <BedDouble size={12} className="text-white" /> Rooms ({roomCount})
                            </Button>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button size="icon" className="w-8 h-8 bg-[#312E81] text-white rounded-md border border-[#312E81] shadow-2xs cursor-pointer hover:bg-[#1E1B4B] flex items-center justify-center transition-colors" onClick={() => startEdit(hotel)} title="Edit Hotel">
                                <Pencil size={13} className="text-white" />
                            </Button>
                            <Button size="icon" className="w-8 h-8 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-200 dark:border-rose-900 cursor-pointer flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors shrink-0" disabled={deleteMutation.isPending} onClick={() => { if (confirm(`Are you sure you want to delete ${hotel.name}?`)) { deleteMutation.mutate(hotel.id); } }} title="Delete Hotel">
                                <Trash2 size={13} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

