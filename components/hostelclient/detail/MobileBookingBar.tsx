"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Calendar, Users, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MobileBookingBarProps {
    hostel: {
        id: number;
        slug: string;
        price: string;
        price_per_day?: string | null;
        is_discounted?: boolean | null;
        discounted_price?: string | null;
        discounted_price_per_day?: string | null;
        discount_percentage?: string | null;
        rating_avg: number;
        rating_count: number;
    };
    priceMode: "monthly" | "daily";
}

export default function MobileBookingBar({ hostel, priceMode }: MobileBookingBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.contentRect.height;
                // Add a small buffer for spacing
                document.documentElement.style.setProperty('--booking-bar-height', `${height + 16}px`);
                // Dispatch event for components that prefer state over CSS variables
                window.dispatchEvent(new CustomEvent('booking-bar-resize', { 
                    detail: { height: height + 16, isExpanded } 
                }));
            }
        });

        observer.observe(containerRef.current);
        
        return () => {
            observer.disconnect();
            document.documentElement.style.setProperty('--booking-bar-height', '0px');
            window.dispatchEvent(new CustomEvent('booking-bar-resize', { 
                detail: { height: 0, isExpanded: false } 
            }));
        };
    }, [isExpanded]);

    // Booking States
    const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [guests, setGuests] = useState<number>(1);

    // 1. Determine Rate Mode based on Duration (align with booking summary)
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
    const isMonthlyStay = nights >= 30;

    // 2. Extract Base Rates (Direct values from hostel object)
    const getBaseRate = (mode: "monthly" | "daily", type: "current" | "original") => {
        if (mode === "monthly") {
            if (type === "current") return Number(hostel.is_discounted && hostel.discounted_price ? hostel.discounted_price : hostel.price);
            return Number(hostel.price);
        }
        // Daily Mode
        const originalDaily = Number(hostel.price_per_day || (Number(hostel.price) / 30));
        if (type === "original") return originalDaily;

        const discountedDaily = hostel.discounted_price_per_day
            ? Number(hostel.discounted_price_per_day)
            : (hostel.discounted_price ? (Number(hostel.discounted_price) / 30) : originalDaily);

        return Number(hostel.is_discounted ? discountedDaily : originalDaily);
    };

    // 3. Compute Final Values
    const baseRate = getBaseRate(isMonthlyStay ? "monthly" : "daily", "current");
    const originalRate = getBaseRate(isMonthlyStay ? "monthly" : "daily", "original");

    // Stay Factor: nights for daily, (nights/30) for monthly
    const stayFactor = isMonthlyStay ? (nights / 30) : nights;
    const totalPrice = baseRate * guests * stayFactor;
    const totalOriginalPrice = originalRate * guests * stayFactor;

    const showDiscount = hostel.is_discounted;

    return (
        <div ref={containerRef} className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
            <AnimatePresence>
                {isExpanded && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[-1]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white rounded-t-2xl p-6 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Dates Selection */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Calendar size={12} className="text-[#312E81]" />
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Check-in</span>
                                        </div>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="text-sm font-medium text-gray-900 bg-transparent w-full focus:outline-none"
                                        />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Calendar size={12} className="text-[#312E81]" />
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Check-out</span>
                                        </div>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            min={checkIn}
                                            className="text-sm font-medium text-gray-900 bg-transparent w-full focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Guests Selection */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[#312E81] flex items-center justify-center">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Guests</p>
                                            <p className="text-sm font-medium text-gray-900">{guests} Guest{guests > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-90"
                                        >
                                            −
                                        </button>
                                        <span className="text-base font-medium text-gray-900 min-w-[16px] text-center">{guests}</span>
                                        <button
                                            onClick={() => setGuests(Math.min(10, guests + 1))}
                                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-90"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Sticky Bottom Bar */}
            <div className="bg-white border-t border-gray-100 px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    {showDiscount && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs text-gray-400 line-through">₹{Math.round(totalOriginalPrice).toLocaleString()}</span>
                            <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <TrendingDown size={9} />
                                {Math.round(Number(hostel.discount_percentage))}%
                            </span>
                        </div>
                    )}
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            ₹{Math.round(totalPrice).toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                            total
                        </span>
                    </div>

                    {/* Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-[10px] font-medium text-[#312E81] uppercase tracking-wider mt-1 group"
                    >
                        <span>
                            {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-indigo-400" />
                        <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
                        {isExpanded ? (
                            <ChevronDown size={12} className="ml-0.5" />
                        ) : (
                            <ChevronUp size={12} className="ml-0.5" />
                        )}
                    </button>
                </div>

                <Button
                    asChild
                    size="lg"
                    className="bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold px-8 h-12 rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 text-sm flex-shrink-0 border-none"
                >
                    <Link href={`/hostels/${hostel.slug}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&priceMode=${priceMode}`}>
                        Reserve
                    </Link>
                </Button>
            </div>
        </div>
    );
}
