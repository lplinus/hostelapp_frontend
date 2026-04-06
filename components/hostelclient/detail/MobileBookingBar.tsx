"use client";

import { useState } from "react";
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
            <AnimatePresence>
                {isExpanded && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-medium text-gray-900 tracking-tight">Booking Details</h3>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <ChevronDown size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Dates Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar size={14} className="text-[#312E81]" />
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Check-in</span>
                                        </div>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="text-sm font-medium text-gray-900 bg-transparent w-full focus:outline-none"
                                        />
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar size={14} className="text-indigo-600" />
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Check-out</span>
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
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#312E81] flex items-center justify-center">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">Guests</p>
                                            <p className="text-sm font-medium text-gray-900">{guests} Guest{guests > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <button
                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-90"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-medium text-gray-900 min-w-[20px] text-center">{guests}</span>
                                        <button
                                            onClick={() => setGuests(Math.min(10, guests + 1))}
                                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-90"
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

            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-5 shadow-[0_-20px_50px_rgba(0,0,0,0.12)] flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    <div className="flex flex-col gap-1">
                        {showDiscount && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through font-medium">₹{Math.round(totalOriginalPrice).toLocaleString()}</span>
                                <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <TrendingDown size={10} />
                                    {Math.round(Number(hostel.discount_percentage))}%
                                </span>
                            </div>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-medium text-gray-900 tracking-tight">
                                ₹{Math.round(totalPrice).toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-[10px] font-medium uppercase tracking-widest ml-1">
                                {nights} {nights === 1 ? 'Night' : 'Nights'} Total
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            <span className="text-[14px]">{(hostel.rating_avg || 5).toFixed(1)}</span>
                            <div className="flex items-center text-yellow-500">
                                {"★".repeat(Math.round(hostel.rating_avg || 5))}
                            </div>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-[10px] font-medium text-[#312E81] uppercase tracking-widest mt-2 group"
                    >
                        <span className="whitespace-nowrap">
                            {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-indigo-300" />
                        <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
                        {isExpanded ? (
                            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform ml-1" />
                        ) : (
                            <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform ml-1" />
                        )}
                    </button>
                </div>

                <Button
                    asChild
                    size="lg"
                    className="bg-[#312E81] hover:bg-[#1E1B4B] text-white font-medium px-10 h-14 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 text-[1.05rem] flex-shrink-0 border-none"
                >
                    <Link href={`/hostels/${hostel.slug}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&priceMode=${priceMode}`}>
                        Reserve
                    </Link>
                </Button>
            </div>
        </div>
    );
}
