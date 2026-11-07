"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Check, ShieldCheck, X, Sparkles, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HostelDetail } from "@/types/hostel.types";
import type { Step } from "../booking-container";

interface BookingMobileBottomBarProps {
    hostel: HostelDetail;
    selectedRoom: any;
    selectedRoomId: string | null;
    setSelectedRoomId: (id: string | null) => void;
    form: any;
    setForm?: (form: any) => void;
    nights: number;
    totalPrice: number;
    bookingFee: number;
    finalTotalPrice: number;
    step: Step;
    setStep: (s: Step) => void;
    bookingStatus: "pending" | "confirmed";
    handleNext: () => void;
    handleConfirmPayment: () => void;
    isProcessingPayment: boolean;
    paymentMethod: "online" | "on_arrival";
}

export function BookingMobileBottomBar({
    hostel,
    selectedRoom,
    selectedRoomId,
    setSelectedRoomId,
    form,
    setForm,
    nights,
    totalPrice,
    bookingFee,
    finalTotalPrice,
    step,
    setStep,
    bookingStatus,
    handleNext,
    handleConfirmPayment,
    isProcessingPayment,
    paymentMethod,
}: BookingMobileBottomBarProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isConfirmed = bookingStatus === "confirmed";

    // Don't show bottom bar if booking is fully confirmed or on confirmation step
    if (isConfirmed || step === "confirmation") {
        return null;
    }

    return (
        <div className="lg:hidden">
            {/* Slide-Up Summary Drawer (Accessible from Bottom Bar) */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[90]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 260 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[100] max-h-[85vh] flex flex-col overflow-hidden border-t border-gray-100"
                        >
                            {/* Drawer Header */}
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            Booking Summary
                                        </span>
                                        <Badge className="bg-[#003580]/10 text-[#003580] border-[#003580]/20 text-[10px] font-bold px-2 py-0">
                                            {hostel.name}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-800">
                                        {nights} Night{nights > 1 ? "s" : ""} Stay • {form.adults || 1} Guest{Number(form.adults || 1) > 1 ? "s" : ""}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Scrollable Summary Content */}
                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                {/* Booking Dates Selection */}
                                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={12} className="text-[#003580]" />
                                            Check-In Date
                                        </label>
                                        <input
                                            type="date"
                                            value={format(form.check_in, "yyyy-MM-dd")}
                                            onChange={(e) => setForm && setForm({ ...form, check_in: parseISO(e.target.value) })}
                                            min={format(new Date(), "yyyy-MM-dd")}
                                            disabled={isConfirmed || !setForm}
                                            className="w-full text-xs font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003580]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={12} className="text-[#003580]" />
                                            Check-Out Date
                                        </label>
                                        <input
                                            type="date"
                                            value={format(form.check_out, "yyyy-MM-dd")}
                                            onChange={(e) => setForm && setForm({ ...form, check_out: parseISO(e.target.value) })}
                                            min={format(addDays(form.check_in, 1), "yyyy-MM-dd")}
                                            disabled={isConfirmed || !setForm}
                                            className="w-full text-xs font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003580]"
                                        />
                                    </div>
                                </div>

                                {/* Room Selection */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Selected Room Category
                                    </Label>
                                    <Select
                                        value={selectedRoomId || ""}
                                        onValueChange={setSelectedRoomId}
                                        disabled={isConfirmed}
                                    >
                                        <SelectTrigger className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm">
                                            {(() => {
                                                const currentRoom = selectedRoom || hostel.room_types?.find(r => r.id.toString() === selectedRoomId);
                                                if (!currentRoom) return <span className="text-gray-400">Choose room</span>;
                                                return (
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 text-[10px] font-bold rounded uppercase shrink-0",
                                                            currentRoom.room_category === "AC"
                                                                ? "bg-blue-50 text-[#003580] border border-blue-100"
                                                                : "bg-slate-100 text-slate-700 border border-slate-200"
                                                        )}>
                                                            {currentRoom.room_category || "Standard"}
                                                        </span>
                                                        <span className="font-semibold text-gray-900 truncate">
                                                            {currentRoom.sharing_display}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostel.room_types?.map((room) => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    {room.category_display} - {room.sharing_display} (₹{Number(room.base_price).toLocaleString()}/mo)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Price Breakdown */}
                                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Base Price</span>
                                        <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Booking &amp; Service Fee</span>
                                        <span className="font-semibold text-gray-900">₹{bookingFee.toLocaleString()}</span>
                                    </div>
                                    {hostel.extra_charges && hostel.extra_charges.length > 0 && (
                                        <>
                                            {hostel.extra_charges.map((charge, i) => (
                                                <div key={charge.id ?? i} className="flex justify-between text-gray-600">
                                                    <span className="capitalize">{charge.charge_type.replace('_', ' ')}</span>
                                                    <span className="font-semibold text-gray-900">₹{Number(charge.amount).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-bold text-gray-900 text-sm">
                                        <span>Total Amount</span>
                                        <span className="text-base text-[#003580] font-extrabold">₹{finalTotalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-[#003580] font-medium flex items-center gap-2">
                                    <ShieldCheck size={16} className="shrink-0" />
                                    <span>Free cancellation up to 24 hours prior to check-in.</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Static / Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between gap-3">
                {/* Left: Price and Summary Toggle */}
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="flex flex-col text-left group min-w-0"
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                            ₹{finalTotalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            total
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#003580]">
                        <span className="truncate max-w-[150px]">
                            {selectedRoom?.sharing_display || "View breakdown"}
                        </span>
                        {isDrawerOpen ? (
                            <ChevronDown size={14} className="shrink-0" />
                        ) : (
                            <ChevronUp size={14} className="shrink-0" />
                        )}
                    </div>
                </button>

                {/* Right: Primary Step Action Button */}
                <div className="shrink-0">
                    {step === "details" && (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="bg-[#003580] hover:bg-[#002244] text-white font-bold text-sm h-12 px-5 sm:px-6 rounded-xl shadow-md active:scale-95 transition-all"
                        >
                            {form.booking_type === "visit" ? "Request Visit" : "Continue to Pay"}
                        </Button>
                    )}

                    {step === "payment" && (
                        <Button
                            type="button"
                            onClick={handleConfirmPayment}
                            disabled={isProcessingPayment}
                            className="bg-[#003580] hover:bg-[#002244] text-white font-bold text-sm h-12 px-5 sm:px-6 rounded-xl shadow-md active:scale-95 transition-all"
                        >
                            {isProcessingPayment ? (
                                "Processing..."
                            ) : (
                                paymentMethod === "on_arrival" ? "Confirm Booking" : `Pay ₹${finalTotalPrice.toLocaleString()}`
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
