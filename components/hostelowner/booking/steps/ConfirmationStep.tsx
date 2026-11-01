"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, Info, ArrowRight, RotateCcw, Search, Mail, FileText, CalendarPlus, Headphones } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Step } from "../booking-container";
import type { ExtraCharge } from "@/types/hostel.types";

interface ConfirmationStepProps {
    step: Step;
    setStep: (s: Step) => void;
    confirmedBookingId: string | null;
    paymentId: string | null;
    form: any;
    totalPrice: number;
    bookingFee: number;
    finalTotalPrice: number;
    hostelName: string;
    router: any;
    isPhoneVerified: boolean;
    validateForm: () => boolean;
    isFormValid: boolean;
    resetBooking: () => void;
    isPaymentVerified: boolean;
    paymentMethod: "online" | "on_arrival";
    bookingStatus: "pending" | "confirmed";
    extraCharges?: readonly ExtraCharge[];
}

export function ConfirmationStep({
    step,
    setStep,
    confirmedBookingId,
    paymentId,
    form,
    totalPrice,
    bookingFee,
    finalTotalPrice,
    hostelName,
    router,
    isPhoneVerified,
    validateForm,
    isFormValid,
    resetBooking,
    isPaymentVerified,
    paymentMethod,
    bookingStatus,
    extraCharges
}: ConfirmationStepProps) {
    const isConfirmed = bookingStatus === "confirmed";

    if (step !== "confirmation" && !isConfirmed) return null;
    if (step !== "confirmation" && isConfirmed) return null;

    return (
        <div>
            {(!isFormValid || !isPhoneVerified || (!confirmedBookingId && form.booking_type !== "visit") || (form.booking_type === "stay" && paymentMethod === "online" && !isPaymentVerified)) && !isConfirmed ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="py-12 px-6 text-center space-y-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <div className="flex justify-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <Info size={28} />
                            </div>
                        </div>
                        <div className="space-y-1.5 max-w-xs mx-auto">
                            <h4 className="font-bold text-gray-900">Previous Steps Incomplete</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {!isFormValid
                                    ? "Please complete guest details correctly first."
                                    : !isPhoneVerified
                                        ? "Please verify your mobile number first."
                                        : "Please complete your payment to view confirmation."}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => setStep(!isFormValid || !isPhoneVerified ? "details" : "payment")}
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            {!isFormValid || !isPhoneVerified ? "Go to Details" : "Go to Payment"}
                        </Button>
                    </div>
                </div>
            ) : (confirmedBookingId && (form.booking_type === "visit" || paymentMethod === "on_arrival" || isPaymentVerified || isConfirmed)) ? (
                <div className="space-y-4">
                    {/* ═══ Success Hero (Compact & High Contrast) ═══ */}
                    <div className="text-center py-4 bg-white rounded-2xl border border-gray-200/70 shadow-sm px-4">
                        <div className="w-12 h-12 bg-[#003580] rounded-full flex items-center justify-center text-white mx-auto mb-2.5 shadow-md shadow-blue-200/50">
                            <CheckCircle2 size={26} strokeWidth={2.8} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">Booking Confirmed!</h2>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1">Your reservation has been successfully confirmed and registered.</p>
                    </div>

                    {/* ═══ Booking Details Card (Compact & Clean Border) ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 sm:p-6">
                        {/* Confirmation Code & Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mb-0.5">Confirmation Code</p>
                                <p className="text-lg sm:text-xl font-black font-mono text-[#003580] tracking-wider">
                                    NS-{confirmedBookingId?.substring(0, 4).toUpperCase()}-{confirmedBookingId?.substring(4, 6).toUpperCase()}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#003580] border border-blue-200">
                                <span className="w-2 h-2 rounded-full bg-[#003580] animate-pulse" />
                                Confirmed
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-gray-100">
                            <div>
                                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mb-1">Primary Guest</p>
                                <p className="font-extrabold text-gray-950 text-sm leading-snug">{form.guest_name}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mb-1">Check-in / Out</p>
                                <p className="font-extrabold text-gray-950 text-sm leading-snug">{format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d, yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mb-1">Hostel</p>
                                <p className="font-extrabold text-gray-950 text-sm leading-snug truncate" title={hostelName}>{hostelName}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mb-1">Payment Method</p>
                                <p className="font-extrabold text-gray-950 text-sm leading-snug">
                                    {paymentMethod === "on_arrival" ? "Pay at Hostel" : "Paid Online"}
                                </p>
                            </div>
                        </div>

                        {/* Mini Total Row */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-sm">🏠</div>
                                <div>
                                    <p className="font-bold text-gray-950 text-sm">{hostelName}</p>
                                    <p className="text-xs font-semibold text-[#003580]">All taxes & fees included</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider">Total Amount</p>
                                <p className="text-xl sm:text-2xl font-black text-[#003580]">₹{finalTotalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══ QR Code Section (Compact Horizontal Card) ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 flex-shrink-0">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                    `Booking ID: NS-${confirmedBookingId?.substring(0, 4).toUpperCase()}-{confirmedBookingId?.substring(4, 6).toUpperCase()}\nGuest: ${form.guest_name}\nHostel: ${hostelName}\nDates: ${format(form.check_in, "MMM d, yyyy")} - ${format(form.check_out, "MMM d, yyyy")}\nPayment: ${paymentMethod === 'on_arrival' ? 'Pay at Hostel' : 'Paid Online'}${paymentId ? `\nPayment ID: ${paymentId}` : ''}${extraCharges && extraCharges.length > 0 ? extraCharges.map(c => `\n${c.charge_type.replace('_',' ')}: ₹${c.amount}${c.description ? ` (${c.description})` : ''}`).join('') : ''}`
                                )}`}
                                alt="Booking QR Code"
                                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-gray-950 text-sm sm:text-base mb-0.5">Front Desk Check-in Pass</h4>
                            <p className="text-xs font-medium text-gray-700 leading-relaxed">Present this QR code on arrival at the hostel reception to complete instant check-in verification.</p>
                            <p className="text-[11px] font-bold text-[#003580] mt-1.5 flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-[#003580] shrink-0" /> Fast-track verification pass
                            </p>
                        </div>
                    </div>

                    {/* ═══ Extra Charges (Compact) ═══ */}
                    {extraCharges && extraCharges.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-[11px] text-amber-900 font-bold uppercase tracking-wider mb-2">Extra Charges (billed separately by property)</p>
                            {extraCharges.map((charge, i) => (
                                <div
                                    key={charge.id ?? i}
                                    className={`flex justify-between items-center py-1.5 ${i !== extraCharges.length - 1 ? 'border-b border-amber-100' : ''}`}
                                >
                                    <span className="text-xs font-bold text-gray-800 capitalize">
                                        {charge.charge_type.replace('_', ' ')}
                                        {charge.description && <span className="font-normal text-gray-600 ml-1">({charge.description})</span>}
                                    </span>
                                    <span className="text-xs font-black text-gray-950">
                                        ₹{Number(charge.amount).toLocaleString()}
                                        <span className="text-[10px] font-semibold text-gray-600">/mo</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ═══ Action Buttons (Crystal Clear Hover & Classic Dark Blue) ═══ */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                            type="button"
                            className="flex-1 h-12 rounded-xl bg-[#003580] hover:bg-[#002244] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                            onClick={() => router.push("/home")}
                        >
                            <Search size={16} />
                            Browse Hostels
                        </button>
                        <button
                            type="button"
                            className="flex-1 h-12 rounded-xl bg-white border-2 border-[#003580] text-[#003580] font-extrabold text-sm hover:bg-[#003580] hover:text-white transition-all duration-200 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                            onClick={resetBooking}
                        >
                            <RotateCcw size={16} />
                            Book Again
                        </button>
                    </div>

                    {/* ═══ Email Notice (Bright & Clear) ═══ */}
                    <div className="text-center pt-1 pb-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                            <Mail size={15} className="text-[#003580]" />
                            Confirmation details & invoice sent to <strong className="text-gray-950 underline">{form.guest_email}</strong>
                        </p>
                    </div>

                    {/* ═══ Quick Links (High Contrast Dark Blue) ═══ */}
                    <div className="flex items-center justify-center gap-6 pt-1 pb-2">
                        <button className="text-xs font-bold text-[#003580] hover:text-[#002244] hover:underline underline-offset-2 flex items-center gap-1 transition-colors">
                            <FileText size={13} /> Download Invoice
                        </button>
                        <button className="text-xs font-bold text-[#003580] hover:text-[#002244] hover:underline underline-offset-2 flex items-center gap-1 transition-colors">
                            <CalendarPlus size={13} /> Add to Calendar
                        </button>
                        <button className="text-xs font-bold text-[#003580] hover:text-[#002244] hover:underline underline-offset-2 flex items-center gap-1 transition-colors">
                            <Headphones size={13} /> Contact Support
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
