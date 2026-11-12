"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Users, CheckCircle2, XCircle, ShieldCheck, TrendingDown, Clock, Truck, AlertCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessage } from "@/services/public.service";
import { createHostelInquiry, checkHostelAvailability } from "@/services/booking.service";
import { useAuth } from "@/hooks/useAuth";
import type { RoomType } from "@/types/hostel.types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare } from "lucide-react";

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
    roomTypes?: readonly RoomType[];
    priceMode: "monthly" | "daily";
    setPriceMode: (mode: "monthly" | "daily") => void;
    selectedRoom?: RoomType | null;
    setSelectedRoom?: (room: RoomType) => void;
    isCheckingAvailability?: boolean;
    setIsCheckingAvailability?: (val: boolean) => void;
}

export default function BookingSidebar({
    hostel,
    roomTypes,
    priceMode,
    setPriceMode,
    selectedRoom,
    setSelectedRoom,
    isCheckingAvailability: propIsChecking,
    setIsCheckingAvailability: propSetIsChecking,
}: BookingSidebarProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [localIsChecking, setLocalIsChecking] = useState(false);
    const isCheckingAvailability = propIsChecking !== undefined ? propIsChecking : localIsChecking;
    const setIsCheckingAvailability = propSetIsChecking || setLocalIsChecking;
    const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
    const [formSending, setFormSending] = useState(false);
    const [formSent, setFormSent] = useState(false);

    // Date and Guest State
    const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [guests, setGuests] = useState<number>(1);

    // Contact Owner Modal State
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [isContactSending, setIsContactSending] = useState(false);

    const handleContactSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsContactSending(true);
        try {
            await createHostelInquiry({
                hostel: hostel.id,
                guest_name: contactForm.name,
                guest_email: contactForm.email,
                mobile_number: contactForm.phone,
                message: contactForm.message,
            });
            toast.success("Inquiry sent successfully!");
            setIsContactModalOpen(false);
            setContactForm({ name: "", email: "", phone: "", message: "" });
        } catch (error) {
            console.error("Failed to send inquiry:", error);
            toast.error("Failed to send inquiry. Please try again.");
        } finally {
            setIsContactSending(false);
        }
    };

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
        // If a specific room is selected, use that room's specific price
        if (selectedRoom) {
            if (priceMode === "monthly") {
                if (selectedRoom.base_price) return Number(selectedRoom.base_price);
            } else {
                if (selectedRoom.price_per_day) return Number(selectedRoom.price_per_day);
                if (selectedRoom.base_price) return Math.round(Number(selectedRoom.base_price) / 30);
            }
        }

        // Default normal owner pricing when no room is specifically selected
        if (priceMode === "monthly") {
            if (hostel.is_discounted && hostel.discounted_price) return Number(hostel.discounted_price);
            return Number(hostel.price);
        }
        if (hostel.is_discounted && hostel.discounted_price_per_day) return Number(hostel.discounted_price_per_day);
        if (hostel.price_per_day) return Number(hostel.price_per_day);
        return Math.round(Number(hostel.price) / 30);
    };

    const currentPrice = getDisplayPrice();
    const originalPrice = selectedRoom
        ? (priceMode === "monthly" ? Number(selectedRoom.base_price || hostel.price) : Math.round(Number(selectedRoom.base_price || hostel.price) / 30))
        : (priceMode === "monthly" ? Number(hostel.price) : Math.round(Number(hostel.price) / 30));
    const showDiscount = !selectedRoom && hostel.is_discounted && currentPrice < originalPrice;

    const handleCheckAvailability = async () => {
        if (!checkIn || !checkOut) {
            toast.error("Please select valid check-in and check-out dates.");
            return;
        }

        const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
        if (nights < 1 || checkIn >= checkOut) {
            toast.error("Check-out date must be strictly after check-in date. Minimum stay is 1 night.");
            return;
        }

        setIsCheckingAvailability(true);
        const startTime = Date.now();
        const MIN_WAIT_MS = 6000;

        try {
            // Find preferred room type (prioritize selectedRoom, fallback to first available room type)
            const targetRoomType = selectedRoom || (roomTypes && roomTypes.length > 0 ? roomTypes[0] : null);

            if (targetRoomType) {
                const res = await checkHostelAvailability({
                    room_type_id: targetRoomType.id,
                    check_in: checkIn,
                    check_out: checkOut,
                    guests_count: guests,
                    guest_email: user?.email || undefined,
                    mobile_number: user?.phone || undefined,
                });

                const elapsed = Date.now() - startTime;
                if (elapsed < MIN_WAIT_MS) {
                    await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsed));
                }

                if (!res.available) {
                    toast.error(res.message || res.error || "No beds available for the selected dates. Please adjust dates or sharing type.");
                    return;
                }
                toast.success(res.message || "Beds available! Proceeding to booking...");
            } else {
                const elapsed = Date.now() - startTime;
                if (elapsed < MIN_WAIT_MS) {
                    await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsed));
                }
            }

            // Smoothly navigate to the booking checkout step
            router.push(`/hostels/${hostel.slug}/book?roomId=${targetRoomType?.id || ""}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&priceMode=${priceMode}`);
        } catch (error: any) {
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_WAIT_MS) {
                await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsed));
            }
            const errMsg =
                error?.message ||
                error?.error ||
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                "Failed to verify availability. Please try again.";
            toast.error(errMsg);
            return;
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    return (
        <div className="lg:self-start lg:sticky lg:top-[120px] hidden lg:block z-10 w-full max-w-[380px] ml-auto">
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                {/* Price Display */}
                <div className="p-6 pb-5">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-extrabold text-black tracking-tight">
                            ₹{currentPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-800 font-bold">
                            /{priceMode === "monthly" ? "month" : "day"}
                        </span>
                    </div>

                    {showDiscount && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 line-through font-medium">₹{originalPrice.toLocaleString()}</span>
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
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${priceMode === mode
                                        ? "bg-white text-black shadow-sm"
                                        : "text-gray-700 hover:text-black"
                                    }`}
                            >
                                {mode === "monthly" ? "MONTHLY" : "DAILY"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interactive Dates/Guests selection */}
                <div className="border-t border-gray-200">
                    {/* Selected Room Replication */}
                    <div className="p-3.5 border-b border-gray-200 bg-gray-50/60">
                        <div className="flex items-center justify-between mb-1">
                            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {selectedRoom ? "Selected Room" : "Room Selection"}
                            </span>
                            {selectedRoom && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedRoom?.(null as any)}
                                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                >
                                    Reset to Default
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-black">
                                {selectedRoom ? `${selectedRoom.sharing_display} (${selectedRoom.category_display})` : "Standard Room (Default Pricing)"}
                            </span>
                            {selectedRoom && (
                                selectedRoom.is_available ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <CheckCircle2 size={11} className="text-emerald-600" />
                                        Available
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                        <XCircle size={11} className="text-rose-600" />
                                        Sold Out
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-gray-200">
                        <div className="p-3.5 border-r border-gray-200 hover:bg-gray-50/50 transition-colors">
                            <span className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1">Check-in</span>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="text-sm font-bold text-black bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none"
                            />
                        </div>
                        <div className="p-3.5 hover:bg-gray-50/50 transition-colors">
                            <span className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1">End date</span>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                min={checkIn}
                                className="text-sm font-bold text-black bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer appearance-none"
                            />
                        </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div>
                            <span className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1">Guests</span>
                            <span className="text-sm font-bold text-black">{guests} Guest{guests > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setGuests(Math.max(1, guests - 1)); }}
                                className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:border-black transition-colors text-black font-bold text-sm"
                            >
                                −
                            </button>
                            <span className="text-sm font-bold text-black min-w-[1rem] text-center">{guests}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setGuests(Math.min(10, guests + 1)); }}
                                className="w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center hover:border-black transition-colors text-black font-bold text-sm"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="p-5 pt-4">
                    {/* Total Fare Above */}
                    <div className="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-black">Total after taxes</span>
                            <button
                                type="button"
                                onClick={() => setIsPolicyModalOpen(true)}
                                className="text-gray-500 hover:text-[#003580] p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                title="View policies and protection"
                            >
                                <AlertCircle size={15} />
                            </button>
                        </div>
                        <span className="text-base font-extrabold text-black">₹{(currentPrice * guests).toLocaleString()}</span>
                    </div>

                    <Button
                        type="button"
                        onClick={handleCheckAvailability}
                        disabled={isCheckingAvailability}
                        size="lg"
                        className="w-full bg-[#003580] hover:bg-[#002244] text-white font-medium text-base h-12 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] border-none cursor-pointer tracking-normal disabled:opacity-85"
                    >
                        {isCheckingAvailability ? (
                            <>
                                <Loader2 size={18} className="animate-spin text-white" />
                                <span>Checking Availability...</span>
                            </>
                        ) : (
                            <span>Check Availability</span>
                        )}
                    </Button>

                    {/* Contact Owner Button */}
                    <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="default"
                                size="lg"
                                className="w-full mt-3 bg-[#003580] hover:bg-[#002244] text-white border-none font-semibold h-12 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] text-[15px] shadow-sm"
                            >
                                <MessageSquare size={18} className="text-white" />
                                Contact Owner
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white">
                            <div className="bg-[#003580] p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                                
                                <button
                                    type="button"
                                    onClick={() => setIsContactModalOpen(false)}
                                    className="absolute top-4 right-4 z-[100] w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all focus:outline-none cursor-pointer active:scale-95"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>

                                <DialogHeader className="relative z-10 pr-8">
                                    <DialogTitle className="text-2xl font-bold tracking-tight text-white">Contact Owner</DialogTitle>
                                    <DialogDescription className="text-blue-100/80 font-medium">
                                        Send your details and the owner will get back to you shortly.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <form onSubmit={handleContactSubmit} className="p-6 space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-name" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</Label>
                                        <div className="relative">
                                            <Input
                                                id="contact-name"
                                                placeholder="Enter your name"
                                                required
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                className="h-11 pl-4 rounded-xl border border-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</Label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                placeholder="your@email.com"
                                                required
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                className="h-11 px-4 rounded-xl border border-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</Label>
                                            <Input
                                                id="contact-phone"
                                                type="tel"
                                                placeholder="Mobile Number"
                                                required
                                                value={contactForm.phone}
                                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                                className="h-11 px-4 rounded-xl border border-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact-message" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message (Optional)</Label>
                                        <Textarea
                                            id="contact-message"
                                            placeholder="Tell the owner what you're looking for..."
                                            value={contactForm.message}
                                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                            className="min-h-[100px] rounded-xl border border-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all resize-none font-medium p-4"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isContactSending}
                                    className="w-full h-12 bg-[#003580] hover:bg-[#002244] text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                                >
                                    {isContactSending ? "Sending Inquiry..." : "Submit Inquiry"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Policies Popup with Exclamatory Symbol */}
                    <Dialog open={isPolicyModalOpen} onOpenChange={setIsPolicyModalOpen}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="w-full mt-3.5 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-[#003580] transition-colors py-1 cursor-pointer group"
                            >
                                <AlertCircle size={14} className="text-[#003580] group-hover:scale-110 transition-transform" />
                                <span className="underline underline-offset-2">Free cancellation & booking policies</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <AlertCircle size={20} className="text-[#003580]" />
                                    Booking & Policy Details
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 pt-1">
                                    Protection and benefits included with your stay.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                                    <CheckCircle2 size={18} className="text-[#003580] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Free cancellation for 48 hours</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Cancel for free within 48 hours of booking.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                                    <Truck size={18} className="text-[#003580] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Flexible move-in dates available</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Coordinate with the hostel owner if your arrival schedule shifts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                                    <ShieldCheck size={18} className="text-[#003580] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Verified host protection included</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Every hostel is physically verified for safety and quality assurance.</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Callback Section (Commented out as per request) */}
                {/*
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
                */}
            </div>
        </div>
    );
}
