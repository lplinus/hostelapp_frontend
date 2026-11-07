"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Calendar, Users, X, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { VacationRental } from "@/types/vacationrental.types";

interface VacationRentalMobileBookingBarProps {
    rental: VacationRental;
    checkInDate: string;
    setCheckInDate: (date: string) => void;
    checkOutDate: string;
    setCheckOutDate: (date: string) => void;
    guestsCount: number;
    setGuestsCount: (count: number) => void;
    numberOfNights: number;
    pricingCalculation: {
        baseRate?: number;
        staySubtotal: number;
        cleaningFee: number;
        serviceFee: number;
        discount: number;
        grandTotal: number;
    };
    onOpenBookingModal: () => void;
}

export function VacationRentalMobileBookingBar({
    rental,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    guestsCount,
    setGuestsCount,
    numberOfNights,
    pricingCalculation,
    onOpenBookingModal,
}: VacationRentalMobileBookingBarProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const formatShortDate = (isoStr: string) => {
        try {
            return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch {
            return isoStr;
        }
    };

    return (
        <div className="lg:hidden">
            {/* Slide-Up Selection & Dates Drawer */}
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
                                    <h3 className="text-sm font-bold text-slate-950">Select Dates &amp; Guests</h3>
                                    <p className="text-xs text-slate-500 font-medium">{rental.title}</p>
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
                                            <Calendar size={13} className="text-[#312E81]" />
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
                                            <Calendar size={13} className="text-[#312E81]" />
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

                                {/* Guests Selection */}
                                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#312E81] flex items-center justify-center">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Guests</p>
                                            <p className="text-xs font-bold text-slate-900">{guestsCount} Guest{guestsCount > 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                                            className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-sm font-bold text-slate-700 active:scale-95 transition-all"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm font-bold text-slate-900 min-w-[16px] text-center">{guestsCount}</span>
                                        <button
                                            type="button"
                                            onClick={() => setGuestsCount(Math.min(rental.max_guests || 20, guestsCount + 1))}
                                            className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-sm font-bold text-slate-700 active:scale-95 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Price Breakdown in Drawer */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>₹{parseFloat(rental.price_per_night || "0").toLocaleString("en-IN")} × {numberOfNights} night{numberOfNights > 1 ? "s" : ""}</span>
                                        <span className="font-semibold text-slate-900">₹{pricingCalculation.staySubtotal.toLocaleString("en-IN")}</span>
                                    </div>
                                    {pricingCalculation.discount > 0 && (
                                        <div className="flex justify-between text-[#312E81] font-semibold">
                                            <span>Extended Stay Discount</span>
                                            <span>-₹{pricingCalculation.discount.toLocaleString("en-IN")}</span>
                                        </div>
                                    )}
                                    {pricingCalculation.cleaningFee > 0 && (
                                        <div className="flex justify-between text-slate-600">
                                            <span>Cleaning Fee</span>
                                            <span className="font-semibold text-slate-900">₹{pricingCalculation.cleaningFee.toLocaleString("en-IN")}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-600">
                                        <span>Platform Service Fee (5%)</span>
                                        <span className="font-semibold text-slate-900">₹{pricingCalculation.serviceFee.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-950 text-sm">
                                        <span>Total Payable</span>
                                        <span className="text-base font-extrabold text-[#1E1B4B]">₹{pricingCalculation.grandTotal.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-[#003580] font-medium flex items-center gap-2">
                                    <ShieldCheck size={16} className="shrink-0" />
                                    <span>Instant reservation with verified stay protection.</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Static Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-5 py-3.5 flex items-center justify-between gap-3">
                {/* Left: Total Price and Selection Toggle */}
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="flex flex-col text-left group min-w-0"
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-slate-950 tracking-tight">
                            ₹{pricingCalculation.grandTotal.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            total
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#312E81]">
                        <span>
                            {formatShortDate(checkInDate)} – {formatShortDate(checkOutDate)} • {guestsCount} Guest{guestsCount > 1 ? "s" : ""}
                        </span>
                        {isDrawerOpen ? (
                            <ChevronDown size={13} className="shrink-0" />
                        ) : (
                            <ChevronUp size={13} className="shrink-0" />
                        )}
                    </div>
                </button>

                {/* Right: Reserve Button */}
                <Button
                    type="button"
                    onClick={onOpenBookingModal}
                    className="bg-[#312E81] hover:bg-[#1E1B4B] text-white font-bold text-sm h-12 px-6 rounded-xl shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                >
                    <Zap size={15} className="fill-current text-amber-300" />
                    <span>Reserve</span>
                </Button>
            </div>
        </div>
    );
}
