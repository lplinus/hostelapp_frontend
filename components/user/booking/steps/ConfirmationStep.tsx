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
                <div className="space-y-6">
                    {/* ═══ Success Hero ═══ */}
                    <div className="text-center py-8">
                        <div className="flex justify-center mb-5">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-emerald-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100/50">
                                <CheckCircle2 size={40} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500">Your booking has been successfully created</p>
                    </div>

                    {/* ═══ Booking Details Card ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8">
                            {/* Confirmation Code & Status */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Confirmation Code</p>
                                    <p className="text-xl font-bold font-mono text-[#312E81] tracking-wider">
                                        NS-{confirmedBookingId?.substring(0, 4).toUpperCase()}-{confirmedBookingId?.substring(4, 6).toUpperCase()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#10B981]">
                                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                                        Confirmed
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mb-6" />

                            {/* Details Grid */}
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Guest Name</p>
                                    <p className="font-semibold text-gray-900">{form.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Dates</p>
                                    <p className="font-semibold text-gray-900">{format(form.check_in, "MMM d")} — {format(form.check_out, "MMM d, yyyy")}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Accommodation</p>
                                    <p className="font-semibold text-gray-900">{hostelName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                        {paymentMethod === "on_arrival" ? "💳 Pay at Hostel" : "💳 Paid Online"}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mb-6" />

                            {/* Hostel Mini Card with Total */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🏠</div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{hostelName}</p>
                                        <p className="text-xs text-gray-400">Booking confirmed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Amount</p>
                                    <p className="text-xl font-bold text-[#312E81]">₹{finalTotalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ QR Code Section ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                    `Booking ID: NS-${confirmedBookingId?.substring(0, 4).toUpperCase()}-${confirmedBookingId?.substring(4, 6).toUpperCase()}\nGuest: ${form.guest_name}\nHostel: ${hostelName}\nDates: ${format(form.check_in, "MMM d, yyyy")} - ${format(form.check_out, "MMM d, yyyy")}\nPayment: ${paymentMethod === 'on_arrival' ? 'Pay at Hostel' : 'Paid Online'}${paymentId ? `\nPayment ID: ${paymentId}` : ''}${extraCharges && extraCharges.length > 0 ? extraCharges.map(c => `\n${c.charge_type.replace('_',' ')}: ₹${c.amount}${c.description ? ` (${c.description})` : ''}`).join('') : ''}`
                                )}`}
                                alt="Booking QR Code"
                                className="w-32 h-32"
                            />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Check-in Pass</h4>
                        <p className="text-xs text-gray-500">Scan this QR code at the hostel front desk to expedite your check-in process.</p>
                    </div>

                    {/* ═══ Extra Charges ═══ */}
                    {extraCharges && extraCharges.length > 0 && (
                        <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-6">
                            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider mb-3">Extra Charges (billed separately)</p>
                            {extraCharges.map((charge, i) => (
                                <div
                                    key={charge.id ?? i}
                                    className={`flex justify-between items-start py-2.5 ${i !== extraCharges.length - 1 ? 'border-b border-amber-100' : ''}`}
                                >
                                    <div className="min-w-0 flex-1 mr-3">
                                        <span className="text-sm font-semibold text-gray-800 capitalize">
                                            {charge.charge_type.replace('_', ' ')}
                                        </span>
                                        {charge.description && (
                                            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{charge.description}</p>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap tabular-nums">
                                        ₹{Number(charge.amount).toLocaleString()}
                                        <span className="text-[10px] font-medium text-gray-400">/mo</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ═══ Action Buttons ═══ */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 h-12 rounded-2xl bg-[#312E81] hover:bg-[#252361] text-white font-bold shadow-md transition-all active:scale-[0.98]"
                            onClick={() => router.push("/home")}
                        >
                            <Search size={16} className="mr-2" />
                            Browse Hostels
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl border-gray-200 bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                            onClick={resetBooking}
                        >
                            <RotateCcw size={16} className="mr-2" />
                            Book Again
                        </Button>
                    </div>

                    {/* ═══ Email Notice ═══ */}
                    <div className="text-center py-2">
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            A confirmation email was sent to <strong className="text-gray-700">{form.guest_email}</strong>
                        </p>
                    </div>

                    {/* ═══ Quick Links ═══ */}
                    <div className="flex items-center justify-center gap-6 pt-2 pb-4">
                        <button className="text-xs font-semibold text-[#312E81] hover:underline underline-offset-2 flex items-center gap-1">
                            <FileText size={12} /> Download Invoice
                        </button>
                        <button className="text-xs font-semibold text-[#312E81] hover:underline underline-offset-2 flex items-center gap-1">
                            <CalendarPlus size={12} /> Add to Calendar
                        </button>
                        <button className="text-xs font-semibold text-[#312E81] hover:underline underline-offset-2 flex items-center gap-1">
                            <Headphones size={12} /> Contact Support
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
