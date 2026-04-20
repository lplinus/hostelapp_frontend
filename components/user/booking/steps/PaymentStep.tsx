"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, ChevronLeft, CheckCircle2, Loader2, Shield, Building2, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step } from "../booking-container";
import type { HostelDetail } from "@/types/hostel.types";

interface PaymentStepProps {
    step: Step;
    setStep: (s: Step) => void;
    confirmedBookingId: string | null;
    totalPrice: number;
    bookingFee: number;
    finalTotalPrice: number;
    hostel: HostelDetail;
    selectedRoom: any;
    form: any;
    bookingMutation: any;
    handleRazorpayPayment: (bookingId: string) => void;
    isPhoneVerified: boolean;
    validateForm: () => boolean;
    isFormValid: boolean;
    isPaymentVerified: boolean;
    paymentMethod: "online" | "on_arrival";
    setPaymentMethod: (m: "online" | "on_arrival") => void;
    confirmPropertyPaymentMutation: any;
    isProcessingPayment: boolean;
    bookingStatus: "pending" | "confirmed";
}

export function PaymentStep({
    step,
    setStep,
    confirmedBookingId,
    totalPrice,
    bookingFee,
    finalTotalPrice,
    hostel,
    selectedRoom,
    form,
    bookingMutation,
    handleRazorpayPayment,
    isPhoneVerified,
    validateForm,
    isFormValid,
    isPaymentVerified,
    paymentMethod,
    setPaymentMethod,
    confirmPropertyPaymentMutation,
    isProcessingPayment,
    bookingStatus
}: PaymentStepProps) {
    const isConfirmed = bookingStatus === "confirmed";

    if (step !== "payment") return null;

    return (
        <div className={cn(
            "transition-all duration-500",
            isConfirmed && "opacity-60 pointer-events-none"
        )}>
            {(!isFormValid || !isPhoneVerified) ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="py-10 px-6 text-center space-y-4 bg-orange-50/40 rounded-xl border border-dashed border-orange-200">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <CreditCard size={22} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h4 className="font-bold text-gray-900">Complete Previous Step</h4>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                {!isFormValid
                                    ? "Please complete and fix errors in guest details first."
                                    : "Please verify your mobile number in the previous step first."}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl font-bold border-orange-200 text-orange-700 hover:bg-orange-100"
                            onClick={() => setStep("details")}
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            Back to Guest Details
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Secure Payment Header */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                                <Shield size={20} className="text-[#10B981]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Secure Payment</h2>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-[#10B981] font-semibold">
                                        <Check size={12} /> Includes all taxes
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1 text-xs text-[#10B981] font-semibold">
                                        <Check size={12} /> No hidden charges
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Select Payment Method */}
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Select Payment Method</h3>

                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {/* Pay at Hostel */}
                            <button
                                className={cn(
                                    "relative rounded-2xl border-2 p-5 text-left transition-all duration-200",
                                    "hover:shadow-md",
                                    (bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment) && "opacity-50 pointer-events-none",
                                    paymentMethod === "on_arrival"
                                        ? "border-[#312E81] bg-[#312E81]/[0.02]"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                )}
                                disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                onClick={() => setPaymentMethod("on_arrival")}
                            >
                                {/* Radio indicator */}
                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        paymentMethod === "on_arrival" ? "border-[#312E81]" : "border-gray-300"
                                    )}>
                                        {paymentMethod === "on_arrival" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#312E81]" />
                                        )}
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-[#312E81]/10 flex items-center justify-center mb-4">
                                    <Building2 size={20} className="text-[#312E81]" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm mb-1">Pay at Hostel</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    No upfront payment required. Pay during your stay at the reception.
                                </p>
                            </button>

                            {/* Card Payment */}
                            <button
                                className={cn(
                                    "relative rounded-2xl border-2 p-5 text-left transition-all duration-200",
                                    "hover:shadow-md",
                                    (bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment) && "opacity-50 pointer-events-none",
                                    paymentMethod === "online"
                                        ? "border-[#312E81] bg-[#312E81]/[0.02]"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                )}
                                disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                onClick={() => setPaymentMethod("online")}
                            >
                                {/* Radio indicator */}
                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        paymentMethod === "online" ? "border-[#312E81]" : "border-gray-300"
                                    )}>
                                        {paymentMethod === "online" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#312E81]" />
                                        )}
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                    <CreditCard size={20} className="text-gray-600" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm mb-1">Card Payment</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Securely pay now with Visa, Mastercard, or American Express.
                                </p>
                            </button>
                        </div>

                        {/* Confirm Booking Button */}
                        <Button
                            className="w-full h-14 rounded-2xl text-base font-bold bg-[#312E81] hover:bg-[#252361] text-white transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mb-4"
                            disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                            onClick={() => {
                                if (paymentMethod === "on_arrival") {
                                    if (confirmedBookingId) {
                                        confirmPropertyPaymentMutation.mutate(confirmedBookingId);
                                    } else {
                                        bookingMutation.mutate({
                                            hostel: hostel.id,
                                            room_type: selectedRoom!.id,
                                            guest_name: form.guest_name,
                                            guest_email: form.guest_email,
                                            mobile_number: form.mobile_number,
                                            guest_age: Number.parseInt(form.guest_age),
                                            adults: Number.parseInt(form.adults),
                                            children: Number.parseInt(form.children),
                                            check_in: form.check_in.toISOString().split('T')[0],
                                            check_out: form.check_out.toISOString().split('T')[0],
                                            guests_count: Number.parseInt(form.adults) + Number.parseInt(form.children),
                                            total_price: finalTotalPrice,
                                            booking_type: "stay",
                                            stay_duration: form.stay_duration as any,
                                            payment_method: "on_arrival",
                                        }, {
                                            onSuccess: (data: any) => {
                                                confirmPropertyPaymentMutation.mutate(data.id);
                                            }
                                        });
                                    }
                                } else {
                                    if (confirmedBookingId) {
                                        handleRazorpayPayment(confirmedBookingId);
                                    } else {
                                        bookingMutation.mutate({
                                            hostel: hostel.id,
                                            room_type: selectedRoom!.id,
                                            guest_name: form.guest_name,
                                            guest_email: form.guest_email,
                                            mobile_number: form.mobile_number,
                                            guest_age: Number.parseInt(form.guest_age),
                                            adults: Number.parseInt(form.adults),
                                            children: Number.parseInt(form.children),
                                            check_in: form.check_in.toISOString().split('T')[0],
                                            check_out: form.check_out.toISOString().split('T')[0],
                                            guests_count: Number.parseInt(form.adults) + Number.parseInt(form.children),
                                            total_price: finalTotalPrice,
                                            booking_type: "stay",
                                            stay_duration: form.stay_duration as any,
                                            payment_method: "online",
                                        }, {
                                            onSuccess: (data: any) => {
                                                handleRazorpayPayment(data.id);
                                            }
                                        });
                                    }
                                }
                            }}
                        >
                            {(bookingMutation.isPending || confirmPropertyPaymentMutation.isPending || isProcessingPayment) ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                <span>
                                    {paymentMethod === "on_arrival" ? "Confirm Booking" : `Pay ₹${finalTotalPrice.toLocaleString()}`}
                                </span>
                            )}
                        </Button>

                        {/* Encryption Notice */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <Lock size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm text-gray-800">Your connection is encrypted</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    We use industry-standard SSL encryption to protect your personal data. Your financial information is never stored on our servers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back to details link */}
                    <button
                        onClick={() => setStep("details")}
                        className="text-sm text-gray-500 hover:text-[#312E81] font-semibold flex items-center gap-1 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back to Details
                    </button>
                </>
            )}
        </div>
    );
}
