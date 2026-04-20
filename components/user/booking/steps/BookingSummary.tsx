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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Hostel Image Header */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
                {hostel.images?.[0]?.image ? (
                    <img
                        src={hostel.images[0].image}
                        alt={hostel.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        No Image
                    </div>
                )}
                {/* Badge overlay */}
                <div className="absolute top-3 right-3">
                    <Badge className="bg-[#10B981] text-white border-none text-[10px] font-bold px-2.5 py-1 shadow-md">
                        <Zap size={10} className="mr-1" />
                        Instant confirmation
                    </Badge>
                </div>
            </div>

            {/* Hostel Info */}
            <div className="p-5 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{hostel.name}</h4>
                {selectedRoom && (
                    <p className="text-sm text-gray-500 font-medium">{selectedRoom.category_display} • {selectedRoom.sharing_display}</p>
                )}
                {/* <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                    <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">
                        Free cancellation before check-in
                    </span>
                </div> */}
            </div>

            {/* Room Selector */}
            <div className="px-5 pt-4 pb-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Selected Room Type</Label>
                <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId} disabled={isConfirmed}>
                    <SelectTrigger className={cn(
                        "w-full h-auto py-2.5 px-3 rounded-xl border-gray-200 bg-gray-50 hover:bg-white transition-all focus:ring-2 focus:ring-[#312E81]/20 text-sm",
                        isConfirmed && "opacity-80 bg-gray-100 cursor-not-allowed"
                    )}>
                        <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-xl border-gray-100 shadow-xl bg-white p-1">
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
                                    className="rounded-lg focus:bg-[#312E81] focus:text-white group px-3 py-2.5 mb-0.5 last:mb-0 transition-colors cursor-pointer"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm">{room.category_display}</span>
                                        <span className="text-[11px] font-medium opacity-80 group-focus:text-indigo-50 text-gray-500">
                                            ₹{room.base_price}/month • {room.sharing_display}
                                        </span>
                                    </div>
                                </SelectItem>
                            ));
                        })()}
                    </SelectContent>
                </Select>
            </div>

            {/* Dates & Guests */}
            <div className="px-5 py-3 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <CalendarIcon size={13} className="text-[#312E81]" />
                        {format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d")}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guests</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <Users size={13} className="text-[#312E81]" />
                        {Number(form.adults) + Number(form.children)} {(Number(form.adults) + Number(form.children)) === 1 ? 'Guest' : 'Guests'}
                    </div>
                </div>
            </div>

            {/* Price Breakdown */}
            {form.booking_type !== "visit" && (
                <div className="px-5 pb-5 pt-2">
                    <Separator className="bg-gray-100 mb-4" />

                    <div className="space-y-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{nights} nights × ₹{nights > 0 ? Math.round(totalPrice / (nights * (Number(form.adults) || 1))).toLocaleString() : '0'}</span>
                            <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">Booking Fee <Info size={11} className="text-gray-400" /></span>
                            <span className="font-semibold text-gray-900">₹{bookingFee}</span>
                        </div>

                        <div className="h-px bg-gray-100 my-2" />

                        <div className="flex justify-between items-baseline">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-black text-[#312E81]">₹{finalTotalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Extra Charges */}
                    {hostel.extra_charges && hostel.extra_charges.length > 0 && (
                        <>
                            <Separator className="bg-gray-100 my-4" />
                            <div className="space-y-2">
                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extra Charges</h5>
                                {hostel.extra_charges.map((charge, i) => (
                                    <div
                                        key={charge.id ?? i}
                                        className={`flex justify-between items-start py-1.5 ${
                                            i !== hostel.extra_charges!.length - 1 ? "border-b border-gray-50" : ""
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 mr-3">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {charge.charge_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap tabular-nums">
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
            <div className="mx-5 mb-5 p-4 bg-gray-50 rounded-xl flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-[#312E81]/10 flex items-center justify-center flex-shrink-0">
                    <Headphones size={18} className="text-[#312E81]" />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900">24/7 Digital Concierge</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Our support team is always available to help with your stay requirements.</p>
                </div>
            </div>
        </div>
    );
}
