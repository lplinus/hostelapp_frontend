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
        <div className="bg-[#E5DFD4] rounded-xl border border-[#D2CABC] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Hostel Info Header */}
            <div className="p-4 sm:p-5 border-b border-[#D2CABC] bg-[#DBD5C8]/40">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#686259]">
                        Reservation Summary
                    </span>
                    {isConfirmed ? (
                        <Badge className="bg-[#DBD5C8] text-[#1A1916] border border-[#D2CABC] text-[10px] font-bold px-2.5 py-0.5 shadow-none">
                            <CheckCircle2 size={10} className="mr-1 text-[#1A1916]" />
                            Confirmed Booking
                        </Badge>
                    ) : (
                        <Badge className="bg-[#DBD5C8] hover:bg-[#D2CABC] text-[#1A1916] border border-[#D2CABC] text-[10px] font-bold px-2.5 py-0.5 shadow-none">
                            <Zap size={10} className="mr-1 text-[#1A1916]" />
                            Instant confirmation
                        </Badge>
                    )}
                </div>
                <h4 className="font-semibold text-[#1A1916] text-base sm:text-[17px] leading-snug tracking-tight mb-1">{hostel.name}</h4>
                <p className="text-xs text-[#686259] font-medium">
                    {hostel.city?.name ? `${hostel.city.name}` : ""}
                    {selectedRoom && ` • ${selectedRoom.category_display} (${selectedRoom.sharing_display})`}
                </p>
            </div>

            {/* Room Selector */}
            <div className="px-4 pt-3 pb-1.5">
                <Label className="text-[10px] font-bold text-[#686259] uppercase tracking-wider mb-1.5 block">Selected Room Type</Label>
                <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId} disabled={isConfirmed}>
                    <SelectTrigger className={cn(
                        "w-full h-11 px-3 rounded-lg border border-[#D2CABC] bg-[#EDE8DF] hover:bg-[#E5DFD4] hover:border-[#1F1E1B]/40 transition-all focus:ring-2 focus:ring-[#1F1E1B]/15 focus:border-[#1F1E1B] text-sm text-[#1A1916]",
                        isConfirmed && "opacity-80 bg-[#DBD5C8] cursor-not-allowed"
                    )}>
                        <div className="flex items-center justify-between w-full pr-1 text-left">
                            {(() => {
                                const currentRoom = selectedRoom || hostel.room_types?.find(r => r.id.toString() === selectedRoomId);
                                if (!currentRoom) return <span className="text-[#7A746B] font-normal">Choose room sharing & type</span>;
                                return (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={cn(
                                            "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0",
                                            currentRoom.room_category === "AC"
                                                ? "bg-[#DBD5C8] text-[#1A1916] border border-[#D2CABC]"
                                                : "bg-[#DBD5C8]/70 text-[#1A1916] border border-[#D2CABC]"
                                        )}>
                                            {currentRoom.room_category || "Standard"}
                                        </span>
                                        <span className="font-semibold text-[#1A1916] text-sm truncate">
                                            {currentRoom.sharing_display}
                                        </span>
                                        <span className="text-xs text-[#686259] font-medium whitespace-nowrap">
                                            • ₹{Number(currentRoom.base_price).toLocaleString()}/mo
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-xl border border-[#D2CABC] shadow-2xl bg-[#E5DFD4] p-1.5 z-[9999]">
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
                                    className="rounded-lg px-3 py-2.5 mb-1 last:mb-0 transition-all cursor-pointer text-[#1A1916] focus:bg-[#DBD5C8] focus:text-[#1A1916] data-[state=checked]:bg-[#DBD5C8] data-[state=checked]:text-[#1A1916]"
                                >
                                    <div className="flex items-center justify-between w-full py-0.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0",
                                                room.room_category === "AC"
                                                    ? "bg-[#DBD5C8] text-[#1A1916] border border-[#D2CABC]"
                                                    : "bg-[#DBD5C8]/70 text-[#1A1916] border border-[#D2CABC]"
                                            )}>
                                                {room.room_category}
                                            </span>
                                            <span className="font-semibold text-sm text-[#1A1916]">{room.sharing_display}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[#1A1916] whitespace-nowrap ml-3">
                                            ₹{Number(room.base_price).toLocaleString()}
                                            <span className="text-[10px] font-normal text-[#686259]">/mo</span>
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
                    <span className="text-[10px] font-bold text-[#686259] uppercase tracking-widest">Dates</span>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1916]">
                        <CalendarIcon size={13} className="text-[#1F1E1B]" />
                        {format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d")}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#686259] uppercase tracking-widest">Guests</span>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1916]">
                        <Users size={13} className="text-[#1F1E1B]" />
                        {Number(form.adults) + Number(form.children)} {(Number(form.adults) + Number(form.children)) === 1 ? 'Guest' : 'Guests'}
                    </div>
                </div>
            </div>

            {/* Price Breakdown */}
            {form.booking_type !== "visit" && (
                <div className="px-4 pb-4 pt-1.5">
                    <Separator className="bg-[#D2CABC] mb-3" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-[#686259]">{nights} nights × ₹{nights > 0 ? Math.round(totalPrice / (nights * (Number(form.adults) || 1))).toLocaleString() : '0'}</span>
                            <span className="font-semibold text-[#1A1916]">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-[#686259] flex items-center gap-1">Booking Fee <Info size={11} className="text-[#7A746B]" /></span>
                            <span className="font-semibold text-[#1A1916]">₹{bookingFee}</span>
                        </div>

                        <div className="h-px bg-[#D2CABC] my-1.5" />

                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-[#1A1916] text-sm">Total</span>
                            <span className="text-xl sm:text-2xl font-bold text-[#1A1916] tracking-tight">₹{finalTotalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Extra Charges */}
                    {hostel.extra_charges && hostel.extra_charges.length > 0 && (
                        <>
                            <Separator className="bg-[#D2CABC] my-3" />
                            <div className="space-y-1.5">
                                <h5 className="text-[10px] font-bold text-[#686259] uppercase tracking-widest">Extra Charges</h5>
                                {hostel.extra_charges.map((charge, i) => (
                                    <div
                                        key={charge.id ?? i}
                                        className={`flex justify-between items-start py-1 ${i !== hostel.extra_charges!.length - 1 ? "border-b border-[#D2CABC]/60" : ""
                                            }`}
                                    >
                                        <div className="min-w-0 flex-1 mr-3">
                                            <span className="text-xs text-[#686259] capitalize">
                                                {charge.charge_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-[#1A1916] whitespace-nowrap tabular-nums">
                                            ₹{Number(charge.amount).toLocaleString()}
                                            <span className="text-[10px] font-medium text-[#7A746B]">/mo</span>
                                        </span>
                                    </div>
                                ))}
                                <p className="text-[10px] text-[#7A746B] font-medium leading-snug">
                                    Billed separately by the hostel.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Trust Signal */}
            <div className="mx-4 mb-4 p-3 bg-[#DBD5C8]/50 rounded-xl flex gap-2.5 items-start border border-[#D2CABC]">
                <div className="w-8 h-8 rounded-lg bg-[#DBD5C8] flex items-center justify-center flex-shrink-0 text-[#1F1E1B]">
                    <Headphones size={16} className="text-[#1F1E1B]" />
                </div>
                <div>
                    <p className="font-bold text-xs text-[#1A1916]">24/7 Digital Concierge</p>
                    <p className="text-[10px] text-[#686259] mt-0.5 leading-relaxed">Our support team is always available to help with your stay requirements.</p>
                </div>
            </div>
        </div>
    );
}
