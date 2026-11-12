"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckCircle2, Loader2, Palmtree, Calendar } from "lucide-react";
import type { VacationRental, VacationRentalBooking } from "@/types/vacationrental.types";

interface VacationRentalBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rental: VacationRental;
    confirmedBooking: VacationRentalBooking | null;
    setConfirmedBooking: (booking: VacationRentalBooking | null) => void;
    checkInDate: string;
    setCheckInDate?: (date: string) => void;
    checkOutDate: string;
    setCheckOutDate?: (date: string) => void;
    numberOfNights: number;
    pricingCalculation: {
        baseRate?: number;
        staySubtotal?: number;
        cleaningFee: number;
        serviceFee: number;
        discount: number;
        grandTotal: number;
    };
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

export function VacationRentalBookingModal({
    isOpen,
    onClose,
    rental,
    confirmedBooking,
    setConfirmedBooking,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    numberOfNights,
    pricingCalculation,
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
}: VacationRentalBookingModalProps) {
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
                    className="max-w-lg"
                    onPointerDownOutside={(e) => {
                        e.preventDefault();
                    }}
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                {confirmedBooking ? (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                            <CheckCircle2 size={32} />
                        </div>

                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-slate-950">
                                Reservation Confirmed!
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-700 font-medium">
                                Your vacation stay at {rental.title} is officially reserved.
                            </DialogDescription>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-left space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">Booking Reference:</span>
                                <span className="font-mono font-bold text-slate-950">
                                    #{confirmedBooking.booking_reference}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">Check-In:</span>
                                <span className="font-bold text-slate-950">{confirmedBooking.check_in_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">Check-Out:</span>
                                <span className="font-bold text-slate-950">{confirmedBooking.check_out_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">Total Price:</span>
                                <span className="font-bold text-slate-950">₹{confirmedBooking.total_price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">Status:</span>
                                <span className="font-bold text-[#312E81]">
                                    {confirmedBooking.status_display}
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:justify-center pt-2">
                            <Button
                                asChild
                                className="bg-[#1E1B4B] hover:bg-[#312E81] text-xs font-semibold"
                            >
                                <Link href="/vacanrentalbooking">
                                    View in Dashboard Folio
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClose();
                                    setConfirmedBooking(null);
                                }}
                                className="text-xs font-semibold text-slate-700"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-950 flex items-center gap-2">
                                <Palmtree size={18} className="text-[#312E81]" />
                                Reserve {rental.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-700 font-medium">
                                {numberOfNights} night(s) from {checkInDate} to {checkOutDate} • ₹{pricingCalculation.grandTotal.toLocaleString("en-IN")} Total
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 text-xs">
                            {/* Dates (Frozen from Reserve bar selection) */}
                            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar size={12} className="text-[#312E81]" />
                                        Selected Stay Dates
                                    </span>
                                    <span className="text-[10px] font-bold text-[#312E81] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                        {numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"} (Confirmed)
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">Check-In</span>
                                        <span className="text-xs font-bold text-slate-900 block mt-0.5">
                                            {checkInDate ? new Date(checkInDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : checkInDate}
                                        </span>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">Check-Out</span>
                                        <span className="text-xs font-bold text-slate-900 block mt-0.5">
                                            {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : checkOutDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-800">Primary Guest Name</label>
                                <Input
                                    placeholder="Full Name (e.g. Aarav Sharma)"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="h-9 text-xs font-medium text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="font-semibold text-slate-800">Email Address</label>
                                        {isEmailVerified && (
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                <CheckCircle2 size={11} /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="guest@example.com"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        className="h-9 text-xs font-medium text-slate-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-800">
                                        Mobile Number <span className="text-[10px] text-slate-400 font-normal">(10 digits)</span>
                                    </label>
                                    <Input
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9876543210"
                                        value={guestMobile}
                                        onChange={(e) => {
                                            const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setGuestMobile(digitsOnly);
                                        }}
                                        className="h-9 text-xs font-medium text-slate-900 font-mono tracking-wider"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-800">Special Notes for Host (Optional)</label>
                                <Input
                                    placeholder="Late check-in, anniversary setup, airport transfer inquiry..."
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    className="h-9 text-xs font-medium text-slate-900"
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="font-semibold text-slate-800 block">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("online")}
                                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${paymentMethod === "online"
                                                ? "border-[#312E81] bg-indigo-50/50 text-[#312E81]"
                                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        <span>UPI / Online Pay</span>
                                        {paymentMethod === "online" && <Check size={14} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("on_arrival")}
                                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${paymentMethod === "on_arrival"
                                                ? "border-[#312E81] bg-indigo-50/50 text-[#312E81]"
                                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        <span>Pay on Arrival</span>
                                        {paymentMethod === "on_arrival" && <Check size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-2 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={isSubmittingBooking}
                                className="text-xs text-slate-700 font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleConfirmBooking}
                                disabled={isSubmittingBooking}
                                className="bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-medium tracking-wide gap-1.5 shadow-sm rounded-sm"
                            >
                                {isSubmittingBooking ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    paymentMethod === "online"
                                        ? `Pay ₹${pricingCalculation.grandTotal.toLocaleString("en-IN")}`
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
