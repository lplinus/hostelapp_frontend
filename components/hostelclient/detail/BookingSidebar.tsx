"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Phone, Users, CheckCircle2, ShieldCheck, TrendingDown, Clock, Truck } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessage } from "@/services/public.service";
import { Button } from "@/components/ui/button";

interface BookingSidebarProps {
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
    setPriceMode: (mode: "monthly" | "daily") => void;
}

export default function BookingSidebar({
    hostel,
    priceMode,
    setPriceMode,
}: BookingSidebarProps) {
    const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
    const [formSending, setFormSending] = useState(false);
    const [formSent, setFormSent] = useState(false);

    // Date and Guest State
    const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [guests, setGuests] = useState<number>(1);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormSending(true);
        try {
            await sendContactMessage({
                name: formData.name,
                phone: formData.phone,
                message: formData.message || "Requesting callback from hostel page",
                hostel: hostel.id,
            });
            setFormSent(true);
            setFormData({ name: "", phone: "", message: "" });
            setTimeout(() => setFormSent(false), 3000);
        } catch (error) {
            console.error("Failed to send callback request:", error);
            toast.error("Failed to send request. Please try again.");
        } finally {
            setFormSending(false);
        }
    };

    // Compute total
    const getDisplayPrice = () => {
        if (priceMode === "monthly") {
            if (hostel.is_discounted && hostel.discounted_price) return Number(hostel.discounted_price);
            return Number(hostel.price);
        }
        if (hostel.is_discounted && hostel.discounted_price_per_day) return Number(hostel.discounted_price_per_day);
        if (hostel.price_per_day) return Number(hostel.price_per_day);
        return Math.round(Number(hostel.price) / 30);
    };

    const currentPrice = getDisplayPrice();
    const originalPrice = priceMode === "monthly" ? Number(hostel.price) : Math.round(Number(hostel.price) / 30);
    const showDiscount = hostel.is_discounted && currentPrice < originalPrice;

    return (
        <div className="lg:self-start lg:sticky lg:top-24 hidden lg:block z-10 w-full max-w-[380px] ml-auto">
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                {/* Price Display */}
                <div className="p-6 pb-5">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                            ₹{currentPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">
                            /{priceMode === "monthly" ? "month" : "day"}
                        </span>
                    </div>

                    {showDiscount && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                            <span className="text-[11px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded flex items-center gap-1">
                                <TrendingDown size={10} />
                                {Math.round(Number(hostel.discount_percentage))}% OFF
                            </span>
                        </div>
                    )}

                    {/* Price Mode Toggle */}
                    <div className="flex mt-3 bg-gray-100 rounded-lg p-0.5 w-fit">
                        {(["monthly", "daily"] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setPriceMode(mode)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                    priceMode === mode
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {mode === "monthly" ? "MONTHLY" : "DAILY"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interactive Dates/Guests selection */}
                <div className="border-t border-gray-200">
                    <div className="grid grid-cols-2 border-b border-gray-200">
                        <div className="p-3.5 border-r border-gray-200 hover:bg-gray-50/50 transition-colors">
                            <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Check-in</span>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="text-sm font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none"
                            />
                        </div>
                        <div className="p-3.5 hover:bg-gray-50/50 transition-colors">
                            <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">End date</span>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                min={checkIn}
                                className="text-sm font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none"
                            />
                        </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div>
                            <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Guests</span>
                            <span className="text-sm font-medium text-gray-900">{guests} Guest{guests > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setGuests(Math.max(1, guests - 1)); }}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-600 hover:text-gray-900 text-sm"
                            >
                                −
                            </button>
                            <span className="text-sm font-medium text-gray-900 min-w-[1rem] text-center">{guests}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setGuests(Math.min(10, guests + 1)); }}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-600 hover:text-gray-900 text-sm"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="p-5 pt-4">
                    <Button
                        asChild
                        size="lg"
                        className="w-full bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold h-12 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] border-none text-[15px]"
                    >
                        <Link href={`/hostels/${hostel.slug}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&priceMode=${priceMode}`}>
                            Reserve Now
                        </Link>
                    </Button>

                    {/* Trust Signals */}
                    <div className="mt-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-[13px] text-gray-500">
                            <CheckCircle2 size={15} className="text-[#312E81] flex-shrink-0" />
                            <span>Free cancellation for 48 hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-500">
                            <Truck size={15} className="text-[#312E81] flex-shrink-0" />
                            <span>Flexible move-in dates available</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-500">
                            <ShieldCheck size={15} className="text-[#312E81] flex-shrink-0" />
                            <span>Verified host protection included</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Total after taxes</span>
                        <span className="text-base font-bold text-gray-900">₹{(currentPrice * guests).toLocaleString()}</span>
                    </div>
                </div>

                {/* Callback Section */}
                <div className="p-5 pt-0">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 font-medium text-gray-400 uppercase tracking-wider">or request callback</span>
                        </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-2.5">
                        <input
                            type="text"
                            placeholder="Your Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]/20 focus:border-[#312E81] transition-all placeholder:text-gray-400"
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]/20 focus:border-[#312E81] transition-all placeholder:text-gray-400"
                        />
                        <Button
                            type="submit"
                            disabled={formSending}
                            variant="outline"
                            className="w-full h-10 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all text-sm active:scale-[0.98]"
                        >
                            {formSending ? "Sending..." : formSent ? "✓ Sent!" : "Send Request"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
