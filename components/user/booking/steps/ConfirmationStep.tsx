"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, Info, ArrowRight, RotateCcw, LayoutDashboard } from "lucide-react";
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

    // Show when confirmation step is active or booking is confirmed
    if (step !== "confirmation" && isConfirmed) return null;

    return (
        <Card className={cn(
            "border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 bg-white rounded-2xl",
            isConfirmed && "border-[#10B981]/20 shadow-lg shadow-emerald-50/50"
        )}>
            {/* Step Header */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-1">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isConfirmed ? "bg-[#10B981]/10" : "bg-[#312E81]/10"
                    )}>
                        <CheckCircle2 size={16} className={isConfirmed ? "text-[#10B981]" : "text-[#312E81]"} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Booking Confirmation</h2>
                        <p className="text-xs text-gray-500">Your booking details and QR code</p>
                    </div>
                </div>
            </div>

            <CardContent className="space-y-5 pt-2 px-6 pb-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                {(!isFormValid || !isPhoneVerified || (!confirmedBookingId && form.booking_type !== "visit") || (form.booking_type === "stay" && paymentMethod === "online" && !isPaymentVerified)) && !isConfirmed ? (
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
                ) : (confirmedBookingId && (form.booking_type === "visit" || paymentMethod === "on_arrival" || isPaymentVerified || isConfirmed)) ? (
                    <>
                        {/* Success Banner */}
                        <div className="text-center space-y-3 py-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                    <CheckCircle2 size={32} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
                                <p className="text-sm text-gray-500">
                                    Your request has been sent to <strong className="text-gray-700">{hostelName}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Booking Details Card */}
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Details Grid */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Booking ID</span>
                                        <span className="font-bold font-mono text-[#312E81] text-sm">STN-{confirmedBookingId?.substring(0, 8).toUpperCase()}</span>
                                    </div>
                                    <div className="w-full h-px bg-gray-200" />
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Guest</span>
                                        <span className="font-semibold text-sm text-gray-900">{form.guest_name}</span>
                                    </div>
                                    <div className="w-full h-px bg-gray-200" />
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dates</span>
                                        <span className="font-semibold text-sm text-gray-900">{format(form.check_in, "MMM d")} – {format(form.check_out, "MMM d")}</span>
                                    </div>
                                    <div className="w-full h-px bg-gray-200" />
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Status</span>
                                        <div className="text-right">
                                            {paymentMethod === "online" ? (
                                                <>
                                                    <span className="font-bold text-sm text-[#10B981] block">₹{bookingFee} Paid Now</span>
                                                    <span className="text-[10px] text-orange-600 font-bold">₹{totalPrice.toLocaleString()} due at property</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-sm text-orange-600 block">Pay at Property</span>
                                                    <span className="text-[10px] text-slate-500 font-medium italic">₹{finalTotalPrice.toLocaleString()} pending</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {paymentId && (
                                        <>
                                            <div className="w-full h-px bg-gray-200" />
                                            <div className="flex items-center justify-between py-1.5">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment ID</span>
                                                <span className="font-bold font-mono text-[#312E81] text-[10px] break-all">{paymentId}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* QR Code */}
                                <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                            `Booking ID: STN-${confirmedBookingId?.substring(0, 8).toUpperCase()}\nGuest: ${form.guest_name}\nHostel: ${hostelName}\nDates: ${format(form.check_in, "MMM d, yyyy")} - ${format(form.check_out, "MMM d, yyyy")}\nPayment: ${paymentMethod === 'on_arrival' ? 'Pay at Hostel' : 'Paid Online'}${paymentId ? `\nPayment ID: ${paymentId}` : ''}${extraCharges && extraCharges.length > 0 ? extraCharges.map(c => `\n${c.charge_type.replace('_',' ')}: ₹${c.amount}${c.description ? ` (${c.description})` : ''}`).join('') : ''}`
                                        )}`}
                                        alt="Booking QR Code"
                                        className="w-28 h-28"
                                    />
                                    <span className="text-[8px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Scan to verify</span>
                                </div>
                            </div>
                        </div>

                        {/* Extra Charges */}
                        {extraCharges && extraCharges.length > 0 && (
                            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-5">
                                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider mb-3">Extra Charges (billed separately)</p>
                                {extraCharges.map((charge, i) => (
                                    <div
                                        key={charge.id ?? i}
                                        className={`flex justify-between items-start py-2 ${i !== extraCharges.length - 1 ? 'border-b border-amber-100' : ''}`}
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

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl h-11 font-bold border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                                onClick={() => router.push("/home")}
                            >
                                Browse Hostels
                                <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl h-11 border-[#312E81]/20 text-[#312E81] font-bold hover:bg-[#312E81]/5 hover:text-[#312E81]"
                                onClick={resetBooking}
                            >
                                <RotateCcw size={14} className="mr-1.5" />
                                Book Again
                            </Button>
                            {!isConfirmed && (
                                <Button
                                    className="flex-1 rounded-xl h-11 bg-[#312E81] font-bold shadow-md shadow-indigo-100 hover:bg-[#1E1B4B]"
                                    onClick={() => router.push("/dashboard")}
                                >
                                    <LayoutDashboard size={14} className="mr-1.5" />
                                    Dashboard
                                </Button>
                            )}
                        </div>
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
}
