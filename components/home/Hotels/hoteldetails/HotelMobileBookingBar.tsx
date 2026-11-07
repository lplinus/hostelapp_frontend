"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Calendar, Users, X, ShieldCheck, Building2 } from "lucide-react";
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
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[100] max-h-[85vh] flex flex-col overflow-hidden border-t border-slate-100"
                        >
                            {/* Drawer Header */}
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-950">Select Dates &amp; Suite</h3>
                                    <p className="text-xs text-slate-500 font-medium">{hotel.name}</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                {/* Date Inputs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Calendar size={13} className="text-[#003580]" />
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Check-in</span>
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
                                            className="text-xs font-semibold text-slate-900 bg-transparent w-full focus:outline-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Calendar size={13} className="text-[#003580]" />
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Check-out</span>
                                        </div>
                                        <input
                                            type="date"
                                            value={checkOutDate}
                                            onChange={(e) => setCheckOutDate(e.target.value)}
                                            min={checkInDate}
                                            className="text-xs font-semibold text-slate-900 bg-transparent w-full focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Room Selection */}
                                {roomTypes.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
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
                                                                ? "border-[#003580] bg-blue-50/50"
                                                                : "border-slate-200 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900">{room.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-medium">
                                                                Max {room.max_occupancy} Guests • {room.bed_type}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-extrabold text-[#003580]">
                                                            ₹{parseFloat(room.base_price_per_night || room.price_per_night || "0").toLocaleString("en-IN")}/night
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Price Breakdown in Drawer */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Stay ({numberOfNights} night{numberOfNights > 1 ? "s" : ""})</span>
                                        <span className="font-semibold text-slate-900">
                                            ₹{(parseFloat(selectedRoom?.base_price_per_night || selectedRoom?.price_per_night || hotel.starting_price_per_night || "0") * numberOfNights).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Taxes &amp; Service Fee (12%)</span>
                                        <span className="font-semibold text-slate-900">
                                            ₹{Math.round(parseFloat(selectedRoom?.base_price_per_night || selectedRoom?.price_per_night || hotel.starting_price_per_night || "0") * numberOfNights * 0.12).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-950 text-sm">
                                        <span>Total Payable</span>
                                        <span className="text-base font-extrabold text-[#003580]">
                                            ₹{totalAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-[#003580] font-medium flex items-center gap-2">
                                    <ShieldCheck size={16} className="shrink-0" />
                                    <span>Free cancellation available up to 24 hours prior to check-in.</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between">
                {/* Left: Total & Drawer Toggle */}
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="flex flex-col text-left focus:outline-none"
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-slate-950 tracking-tight">
                            ₹{totalAmount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Total
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#003580]">
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
                    className="bg-[#003580] hover:bg-[#002244] text-white font-bold text-sm h-11 px-6 rounded-xl shadow-md active:scale-95 transition-all"
                >
                    Reserve Suite
                </Button>
            </div>
        </div>
    );
}
