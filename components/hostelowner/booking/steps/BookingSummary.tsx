"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar as CalendarIcon, Users, Zap, Headphones, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { HostelDetail } from "@/types/hostel.types";

interface BookingSummaryProps {
    hostel: HostelDetail;
    selectedRoom: any;
    selectedRoomId: string | null;
    setSelectedRoomId: (id: string | null) => void;
    form: any;
    nights: number;
    totalPrice: number;
    bookingFee: number;
    finalTotalPrice: number;
    setStep: (s: any) => void;
    bookingStatus: "pending" | "confirmed";
}

export function BookingSummary({
    hostel,
    selectedRoom,
    selectedRoomId,
    setSelectedRoomId,
    form,
    nights,
    totalPrice,
    bookingFee,
    finalTotalPrice,
    setStep,
    bookingStatus
}: BookingSummaryProps) {
    const isConfirmed = bookingStatus === "confirmed";

    return (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Hostel Info Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-b from-slate-50/70 to-white">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Reservation Summary
                    </span>
                    {isConfirmed ? (
                        <Badge className="bg-blue-50 text-[#003580] border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 shadow-none">
                            <CheckCircle2 size={10} className="mr-1 text-[#003580]" />
                            Confirmed Booking
                        </Badge>
                    ) : (
                        <Badge className="bg-[#003580]/10 hover:bg-[#003580]/15 text-[#003580] border border-[#003580]/20 text-[10px] font-bold px-2.5 py-0.5 shadow-none">
                            <Zap size={10} className="mr-1 text-[#003580]" />
                            Instant confirmation
                        </Badge>
                    )}
                </div>
                <h4 className="font-semibold text-slate-900 text-base sm:text-[17px] leading-snug tracking-tight mb-1">{hostel.name}</h4>
                <p className="text-xs text-gray-500 font-medium">
                    {hostel.city?.name ? `${hostel.city.name}` : ""}
                    {selectedRoom && ` • ${selectedRoom.category_display} (${selectedRoom.sharing_display})`}
                </p>
            </div>

            {/* Room Selector */}
            <div className="px-4 pt-3 pb-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Selected Room Type</Label>
                <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId} disabled={isConfirmed}>
                    <SelectTrigger className={cn(
                        "w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-white hover:border-[#003580]/30 transition-all focus:ring-2 focus:ring-[#003580]/15 focus:border-[#003580] text-sm",
                        isConfirmed && "opacity-80 bg-gray-100 cursor-not-allowed"
                    )}>
                        <div className="flex items-center justify-between w-full pr-1 text-left">
                            {(() => {
                                const currentRoom = selectedRoom || hostel.room_types?.find(r => r.id.toString() === selectedRoomId);
                                if (!currentRoom) return <span className="text-gray-400 font-normal">Choose room sharing & type</span>;
                                return (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={cn(
                                            "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0",
                                            currentRoom.room_category === "AC"
                                                ? "bg-blue-50 text-[#003580] border border-blue-100"
                                                : "bg-slate-100 text-slate-700 border border-slate-200"
                                        )}>
                                            {currentRoom.room_category || "Standard"}
                                        </span>
                                        <span className="font-semibold text-gray-900 text-sm truncate">
                                            {currentRoom.sharing_display}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                            • ₹{Number(currentRoom.base_price).toLocaleString()}/mo
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-2xl border border-gray-100 shadow-2xl bg-white p-1.5 z-[9999]">
                        {(() => {
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

                            const sortedRooms = [...(hostel.room_types || [])].sort((a, b) => {
                                const catA = a.room_category === "AC" ? 1 : 0;
                                const catB = b.room_category === "AC" ? 1 : 0;
                                if (catA !== catB) return catA - catB;
                                return getSharingLevel(b.sharing_display) - getSharingLevel(a.sharing_display);
                            });

                            return sortedRooms.map(room => (
                                <SelectItem
                                    key={room.id}
                                    value={room.id.toString()}
                                    className="rounded-xl px-3 py-2.5 mb-1 last:mb-0 transition-all cursor-pointer focus:bg-[#003580]/5 focus:text-gray-900 data-[state=checked]:bg-[#003580]/10 data-[state=checked]:text-[#003580]"
                                >
                                    <div className="flex items-center justify-between w-full py-0.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0",
                                                room.room_category === "AC"
                                                    ? "bg-blue-50 text-[#003580] border border-blue-100"
                                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                            )}>
                                                {room.room_category}
                                            </span>
                                            <span className="font-semibold text-sm text-gray-900">{room.sharing_display}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[#0047AB] whitespace-nowrap ml-3">
                                            ₹{Number(room.base_price).toLocaleString()}
                                            <span className="text-[10px] font-normal text-gray-400">/mo</span>
                                        </span>
                                    </div>
                                </SelectItem>
                            ));
                        })()}
                    </SelectContent>
                </Select>
            </div>

            {/* Dates & Guests */}
            <div className="px-4 py-2.5 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</span>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900">
                        <CalendarIcon size={13} className="text-[#003580]" />
                        {format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d")}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guests</span>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900">
                        <Users size={13} className="text-[#003580]" />
                        {Number(form.adults) + Number(form.children)} {(Number(form.adults) + Number(form.children)) === 1 ? 'Guest' : 'Guests'}
                    </div>
                </div>
            </div>

            {/* Price Breakdown */}
            {form.booking_type !== "visit" && (
                <div className="px-4 pb-4 pt-1.5">
                    <Separator className="bg-gray-100 mb-3" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-500">{nights} nights × ₹{nights > 0 ? Math.round(totalPrice / (nights * (Number(form.adults) || 1))).toLocaleString() : '0'}</span>
                            <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-500 flex items-center gap-1">Booking Fee <Info size={11} className="text-gray-400" /></span>
                            <span className="font-semibold text-gray-900">₹{bookingFee}</span>
                        </div>

                        <div className="h-px bg-gray-100 my-1.5" />

                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-gray-900 text-sm">Total</span>
                            <span className="text-xl sm:text-2xl font-bold text-[#0047AB] tracking-tight">₹{finalTotalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Extra Charges */}
                    {hostel.extra_charges && hostel.extra_charges.length > 0 && (
                        <>
                            <Separator className="bg-gray-100 my-3" />
                            <div className="space-y-1.5">
                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extra Charges</h5>
                                {hostel.extra_charges.map((charge, i) => (
                                    <div
                                        key={charge.id ?? i}
                                        className={`flex justify-between items-start py-1 ${i !== hostel.extra_charges!.length - 1 ? "border-b border-gray-50" : ""
                                            }`}
                                    >
                                        <div className="min-w-0 flex-1 mr-3">
                                            <span className="text-xs text-gray-600 capitalize">
                                                {charge.charge_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                                            ₹{Number(charge.amount).toLocaleString()}
                                            <span className="text-[10px] font-medium text-gray-400">/mo</span>
                                        </span>
                                    </div>
                                ))}
                                <p className="text-[10px] text-gray-400 font-medium leading-snug">
                                    Billed separately by the hostel.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Trust Signal */}
            <div className="mx-4 mb-4 p-3 bg-gray-50/80 rounded-xl flex gap-2.5 items-start border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#003580]/10 flex items-center justify-center flex-shrink-0">
                    <Headphones size={16} className="text-[#003580]" />
                </div>
                <div>
                    <p className="font-bold text-xs text-gray-900">24/7 Digital Concierge</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Our support team is always available to help with your stay requirements.</p>
                </div>
            </div>
        </div>
    );
}
