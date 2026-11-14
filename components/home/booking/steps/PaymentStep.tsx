"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CreditCard, ChevronLeft, CheckCircle2, Loader2, Shield, Building2, Lock, Check, MessageSquareQuote } from "lucide-react";
import { format } from "date-fns";
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
    setForm?: (f: any) => void;
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
    isEmailVerified?: boolean;
    onRequireEmailOtp?: () => void;
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
    setForm,
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
    bookingStatus,
    isEmailVerified,
    onRequireEmailOtp
}: PaymentStepProps) {
    const isConfirmed = bookingStatus === "confirmed";

    if (step !== "payment") return null;

    return (
        <div className={cn(
            "transition-all duration-500",
            isConfirmed && "opacity-60 pointer-events-none"
        )}>
            {(!isFormValid || !isPhoneVerified) ? (
                <div className="bg-[#E5DFD4] rounded-xl border border-[#D2CABC] p-8 shadow-sm">
                    <div className="py-10 px-6 text-center space-y-4 bg-[#DBD5C8]/40 rounded-xl border border-dashed border-[#D2CABC]">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 bg-[#DBD5C8] rounded-full flex items-center justify-center text-[#1A1916]">
                                <CreditCard size={22} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h4 className="font-bold text-[#1A1916]">Complete Previous Step</h4>
                            <p className="text-xs text-[#686259] max-w-xs mx-auto">
                                {!isFormValid
                                    ? "Please complete and fix errors in guest details first."
                                    : "Please verify your mobile number in the previous step first."}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg font-bold border-[#D2CABC] bg-[#EDE8DF] text-[#1A1916] hover:bg-[#DBD5C8]"
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
                    <div className="bg-[#E5DFD4] rounded-xl border border-[#D2CABC] p-6 sm:p-8 mb-6 shadow-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-[#DBD5C8] flex items-center justify-center flex-shrink-0 text-[#1F1E1B]">
                                <Shield size={20} className="text-[#1F1E1B]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1A1916] tracking-tight">Secure Payment</h2>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-[#1A1916] font-semibold">
                                        <Check size={12} /> Includes all taxes
                                    </span>
                                    <span className="text-[#D2CABC]">•</span>
                                    <span className="flex items-center gap-1 text-xs text-[#1A1916] font-semibold">
                                        <Check size={12} /> No hidden charges
                                    </span>
                                    {isEmailVerified && (
                                        <>
                                            <span className="text-[#D2CABC]">•</span>
                                            <span className="flex items-center gap-1 text-xs text-[#1A1916] font-bold">
                                                <CheckCircle2 size={12} /> Email verified
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Select Payment Method */}
                        <h3 className="text-sm font-bold text-[#1A1916] mb-4">Select Payment Method</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {/* Pay at Hostel */}
                            <button
                                className={cn(
                                    "relative rounded-xl border-2 p-5 text-left transition-all duration-200",
                                    "hover:shadow-md",
                                    (bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment) && "opacity-50 pointer-events-none",
                                    paymentMethod === "on_arrival"
                                        ? "border-[#1F1E1B] bg-[#DBD5C8]/50"
                                        : "border-[#D2CABC] bg-[#EDE8DF] hover:border-[#1F1E1B]/50"
                                )}
                                disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                onClick={() => setPaymentMethod("on_arrival")}
                            >
                                {/* Radio indicator */}
                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        paymentMethod === "on_arrival" ? "border-[#1F1E1B]" : "border-[#D2CABC]"
                                    )}>
                                        {paymentMethod === "on_arrival" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#1F1E1B]" />
                                        )}
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-lg bg-[#DBD5C8] flex items-center justify-center mb-4 text-[#1F1E1B]">
                                    <Building2 size={20} className="text-[#1F1E1B]" />
                                </div>
                                <p className="font-bold text-[#1A1916] text-sm mb-1">Pay at Hostel</p>
                                <p className="text-xs text-[#686259] leading-relaxed">
                                    No upfront payment required. Pay during your stay at the reception.
                                </p>
                            </button>

                            {/* Card Payment */}
                            <button
                                className={cn(
                                    "relative rounded-xl border-2 p-5 text-left transition-all duration-200",
                                    "hover:shadow-md",
                                    (bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment) && "opacity-50 pointer-events-none",
                                    paymentMethod === "online"
                                        ? "border-[#1F1E1B] bg-[#DBD5C8]/50"
                                        : "border-[#D2CABC] bg-[#EDE8DF] hover:border-[#1F1E1B]/50"
                                )}
                                disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                onClick={() => setPaymentMethod("online")}
                            >
                                {/* Radio indicator */}
                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        paymentMethod === "online" ? "border-[#1F1E1B]" : "border-[#D2CABC]"
                                    )}>
                                        {paymentMethod === "online" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#1F1E1B]" />
                                        )}
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-lg bg-[#DBD5C8] flex items-center justify-center mb-4 text-[#1F1E1B]">
                                    <CreditCard size={20} className="text-[#1F1E1B]" />
                                </div>
                                <p className="font-bold text-[#1A1916] text-sm mb-1">Card Payment</p>
                                <p className="text-xs text-[#686259] leading-relaxed">
                                    Securely pay now with Visa, Mastercard, or American Express.
                                </p>
                            </button>
                        </div>

                        {/* Message to Property Owner */}
                        <div className="mb-5 p-4 rounded-lg border border-[#D2CABC] bg-[#EDE8DF]">
                            <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="special-request" className="text-xs font-bold text-[#1A1916] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                                    <MessageSquareQuote size={15} className="text-[#1F1E1B]" />
                                    Message for Hostel Owner <span className="text-[10px] font-normal lowercase text-[#686259]">(optional)</span>
                                </Label>
                                <span className="text-[10px] font-semibold text-[#7A746B]">Forwarded to owner</span>
                            </div>
                            <Textarea
                                id="special-request"
                                rows={2}
                                value={form.special_request || form.message_to_owner || ""}
                                onChange={(e) => {
                                    if (setForm) {
                                        setForm({ ...form, special_request: e.target.value, message_to_owner: e.target.value });
                                    } else {
                                        form.special_request = e.target.value;
                                        form.message_to_owner = e.target.value;
                                    }
                                }}
                                disabled={isConfirmed || bookingMutation.isPending || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                placeholder="Add any special requests, estimated arrival time, or notes for the hostel owner..."
                                className="min-h-[64px] rounded-lg border border-[#D2CABC] hover:border-[#1F1E1B]/50 bg-[#EDE8DF] focus:border-[#1F1E1B] focus:ring-2 focus:ring-[#1F1E1B]/15 text-xs sm:text-sm text-[#1A1916] placeholder:text-[#7A746B] p-3 resize-none transition-all"
                            />
                        </div>

                        {/* Confirm Booking Button */}
                        <Button
                            className="w-full h-14 rounded-xl text-base font-bold bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] transition-all shadow-md hover:shadow-lg active:scale-[0.98] mb-4"
                            disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                            onClick={() => {
                                if (!isEmailVerified) {
                                    onRequireEmailOtp?.();
                                    return;
                                }

                                const checkInFormatted = format(form.check_in, "yyyy-MM-dd");
                                const checkOutFormatted = format(form.check_out, "yyyy-MM-dd");

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
                                            check_in: checkInFormatted,
                                            check_out: checkOutFormatted,
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
                                            check_in: checkInFormatted,
                                            check_out: checkOutFormatted,
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
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#DBD5C8]/50 border border-[#D2CABC]">
                            <Lock size={18} className="text-[#686259] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm text-[#1A1916]">Your connection is encrypted</p>
                                <p className="text-xs text-[#686259] mt-0.5 leading-relaxed">
                                    We use industry-standard SSL encryption to protect your personal data. Your financial information is never stored on our servers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back to details link */}
                    <button
                        onClick={() => setStep("details")}
                        className="text-sm text-[#686259] hover:text-[#1A1916] font-semibold flex items-center gap-1 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back to Details
                    </button>
                </>
            )}
        </div>
    );
}
