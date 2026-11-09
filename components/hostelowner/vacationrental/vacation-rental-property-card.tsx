"use client";

import Image from "next/image";
import type { VacationRental } from "@/types/vacationrental.types";
import type { UseMutationResult } from "@tanstack/react-query";
import { toLocalMediaPath } from "@/lib/utils";
import {
    Palmtree, MapPin, BedDouble, Pencil, Trash2,
    Users, Wifi, User, Zap, Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VacationRentalPropertyCardProps {
    rental: VacationRental;
    handleEditRental: (rental: VacationRental) => void;
    setPhotoModalRental: React.Dispatch<React.SetStateAction<VacationRental | null>>;
    setSelectedRentalForRooms: React.Dispatch<React.SetStateAction<string>>;
    setActiveTab: (tab: "properties" | "rooms") => void;
    deleteMutation: UseMutationResult<unknown, unknown, string>;
}

export default function VacationRentalPropertyCard({
    rental, handleEditRental, setPhotoModalRental,
    setSelectedRentalForRooms, setActiveTab, deleteMutation,
}: VacationRentalPropertyCardProps) {
    const coverImg = rental.images && rental.images.length > 0 ? rental.images[0].image : rental.og_image;
    const coverUrl = toLocalMediaPath(coverImg);

    return (
        <Card className="p-0 py-0 gap-0 border border-slate-200/90 dark:border-slate-800 bg-card hover:shadow-md transition-all flex flex-col group rounded-lg sm:rounded-xl overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                {coverUrl ? (
                    <Image src={coverUrl} alt={rental.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1 bg-slate-50">
                        <Palmtree size={32} className="opacity-40" />
                        <span className="text-[11px] font-medium">No cover image</span>
                    </div>
                )}
                {/* Category Pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge className="bg-white/95 text-slate-900 border border-slate-200/80 shadow-xs font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                        {rental.category_display || rental.category}
                    </Badge>
                    {rental.instant_book && (
                        <Badge className="bg-[#312E81]/90 text-white font-semibold text-[10px] shadow-xs">
                            <Zap size={10} className="mr-0.5" />Instant
                        </Badge>
                    )}
                </div>
                {/* Photo Count Pill */}
                <button type="button" onClick={() => setPhotoModalRental(rental)} className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                    <ImageIcon size={13} />
                    <span>{rental.images?.length || 0} Photos</span>
                </button>
            </div>

            {/* Content */}
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-[#312E81] transition-colors">{rental.title}</h3>
                        <span className="text-sm font-extrabold text-[#312E81] shrink-0">
                            ₹{parseFloat(rental.price_per_night || "0").toLocaleString("en-IN")}
                            <span className="text-[10px] font-normal text-muted-foreground">/nt</span>
                        </span>
                    </div>
                    {rental.tagline && (<p className="text-xs text-muted-foreground line-clamp-1 font-medium">{rental.tagline}</p>)}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate">{rental.area_name ? `${rental.area_name}, ` : ""}{rental.city_name || rental.address}</span>
                    </p>
                </div>

                {/* Caretaker & Wi-Fi Mini Badges */}
                {(rental.caretaker_name || rental.wifi_name) && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {rental.caretaker_name && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/80">
                                <User size={11} className="text-slate-500" />
                                <span className="truncate max-w-[140px]">{rental.caretaker_name}</span>
                            </span>
                        )}
                        {rental.wifi_name && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-[#312E81] font-medium border border-indigo-100">
                                <Wifi size={11} className="text-[#312E81]" />
                                <span className="truncate max-w-[140px]">Wi-Fi: {rental.wifi_name}</span>
                            </span>
                        )}
                    </div>
                )}

                {/* Specs Pills */}
                <div className="flex items-center gap-3 py-2 border-y text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={13} className="text-slate-400" />{rental.max_guests} Guests</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><BedDouble size={13} className="text-slate-400" />{rental.bedrooms} BR</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">{rental.bathrooms} Bath</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Button size="sm" onClick={() => { setSelectedRentalForRooms(rental.id); setActiveTab("rooms"); }} className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-[#312E81] text-white hover:bg-[#1E1B4B] border border-[#312E81] shadow-2xs rounded-md cursor-pointer transition-colors" title="Manage Rooms & Units">
                            <BedDouble size={12} className="text-white" /><span>Rooms</span>
                        </Button>
                        <Button size="sm" onClick={() => setPhotoModalRental(rental)} className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-[#312E81] text-white hover:bg-[#1E1B4B] border border-[#312E81] shadow-2xs rounded-md cursor-pointer transition-colors" title="Manage Photos">
                            <ImageIcon size={12} className="text-white" /><span>Photos</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button size="icon" onClick={() => handleEditRental(rental)} className="w-8 h-8 bg-[#312E81] text-white hover:bg-[#1E1B4B] border border-[#312E81] shadow-2xs rounded-md cursor-pointer flex items-center justify-center transition-colors shrink-0" title="Edit Vacation Rental">
                            <Pencil size={12} className="text-white" />
                        </Button>
                        <Button size="icon" onClick={() => { if (confirm(`Are you sure you want to remove "${rental.title}" from your portfolio?`)) { deleteMutation.mutate(rental.slug); } }} className="w-8 h-8 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 hover:text-white rounded-md border border-rose-200 dark:border-rose-900 cursor-pointer flex items-center justify-center transition-colors shrink-0" title="Delete Vacation Rental">
                            <Trash2 size={12} />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

