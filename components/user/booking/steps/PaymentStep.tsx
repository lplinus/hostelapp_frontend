"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, ChevronLeft, CheckCircle2, Loader2, Shield, Building2 } from "lucide-react";
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
        <Card className={cn(
            "border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 bg-white rounded-2xl",
            isConfirmed && "bg-gray-50/50 border-gray-100"
        )}>
            {/* Step Header */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#312E81]/10 flex items-center justify-center">
                        <CreditCard size={16} className="text-[#312E81]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                        <p className="text-xs text-gray-500">Choose how you'd like to pay for your booking</p>
                    </div>
                </div>
            </div>

            <CardContent className="space-y-5 pt-2 px-6 pb-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                {(!isFormValid || !isPhoneVerified) ? (
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
                ) : (
                    <>
                        {/* Security Notice */}
                        <div className="p-4 bg-[#312E81]/5 rounded-xl flex gap-3 items-start">
                            <Shield className="shrink-0 mt-0.5 text-[#312E81]" size={18} />
                            <div>
                                <p className="font-bold text-sm text-[#312E81]">Safe & Secure Payment</p>
                                <p className="text-xs text-gray-500 mt-0.5">Your payment information is encrypted and secure. Choose your preferred method below.</p>
                            </div>
                        </div>

                        {/* Total Amount Display */}
                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hostel Price</p>
                                    <p className="text-lg font-bold text-gray-900">₹{totalPrice.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Booking Fee</p>
                                    <p className="text-lg font-bold text-[#312E81]">₹{bookingFee}</p>
                                </div>
                            </div>
                            <Separator className="bg-gray-200/50" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Amount</p>
                                    <p className="text-2xl font-black text-[#312E81]">₹{finalTotalPrice.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-medium">Including all taxes</p>
                                    <p className="text-[10px] text-[#10B981] font-bold">No hidden charges</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-3">
                            {/* Pay Online */}
                            <button
                                className={cn(
                                    "w-full group rounded-xl border-2 p-4 flex items-center gap-4 transition-all duration-200 text-left",
                                    "hover:border-[#312E81]/30 hover:bg-[#312E81]/5",
                                    (bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment) && "opacity-50 pointer-events-none",
                                    "border-gray-200 bg-white"
                                )}
                                disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                onClick={() => {
                                    setPaymentMethod("online");
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
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                                    {isProcessingPayment && paymentMethod === "online" ? (
                                        <Loader2 size={20} className="animate-spin text-orange-600" />
                                    ) : (
                                        <CreditCard size={20} className="text-orange-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm">
                                        {isProcessingPayment && paymentMethod === "online" ? "Processing..." : `Pay Now (₹${bookingFee})`}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Confirm booking with ₹{bookingFee} only • Pay balance at hostel</p>
                                </div>
                                <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CreditCard size={16} />
                                </div>
                            </button>

                            {/* Pay at Hostel */}
                            <button
                                className={cn(
                                    "w-full group rounded-xl border-2 p-4 flex items-center gap-4 transition-all duration-200 text-left",
                                    "hover:border-gray-400/30 hover:bg-gray-50",
                                    (bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment) && "opacity-50 pointer-events-none",
                                    "border-gray-200 bg-white"
                                )}
                                disabled={bookingMutation.isPending || isPaymentVerified || isConfirmed || confirmPropertyPaymentMutation.isPending || isProcessingPayment}
                                onClick={() => {
                                    setPaymentMethod("on_arrival");
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
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                                    {(confirmPropertyPaymentMutation.isPending || (isProcessingPayment && paymentMethod === "on_arrival")) ? (
                                        <Loader2 size={20} className="animate-spin text-gray-700" />
                                    ) : (
                                        <Building2 size={20} className="text-gray-700" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm">
                                        {(confirmPropertyPaymentMutation.isPending || (isProcessingPayment && paymentMethod === "on_arrival")) ? "Processing..." : "Pay at Hostel"}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Pay ₹{finalTotalPrice.toLocaleString()} at arrival • No payment now</p>
                                </div>
                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 size={16} />
                                </div>
                            </button>
                        </div>

                        {/* Back to details link */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={() => setStep("details")}
                                className="text-xs text-gray-500 hover:text-[#312E81] font-semibold flex items-center gap-1 transition-colors"
                            >
                                <ChevronLeft size={14} />
                                Back to Details
                            </button>
                            <p className="text-[9px] text-gray-400 font-medium text-right max-w-[200px]">
                                By selecting either option, you agree to our booking policies.
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
