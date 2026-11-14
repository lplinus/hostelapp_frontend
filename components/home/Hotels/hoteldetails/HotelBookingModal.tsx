"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckCircle2, Loader2, Building2, Calendar } from "lucide-react";
import type { Hotel, HotelRoomType, HotelBooking } from "@/types/hotel.types";

interface HotelBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotel: Hotel;
    selectedRoom: HotelRoomType | null;
    confirmedBooking: HotelBooking | null;
    setConfirmedBooking: (booking: HotelBooking | null) => void;
    checkInDate: string;
    setCheckInDate?: (date: string) => void;
    checkOutDate: string;
    setCheckOutDate?: (date: string) => void;
    numberOfNights: number;
    totalAmount: number;
    guestName: string;
    setGuestName: (name: string) => void;
    guestEmail: string;
    setGuestEmail: (email: string) => void;
    guestMobile: string;
    setGuestMobile: (phone: string) => void;
    specialRequests: string;
    setSpecialRequests: (req: string) => void;
    paymentMethod: "online" | "on_arrival";
    setPaymentMethod: (method: "online" | "on_arrival") => void;
    isSubmittingBooking: boolean;
    handleConfirmBooking: () => void;
    isEmailVerified?: boolean;
}

export function HotelBookingModal({
    isOpen,
    onClose,
    hotel,
    selectedRoom,
    confirmedBooking,
    setConfirmedBooking,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    numberOfNights,
    totalAmount,
    guestName,
    setGuestName,
    guestEmail,
    setGuestEmail,
    guestMobile,
    setGuestMobile,
    specialRequests,
    setSpecialRequests,
    paymentMethod,
    setPaymentMethod,
    isSubmittingBooking,
    handleConfirmBooking,
    isEmailVerified,
}: HotelBookingModalProps) {
    useEffect(() => {
        if (isOpen) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
                    onClick={() => {
                        if (!isSubmittingBooking) {
                            onClose();
                        }
                    }}
                    aria-hidden="true"
                />
            )}
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        if (isSubmittingBooking) return;
                        onClose();
                    }
                }}
                modal={false}
            >
                <DialogContent
                    className="max-w-lg w-[95vw] sm:w-full p-5 sm:p-6 rounded-xl bg-[#E5DFD4] shadow-2xl border border-[#D2CABC] max-h-[90vh] overflow-y-auto no-scrollbar"
                    onPointerDownOutside={(e) => {
                        e.preventDefault();
                    }}
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                {confirmedBooking ? (
                    <div className="text-center py-4 space-y-4">
                        <div className="w-14 h-14 bg-[#DBD5C8] text-[#1A1916] rounded-full flex items-center justify-center mx-auto border border-[#D2CABC] shadow-xs">
                            <CheckCircle2 size={30} strokeWidth={2.5} />
                        </div>
                        <DialogHeader className="space-y-1 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1916] bg-[#DBD5C8] px-2.5 py-1 rounded-md border border-[#D2CABC] inline-block mx-auto">
                                Reservation Confirmed
                            </span>
                            <DialogTitle className="text-xl font-bold text-[#1A1916] mt-2 text-center">
                                Booking Confirmed!
                            </DialogTitle>
                            <DialogDescription className="text-xs text-[#686259] mt-1 text-center">
                                Your stay at <strong className="text-[#1A1916]">{hotel.name}</strong> is locked in.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Booking Summary Box */}
                        <div className="bg-[#DBD5C8]/40 rounded-lg p-4 border border-[#D2CABC] text-left space-y-2 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-[#D2CABC]">
                                <span className="text-[#686259]">Booking Reference</span>
                                <span className="font-mono font-bold text-[#1A1916] text-sm">
                                    {confirmedBooking.booking_reference}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#686259]">Suite Type</span>
                                <span className="font-semibold text-[#1A1916]">
                                    {selectedRoom?.name || "Standard Suite"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#686259]">Stay Duration</span>
                                <span className="font-semibold text-[#1A1916]">
                                    {checkInDate} to {checkOutDate} ({numberOfNights} night{numberOfNights > 1 ? "s" : ""})
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#686259]">Guest</span>
                                <span className="font-semibold text-[#1A1916]">{guestName}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[#D2CABC] items-baseline">
                                <span className="text-[#1A1916] font-bold">Total Amount</span>
                                <span className="text-base font-extrabold text-[#1A1916]">
                                    ₹{totalAmount.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                            <Button
                                asChild
                                className="h-10 px-4 bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] text-xs font-semibold rounded-sm"
                            >
                                <Link href="/hotelbooking">
                                    View in Dashboard Folio
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClose();
                                    setConfirmedBooking(null);
                                }}
                                className="h-10 px-4 text-xs font-semibold text-[#1A1916] border border-[#D2CABC] bg-[#EDE8DF] hover:bg-[#DBD5C8] rounded-sm"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#1A1916] flex items-center gap-2">
                                <Building2 size={18} className="text-[#1F1E1B]" />
                                Reserve {hotel.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-[#686259] font-medium">
                                {selectedRoom?.name || "Selected Suite"} • {numberOfNights} night{numberOfNights > 1 ? "s" : ""} • {new Date(checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ₹{totalAmount.toLocaleString("en-IN")} Total
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 text-xs">
                            {/* Stay Dates (Frozen from Reserve bar selection) */}
                            <div className="bg-[#DBD5C8]/40 rounded-lg border border-[#D2CABC] p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#686259] uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar size={12} className="text-[#1F1E1B]" />
                                        Selected Stay Dates
                                    </span>
                                    <span className="text-[10px] font-bold text-[#1A1916] bg-[#DBD5C8] border border-[#D2CABC] px-2 py-0.5 rounded-md">
                                        {numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"} (Confirmed)
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="bg-[#EDE8DF] border border-[#D2CABC] rounded-md px-3 py-2">
                                        <span className="text-[10px] font-semibold text-[#686259] block uppercase">Check-In</span>
                                        <span className="text-xs font-bold text-[#1A1916] block mt-0.5">
                                            {checkInDate ? new Date(checkInDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : checkInDate}
                                        </span>
                                    </div>
                                    <div className="bg-[#EDE8DF] border border-[#D2CABC] rounded-md px-3 py-2">
                                        <span className="text-[10px] font-semibold text-[#686259] block uppercase">Check-Out</span>
                                        <span className="text-xs font-bold text-[#1A1916] block mt-0.5">
                                            {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : checkOutDate}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-semibold text-[#1A1916]">Primary Guest Full Name</label>
                                <Input
                                    placeholder="Full Name (e.g. Aarav Sharma)"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="h-10 text-xs font-medium text-[#1A1916] bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="font-semibold text-[#1A1916]">Email Address</label>
                                        {isEmailVerified && (
                                            <span className="text-[10px] text-[#1A1916] font-bold flex items-center gap-1 bg-[#DBD5C8] px-2 py-0.5 rounded-md border border-[#D2CABC]">
                                                <CheckCircle2 size={11} /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="guest@example.com"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        className="h-10 text-xs font-medium text-[#1A1916] bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-[#1A1916]">
                                        Mobile Number <span className="text-[10px] text-[#686259] font-normal">(10 digits)</span>
                                    </label>
                                    <Input
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9876543210"
                                        value={guestMobile}
                                        onChange={(e) => {
                                            // Allow only digits
                                            const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setGuestMobile(digitsOnly);
                                        }}
                                        className="h-10 text-xs font-medium text-[#1A1916] font-mono tracking-wider bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-[#1A1916]">Special Notes for Concierge (Optional)</label>
                                <Input
                                    placeholder="Late check-in, high floor preference, airport transfer inquiry..."
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    className="h-10 text-xs font-medium text-[#1A1916] bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[#D2CABC]">
                                <label className="font-semibold text-[#1A1916] block">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("online")}
                                        className={`p-2.5 rounded-md border text-xs font-semibold flex items-center justify-between transition-all ${paymentMethod === "online"
                                                ? "border-[#1F1E1B] bg-[#DBD5C8] text-[#1A1916]"
                                                : "border-[#D2CABC] bg-[#EDE8DF] text-[#686259] hover:bg-[#DBD5C8]/50 hover:text-[#1A1916]"
                                            }`}
                                    >
                                        <span>UPI / Razorpay</span>
                                        {paymentMethod === "online" && <Check size={14} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("on_arrival")}
                                        className={`p-2.5 rounded-md border text-xs font-semibold flex items-center justify-between transition-all ${paymentMethod === "on_arrival"
                                                ? "border-[#1F1E1B] bg-[#DBD5C8] text-[#1A1916]"
                                                : "border-[#D2CABC] bg-[#EDE8DF] text-[#686259] hover:bg-[#DBD5C8]/50 hover:text-[#1A1916]"
                                            }`}
                                    >
                                        <span>Pay on Arrival</span>
                                        {paymentMethod === "on_arrival" && <Check size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-2 border-t border-[#D2CABC]">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={isSubmittingBooking}
                                className="h-10 px-4 text-xs font-semibold text-[#686259] hover:text-[#1A1916] border border-[#D2CABC] bg-[#EDE8DF] hover:bg-[#DBD5C8] rounded-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleConfirmBooking}
                                disabled={isSubmittingBooking}
                                className="h-10 px-5 bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] text-xs font-semibold gap-1.5 shadow-sm rounded-sm"
                            >
                                {isSubmittingBooking ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin text-[#EDE8DF]" />
                                        Processing...
                                    </>
                                ) : (
                                    paymentMethod === "online"
                                        ? `Pay ₹${totalAmount.toLocaleString("en-IN")}`
                                        : "Confirm & Reserve"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </>
    );
}

