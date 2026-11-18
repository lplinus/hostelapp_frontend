"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckCircle2, Loader2, Palmtree, Calendar, Clock, ChevronDown, X } from "lucide-react";
import type { VacationRental, VacationRentalBooking } from "@/types/vacationrental.types";

function formatTime(timeStr?: string): string {
    if (!timeStr) return "";
    try {
        const [hPart, mPart] = timeStr.split(":");
        const h = parseInt(hPart, 10);
        if (isNaN(h)) return timeStr;
        const m = mPart ? mPart.slice(0, 2) : "00";
        const ampm = h >= 12 ? "PM" : "AM";
        const formattedHour = h % 12 === 0 ? 12 : h % 12;
        return `${formattedHour}:${m} ${ampm}`;
    } catch {
        return timeStr;
    }
}

const TIME_SLOTS = [
    "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
    "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM",
    "10:00 PM", "10:30 PM", "11:00 PM",
];

interface AppTimeSelectorProps {
    value?: string;
    onChange?: (time: string) => void;
    label: string;
    placeholder?: string;
    defaultPropertyTime?: string;
    defaultPropertyLabel?: string;
}

function AppTimeSelector({
    value = "",
    onChange,
    label,
    placeholder = "Select preferred time",
    defaultPropertyTime,
    defaultPropertyLabel,
}: AppTimeSelectorProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    const formattedDefault = defaultPropertyTime ? formatTime(defaultPropertyTime) : "";

    return (
        <div className="space-y-1.5 relative" ref={containerRef}>
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1A1916] flex items-center gap-1.5">
                    <Clock size={12} className="text-[#686259]" />
                    {label}
                </label>
                <span className="text-[10px] text-[#686259] font-normal">Optional</span>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className={`w-full h-10 px-3 bg-[#EDE8DF] border rounded-md text-xs font-medium flex items-center justify-between transition-all focus:outline-none ${
                        open
                            ? "border-[#1F1E1B] ring-1 ring-[#1F1E1B]/20"
                            : "border-[#D2CABC] hover:border-[#1F1E1B]/50"
                    }`}
                >
                    <span className="flex items-center gap-2 truncate">
                        {value ? (
                            <span className="font-bold text-[#1A1916] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1F1E1B]" />
                                {value}
                            </span>
                        ) : (
                            <span className="text-[#7A746B]">{placeholder}</span>
                        )}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                        {value && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange?.("");
                                }}
                                className="p-1 rounded-full hover:bg-[#DBD5C8] text-[#686259] hover:text-[#1A1916] transition-colors"
                                title="Clear selection"
                            >
                                <X size={12} />
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={`text-[#686259] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                    </div>
                </button>

                {open && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#EDE8DF] border border-[#D2CABC] rounded-md shadow-2xl overflow-hidden animate-in fade-in duration-100">
                        <div className="p-2 border-b border-[#D2CABC] bg-[#DBD5C8]/50 flex items-center justify-between text-[11px] font-semibold text-[#686259] px-3">
                            <span>Select Preferred Time</span>
                            {value && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange?.("");
                                        setOpen(false);
                                    }}
                                    className="text-[10px] text-[#1F1E1B] hover:underline font-bold"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-[#D2CABC]/30">
                            {formattedDefault && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange?.(formattedDefault);
                                        setOpen(false);
                                    }}
                                    className={`w-full px-2.5 py-2 rounded text-left text-xs flex items-center justify-between transition-colors ${
                                        value === formattedDefault
                                            ? "bg-[#1F1E1B] text-[#EDE8DF] font-semibold"
                                            : "hover:bg-[#DBD5C8] text-[#1A1916]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className={value === formattedDefault ? "text-[#EDE8DF]" : "text-[#686259]"} />
                                        <span>
                                            {formattedDefault}{" "}
                                            <span className={value === formattedDefault ? "text-[#D2CABC] text-[10px]" : "text-[#686259] text-[10px]"}>
                                                ({defaultPropertyLabel || "Default"})
                                            </span>
                                        </span>
                                    </div>
                                    {value === formattedDefault && <Check size={13} className="text-[#EDE8DF]" />}
                                </button>
                            )}

                            <div className="py-0.5 space-y-0.5">
                                {TIME_SLOTS.map((time) => {
                                    const isSelected = value === time;
                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => {
                                                onChange?.(time);
                                                setOpen(false);
                                            }}
                                            className={`w-full px-2.5 py-1.5 rounded text-left text-xs flex items-center justify-between transition-colors ${
                                                isSelected
                                                    ? "bg-[#1F1E1B] text-[#EDE8DF] font-semibold"
                                                    : "hover:bg-[#DBD5C8] text-[#1A1916]"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        isSelected ? "bg-[#EDE8DF]" : "bg-[#D2CABC]"
                                                    }`}
                                                />
                                                {time}
                                            </span>
                                            {isSelected && <Check size={13} className="text-[#EDE8DF]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface VacationRentalBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rental: VacationRental;
    confirmedBooking: VacationRentalBooking | null;
    setConfirmedBooking: (booking: VacationRentalBooking | null) => void;
    checkInDate: string;
    setCheckInDate?: (date: string) => void;
    checkInTime?: string;
    setCheckInTime?: (time: string) => void;
    checkOutDate: string;
    setCheckOutDate?: (date: string) => void;
    checkOutTime?: string;
    setCheckOutTime?: (time: string) => void;
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
    checkInTime,
    setCheckInTime,
    checkOutDate,
    setCheckOutDate,
    checkOutTime,
    setCheckOutTime,
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
                    className="sm:max-w-xl max-w-[95vw] w-full max-h-[90vh] overflow-y-auto bg-[#E5DFD4] border border-[#D2CABC] shadow-2xl rounded-xl p-5 sm:p-6 no-scrollbar"
                    onPointerDownOutside={(e) => {
                        e.preventDefault();
                    }}
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                    {confirmedBooking ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#DBD5C8] text-[#1F1E1B] flex items-center justify-center mx-auto shadow-xs border border-[#D2CABC]">
                                <CheckCircle2 size={32} />
                            </div>

                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold text-[#1A1916]">
                                    Reservation Confirmed!
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#686259] font-medium">
                                    Your vacation stay at {rental.title} is officially reserved.
                                </DialogDescription>
                            </div>

                            <div className="bg-[#DBD5C8]/40 rounded-lg p-4 border border-[#D2CABC] text-xs text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[#686259] font-medium">Booking Reference:</span>
                                    <span className="font-mono font-bold text-[#1A1916]">
                                        #{confirmedBooking.booking_reference}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#686259] font-medium">Check-In:</span>
                                    <span className="font-bold text-[#1A1916] flex items-center gap-1.5">
                                        {confirmedBooking.check_in_date}
                                        {checkInTime ? (
                                            <span className="text-[10px] text-[#1F1E1B] font-semibold bg-[#DBD5C8] px-2 py-0.5 rounded border border-[#D2CABC]">
                                                {checkInTime}
                                            </span>
                                        ) : rental.check_in_time ? (
                                            <span className="text-[10px] text-[#686259] font-semibold bg-[#DBD5C8] px-1.5 py-0.5 rounded border border-[#D2CABC]">
                                                {formatTime(rental.check_in_time)}
                                            </span>
                                        ) : null}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#686259] font-medium">Check-Out:</span>
                                    <span className="font-bold text-[#1A1916] flex items-center gap-1.5">
                                        {confirmedBooking.check_out_date}
                                        {checkOutTime ? (
                                            <span className="text-[10px] text-[#1F1E1B] font-semibold bg-[#DBD5C8] px-2 py-0.5 rounded border border-[#D2CABC]">
                                                {checkOutTime}
                                            </span>
                                        ) : rental.check_out_time ? (
                                            <span className="text-[10px] text-[#686259] font-semibold bg-[#DBD5C8] px-1.5 py-0.5 rounded border border-[#D2CABC]">
                                                {formatTime(rental.check_out_time)}
                                            </span>
                                        ) : null}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#686259] font-medium">Total Price:</span>
                                    <span className="font-bold text-[#1A1916]">₹{confirmedBooking.total_price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#686259] font-medium">Status:</span>
                                    <span className="font-bold text-[#1F1E1B]">
                                        {confirmedBooking.status_display}
                                    </span>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:justify-center pt-2">
                                <Button
                                    asChild
                                    className="bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] text-xs font-semibold rounded-sm h-10 px-4"
                                >
                                    <Link href="/home/guestprofile?tab=bookings">
                                        View in Guest Profile
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onClose();
                                        setConfirmedBooking(null);
                                    }}
                                    className="text-xs font-semibold text-[#1A1916] border border-[#D2CABC] bg-[#EDE8DF] hover:bg-[#DBD5C8] rounded-sm h-10 px-4"
                                >
                                    Done
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <>
                            <DialogHeader className="pb-3 border-b border-[#D2CABC]/70">
                                <DialogTitle className="text-lg font-bold text-[#1A1916] flex items-center gap-2">
                                    <Palmtree size={19} className="text-[#1F1E1B]" />
                                    Reserve {rental.title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#686259] font-medium mt-0.5">
                                    {numberOfNights} night{numberOfNights === 1 ? "" : "s"} stay • ₹{pricingCalculation.grandTotal.toLocaleString("en-IN")} Total
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4 text-xs">
                                {/* Dates (Selected from details page) */}
                                <div className="p-3.5 bg-[#DBD5C8]/45 rounded-lg border border-[#D2CABC] space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-[#686259] uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={13} className="text-[#1F1E1B]" />
                                            Selected Stay Dates
                                        </span>
                                        <span className="text-[10px] font-bold text-[#1A1916] bg-[#DBD5C8] border border-[#D2CABC] px-2.5 py-0.5 rounded-md">
                                            {numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"} Stay
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-0.5">
                                        <div className="bg-[#EDE8DF] border border-[#D2CABC] rounded-md px-3.5 py-2.5">
                                            <span className="text-[10px] font-semibold text-[#686259] block uppercase tracking-wider">Check-In</span>
                                            <span className="text-xs font-bold text-[#1A1916] block mt-0.5">
                                                {checkInDate ? new Date(checkInDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : checkInDate}
                                            </span>
                                        </div>
                                        <div className="bg-[#EDE8DF] border border-[#D2CABC] rounded-md px-3.5 py-2.5">
                                            <span className="text-[10px] font-semibold text-[#686259] block uppercase tracking-wider">Check-Out</span>
                                            <span className="text-xs font-bold text-[#1A1916] block mt-0.5">
                                                {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : checkOutDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#1A1916]">Primary Guest Name</label>
                                    <Input
                                        placeholder="Full Name (e.g. Aarav Sharma)"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="h-10 text-xs font-medium text-[#1A1916] bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-[#1A1916]">Email Address</label>
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
                                        <label className="text-xs font-semibold text-[#1A1916]">
                                            Mobile Number <span className="text-[10px] text-[#686259] font-normal">(10 digits)</span>
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
                                            className="h-10 text-xs font-medium text-[#1A1916] font-mono tracking-wider bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Application-styled Timing Selectors */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <AppTimeSelector
                                        label="Arrival Time"
                                        placeholder="Select arrival time"
                                        value={checkInTime}
                                        onChange={setCheckInTime}
                                        defaultPropertyTime={rental.check_in_time}
                                        defaultPropertyLabel="Check-in Default"
                                    />
                                    <AppTimeSelector
                                        label="Departure Time"
                                        placeholder="Select departure time"
                                        value={checkOutTime}
                                        onChange={setCheckOutTime}
                                        defaultPropertyTime={rental.check_out_time}
                                        defaultPropertyLabel="Check-out Default"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#1A1916]">Special Notes for Host (Optional)</label>
                                    <Input
                                        placeholder="Late check-in, anniversary setup, airport transfer inquiry..."
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        className="h-10 text-xs font-medium text-[#1A1916] bg-[#EDE8DF] border border-[#D2CABC] rounded-md placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-2 pt-2 border-t border-[#D2CABC]/70">
                                    <label className="text-xs font-semibold text-[#1A1916] block">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("online")}
                                            className={`p-2.5 rounded-md border text-xs font-semibold flex items-center justify-between transition-all ${
                                                paymentMethod === "online"
                                                    ? "border-[#1F1E1B] bg-[#DBD5C8] text-[#1A1916] shadow-xs"
                                                    : "border-[#D2CABC] bg-[#EDE8DF] text-[#686259] hover:bg-[#DBD5C8]/50 hover:text-[#1A1916]"
                                            }`}
                                        >
                                            <span>UPI / Online Pay</span>
                                            {paymentMethod === "online" && <Check size={14} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("on_arrival")}
                                            className={`p-2.5 rounded-md border text-xs font-semibold flex items-center justify-between transition-all ${
                                                paymentMethod === "on_arrival"
                                                    ? "border-[#1F1E1B] bg-[#DBD5C8] text-[#1A1916] shadow-xs"
                                                    : "border-[#D2CABC] bg-[#EDE8DF] text-[#686259] hover:bg-[#DBD5C8]/50 hover:text-[#1A1916]"
                                            }`}
                                        >
                                            <span>Pay on Arrival</span>
                                            {paymentMethod === "on_arrival" && <Check size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2.5 pt-3 border-t border-[#D2CABC]/70">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClose}
                                    disabled={isSubmittingBooking}
                                    className="h-10 px-4 text-xs font-semibold text-[#686259] hover:text-[#1A1916] border border-[#D2CABC] bg-[#EDE8DF] hover:bg-[#DBD5C8] rounded-md"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmittingBooking}
                                    className="h-10 px-5 bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] text-xs font-semibold tracking-wide gap-1.5 shadow-sm rounded-md"
                                >
                                    {isSubmittingBooking ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin text-[#EDE8DF]" />
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
