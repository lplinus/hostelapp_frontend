"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar as CalendarIcon, Users } from "lucide-react";
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
    setStep,
    bookingStatus
}: BookingSummaryProps) {
    const isConfirmed = bookingStatus === "confirmed";
    return (
        <Card className="border-2 border-gray-200 shadow-none overflow-hidden bg-white rounded-3xl">
            <CardHeader className="bg-transparent border-none">
                <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Hostel Mini Info */}
                <div className="p-4 flex gap-4 border-b">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                        {hostel.images?.[0]?.image ? (
                            <img
                                src={hostel.images[0].image}
                                alt={hostel.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="text-[10px] mb-1 font-bold bg-indigo-50 text-[#312E81] border-indigo-100">
                            {form.booking_type === "visit" ? "Site Visit" : "Confirmed Booking"}
                        </Badge>
                        <h4 className="font-bold text-slate-900 leading-tight line-clamp-2 mb-1">{hostel.name}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span className="font-bold text-yellow-500">★ {hostel.rating_avg || "4.5"}</span>
                            <span>({hostel.rating_count || "0"})</span>
                            <span className="text-slate-300">•</span>
                            <span className="capitalize">{hostel.hostel_type}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Room Selection in Summary */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Selected Room Type</Label>
                        <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId} disabled={isConfirmed}>
                            <SelectTrigger className={cn(
                                "w-full text-center h-auto py-3 px-4 pl-16 rounded-2xl border-slate-200 shadow-sm bg-white hover:bg-slate-50 transition-all focus:ring-2 focus:ring-[#312E81]/20 [&>span]:w-full [&>span]:text-center",
                                isConfirmed && "opacity-80 bg-slate-50 cursor-not-allowed"
                            )}>
                                <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[300px] w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-2xl border-slate-100 shadow-xl bg-white p-1">
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
                                        // Sort by category (Non-AC before AC as per user request)
                                        const catA = a.room_category === "AC" ? 1 : 0;
                                        const catB = b.room_category === "AC" ? 1 : 0;
                                        if (catA !== catB) return catA - catB;

                                        // Then by sharing level descending (4, 3, 2, 1)
                                        return getSharingLevel(b.sharing_display) - getSharingLevel(a.sharing_display);
                                    });

                                    return sortedRooms.map(room => (
                                        <SelectItem
                                            key={room.id}
                                            value={room.id.toString()}
                                            className="rounded-xl focus:bg-[#312E81] focus:text-white group px-3 py-2.5 mb-1 last:mb-0 transition-colors cursor-pointer"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-sm tracking-tight">{room.category_display}</span>
                                                <span className="text-[11px] font-medium opacity-80 group-focus:text-indigo-50 text-slate-500">
                                                    ₹{room.base_price}/month • {room.sharing_display}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ));
                                })()}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</Label>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                <CalendarIcon size={12} className="text-blue-500" />
                                {format(form.check_in, "MMM d, yyyy")} - {format(form.check_out, "MMM d, yyyy")}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guests</Label>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                <Users size={12} className="text-blue-500" />
                                {Number(form.adults) + Number(form.children)} Guests
                            </div>
                        </div>
                    </div>

                    {form.booking_type !== "visit" && (
                        <>
                            <Separator className="bg-gray-100" />
                            <div className="space-y-3">
                                <h5 className="text-[11px] font-bold text-gray-900 uppercase">Price Details</h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{nights} nights × ₹{nights > 0 ? (totalPrice / (nights * (Number(form.adults) || 1))).toLocaleString() : '0'}</span>
                                        <span className="font-medium text-gray-900">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">Service Fee <Info size={12} /></span>
                                        <span className="font-medium text-green-600 italic">Free</span>
                                    </div>
                                    <div className="pt-2 border-t flex justify-between items-center bg-indigo-50/50 -mx-4 px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">Total (INR)</span>
                                            <span className="text-[10px] text-slate-500">Incl. all taxes</span>
                                        </div>
                                        <span className="text-xl font-black text-[#312E81]">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
