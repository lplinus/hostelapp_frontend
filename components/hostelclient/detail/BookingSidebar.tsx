"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Phone, Users, ShieldCheck, CheckCircle2, TrendingDown } from "lucide-react";
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

    return (
        <div className="lg:self-start lg:sticky lg:top-24 hidden lg:block z-10 w-full max-w-[380px] ml-auto">
            <div className="border border-gray-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/80 backdrop-blur-xl transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                {/* Price Display */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="min-h-[60px]">
                            {priceMode === "monthly" ? (
                                hostel.is_discounted && hostel.discounted_price ? (
                                    <>
                                        <div className="inline-flex items-center gap-2 mb-1">
                                            <span className="text-sm text-gray-400 line-through font-medium">₹{Number(hostel.price).toLocaleString()}</span>
                                            <span className="text-[10px] font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <TrendingDown size={10} />
                                                {Math.round(Number(hostel.discount_percentage))}% OFF
                                            </span>
                                        </div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-4xl font-medium text-gray-900 tracking-tight">₹{Number(hostel.discounted_price).toLocaleString()}</span>
                                            <span className="text-gray-500 font-medium mb-1.5"> / month</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-end gap-1 mt-3">
                                        <span className="text-4xl font-medium text-gray-900 tracking-tight">₹{Number(hostel.price).toLocaleString()}</span>
                                        <span className="text-gray-500 font-medium mb-1.5"> / month</span>
                                    </div>
                                )
                            ) : (
                                hostel.is_discounted && hostel.discounted_price_per_day ? (
                                    <>
                                        <div className="inline-flex items-center gap-2 mb-1">
                                            <span className="text-sm text-gray-400 line-through font-medium">₹{Number(hostel.price_per_day).toLocaleString()}</span>
                                            <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <TrendingDown size={10} />
                                                {Math.round(Number(hostel.discount_percentage))}% OFF
                                            </span>
                                        </div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-4xl font-medium text-gray-900 tracking-tight">₹{Number(hostel.discounted_price_per_day).toLocaleString()}</span>
                                            <span className="text-gray-500 font-medium mb-1.5"> / day</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-end gap-1 mt-3">
                                        <span className="text-4xl font-medium text-gray-900 tracking-tight">₹{Number(hostel.price_per_day || 0).toLocaleString()}</span>
                                        <span className="text-gray-500 font-medium mb-1.5"> / day</span>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Price Mode Toggle */}
                        <div className="inline-flex p-1 bg-gray-100/80 rounded-xl backdrop-blur-sm border border-gray-200">
                            {(["monthly", "daily"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setPriceMode(mode)}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${priceMode === mode ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    {mode.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Dates/Guests selection */}
                <div className="border border-gray-300 rounded-2xl overflow-hidden mb-5 bg-white">
                    <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="p-3 border-r border-gray-300 hover:bg-gray-50 transition-colors relative">
                            <span className="block text-[10px] font-medium text-gray-800 uppercase tracking-wider mb-0.5">Check-in</span>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="text-sm font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none"
                            />
                        </div>
                        <div className="p-3 hover:bg-gray-50 transition-colors relative">
                            <span className="block text-[10px] font-medium text-gray-800 uppercase tracking-wider mb-0.5">Check-out</span>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                min={checkIn}
                                className="text-sm font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none"
                            />
                        </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <div className="flex-1">
                            <span className="block text-[10px] font-medium text-gray-800 uppercase tracking-wider mb-0.5">Guests</span>
                            <div className="flex items-center gap-4 mt-1">
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setGuests(Math.max(1, guests - 1)); }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-600 hover:text-gray-900"
                                >
                                    -
                                </button>
                                <span className="text-sm font-bold text-gray-900 min-w-[1rem] text-center">{guests}</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setGuests(Math.min(10, guests + 1)); }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors text-gray-600 hover:text-gray-900"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <Users size={16} className="text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <Button
                    asChild
                    size="lg"
                    className="w-full bg-[#312E81] hover:bg-[#1E1B4B] text-white font-medium h-14 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 mb-4 shadow-[0_8px_20px_rgba(49,46,129,0.2)] active:scale-[0.98] border-none text-[1.05rem]"
                >
                    <Link href={`/hostels/${hostel.slug}/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&priceMode=${priceMode}`}>
                        <Phone size={18} />
                        Book Now
                    </Link>
                </Button>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 font-medium bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={16} className="text-[#10B981]" />
                        <span>Free cancellation available</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 font-medium bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                        <ShieldCheck size={16} className="text-[#312E81]" />
                        <span>Instant confirmation</span>
                    </div>
                </div>

                <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 font-semibold text-gray-400">OR REQUEST CALLBACK</span>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                    <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all placeholder:text-gray-400 font-medium"
                    />
                    <Button
                        type="submit"
                        disabled={formSending}
                        variant="outline"
                        className="w-full h-12 border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl transition-all duration-200 text-[14px] active:scale-[0.98] shadow-sm hover:border-gray-900"
                    >
                        {formSending ? "Sending..." : formSent ? "✓ Request Sent!" : "Send Request"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
