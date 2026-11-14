"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Calendar, Users, X, ShieldCheck, Building2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Hotel, HotelRoomType } from "@/types/hotel.types";

interface HotelMobileBookingBarProps {
    hotel: Hotel;
    selectedRoom: HotelRoomType | null;
    setSelectedRoom: (room: HotelRoomType) => void;
    checkInDate: string;
    setCheckInDate: (date: string) => void;
    checkOutDate: string;
    setCheckOutDate: (date: string) => void;
    numberOfNights: number;
    totalAmount: number;
    onOpenBookingModal: () => void;
    isCheckingAvailability?: boolean;
}

export function HotelMobileBookingBar({
    hotel,
    selectedRoom,
    setSelectedRoom,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    numberOfNights,
    totalAmount,
    onOpenBookingModal,
    isCheckingAvailability = false,
}: HotelMobileBookingBarProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const roomTypes = hotel.room_types || [];

    return (
        <div className="lg:hidden">
            {/* Slide-Up Selection Drawer */}
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
                            className="fixed bottom-0 left-0 right-0 bg-[#E5DFD4] rounded-t-3xl shadow-2xl z-[100] max-h-[85vh] flex flex-col overflow-hidden border-t border-[#D2CABC]"
                        >
                            {/* Drawer Header */}
                            <div className="px-5 py-4 border-b border-[#D2CABC] flex items-center justify-between bg-[#DBD5C8]/40 shrink-0">
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1916]">Select Dates &amp; Suite</h3>
                                    <p className="text-xs text-[#686259] font-medium">{hotel.name}</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-8 h-8 rounded-full bg-[#DBD5C8] hover:bg-[#D2CABC] flex items-center justify-center text-[#1A1916] transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                {/* Date Inputs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#EDE8DF] rounded-xl p-3 border border-[#D2CABC]">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Calendar size={13} className="text-[#1F1E1B]" />
                                            <span className="text-[10px] font-semibold text-[#686259] uppercase tracking-wider">Check-in</span>
                                        </div>
                                        <input
                                            type="date"
                                            value={checkInDate}
                                            onChange={(e) => {
                                                const newIn = e.target.value;
                                                if (!newIn) return;
                                                setCheckInDate(newIn);
                                                if (newIn && checkOutDate && newIn >= checkOutDate) {
                                                    const next = new Date(newIn);
                                                    next.setDate(next.getDate() + 1);
                                                    setCheckOutDate(next.toISOString().split("T")[0]);
                                                }
                                            }}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="text-xs font-semibold text-[#1A1916] bg-transparent w-full focus:outline-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="bg-[#EDE8DF] rounded-xl p-3 border border-[#D2CABC]">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Calendar size={13} className="text-[#1F1E1B]" />
                                            <span className="text-[10px] font-semibold text-[#686259] uppercase tracking-wider">Check-out</span>
                                        </div>
                                        <input
                                            type="date"
                                            value={checkOutDate}
                                            onChange={(e) => setCheckOutDate(e.target.value)}
                                            min={checkInDate}
                                            className="text-xs font-semibold text-[#1A1916] bg-transparent w-full focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Room Selection */}
                                {roomTypes.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold text-[#686259] uppercase tracking-wider block">
                                            Select Suite Type
                                        </label>
                                        <div className="space-y-2">
                                            {roomTypes.map((room) => {
                                                const isSelected = selectedRoom?.id === room.id;
                                                return (
                                                    <div
                                                        key={room.id}
                                                        onClick={() => setSelectedRoom(room)}
                                                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                                            isSelected
                                                                ? "border-[#1F1E1B] bg-[#DBD5C8]"
                                                                : "border-[#D2CABC] bg-[#EDE8DF] hover:bg-[#DBD5C8]/40"
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-xs font-bold text-[#1A1916]">{room.name}</p>
                                                                {(room.is_available && (room.rooms_available === undefined || room.rooms_available > 0)) ? (
                                                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#1A1916] bg-[#DBD5C8] px-1.5 py-0.2 rounded-md border border-[#D2CABC]">
                                                                        <CheckCircle2 size={10} className="text-[#1F1E1B]" />
                                                                        Available
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-200">
                                                                        <XCircle size={10} className="text-rose-600" />
                                                                        Sold Out
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-[#686259] font-medium">
                                                                Max {room.max_occupancy} Guests • {room.bed_type}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-extrabold text-[#1A1916]">
                                                            ₹{parseFloat(room.base_price_per_night || room.price_per_night || "0").toLocaleString("en-IN")}/night
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Price Breakdown in Drawer */}
                                <div className="p-3.5 bg-[#EDE8DF] rounded-xl border border-[#D2CABC] space-y-2 text-xs">
                                    <div className="flex justify-between text-[#686259]">
                                        <span>Stay ({numberOfNights} night{numberOfNights > 1 ? "s" : ""})</span>
                                        <span className="font-semibold text-[#1A1916]">
                                            ₹{(parseFloat(selectedRoom?.base_price_per_night || selectedRoom?.price_per_night || hotel.starting_price_per_night || "0") * numberOfNights).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[#686259]">
                                        <span>Taxes &amp; Service Fee (12%)</span>
                                        <span className="font-semibold text-[#1A1916]">
                                            ₹{Math.round(parseFloat(selectedRoom?.base_price_per_night || selectedRoom?.price_per_night || hotel.starting_price_per_night || "0") * numberOfNights * 0.12).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-[#D2CABC] flex justify-between items-baseline font-bold text-[#1A1916] text-sm">
                                        <span>Total Payable</span>
                                        <span className="text-base font-extrabold text-[#1A1916]">
                                            ₹{totalAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-[#DBD5C8]/50 rounded-xl border border-[#D2CABC] text-[11px] text-[#1A1916] font-medium flex items-center gap-2">
                                    <ShieldCheck size={16} className="shrink-0 text-[#1F1E1B]" />
                                    <span>Free cancellation available up to 24 hours prior to check-in.</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#EDE8DF]/98 backdrop-blur-md border-t border-[#D2CABC] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between">
                {/* Left: Total & Drawer Toggle */}
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="flex flex-col text-left focus:outline-none"
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-[#1A1916] tracking-tight">
                            ₹{totalAmount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-semibold text-[#686259] uppercase tracking-wider">
                            Total
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1F1E1B]">
                        <span className="truncate max-w-[150px]">
                            {selectedRoom?.name || `${numberOfNights} Night(s)`}
                        </span>
                        {isDrawerOpen ? (
                            <ChevronDown size={14} className="shrink-0" />
                        ) : (
                            <ChevronUp size={14} className="shrink-0" />
                        )}
                    </div>
                </button>

                {/* Right: Reserve Button */}
                <Button
                    type="button"
                    onClick={onOpenBookingModal}
                    disabled={isCheckingAvailability}
                    className="bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] font-medium text-sm h-11 px-5 rounded-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-85 tracking-normal"
                >
                    {isCheckingAvailability ? (
                        <>
                            <Loader2 size={15} className="animate-spin text-[#EDE8DF]" />
                            <span>Checking...</span>
                        </>
                    ) : (
                        <span>Check Availability</span>
                    )}
                </Button>
            </div>
        </div>
    );
}
