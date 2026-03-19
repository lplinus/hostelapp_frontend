"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step } from "../booking-container";
import type { HostelDetail } from "@/types/hostel.types";

interface PaymentStepProps {
    step: Step;
    setStep: (s: Step) => void;
    confirmedBookingId: string | null;
    totalPrice: number;
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
}

export function PaymentStep({
    step,
    setStep,
    confirmedBookingId,
    totalPrice,
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
    confirmPropertyPaymentMutation
}: PaymentStepProps) {
    return (
        <Card className="border-2 border-gray-200 shadow-none overflow-hidden transition-all duration-300 bg-white rounded-3xl">
            <CardHeader
                className="bg-white border-none cursor-pointer p-2 hover:bg-gray-50/80 rounded-2xl transition-all"
                onClick={() => {
                    if (step === "payment") {
                        setStep(null);
                        return;
                    }
                    
                    if (!isFormValid) {
                        validateForm();
                        setStep("details");
                        return;
                    }

                    if (!isPhoneVerified) {
                        setStep("details");
                        return;
                    }

                    setStep("payment");
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", isPaymentVerified ? "bg-green-100 text-green-600" : step === "payment" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500")}>
                            {isPaymentVerified ? <CheckCircle2 size={16} /> : "2"}
                        </div>
                        <div>
                            <CardTitle className="text-xl text-gray-900 font-bold">Add a payment method</CardTitle>
                            {isPaymentVerified && (
                                <p className="text-[10px] text-green-600 font-bold uppercase mt-1 tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                    Payment Successful • Paid
                                </p>
                            )}
                        </div>
                    </div>
                    <ChevronRight className={cn("h-5 w-5 text-black transition-transform duration-300", step === "payment" ? "rotate-90" : "")} />
                </div>
            </CardHeader>
            {step === "payment" && (
                <CardContent className="space-y-6 pt-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {(!isFormValid || !isPhoneVerified) ? (
                        <div className="py-8 px-6 text-center space-y-4 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                    <CreditCard size={24} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900">Step Incomplete</h4>
                                <p className="text-xs text-muted-foreground">
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
                                Back to Step 1
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-blue-50/30 text-blue-700 rounded-2xl flex gap-3 text-sm">
                                <CreditCard className="shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="font-bold">Safe & Secure Payment</p>
                                    <p className="text-gray-500">You will be redirected to Razorpay's secure checkout to complete your booking.</p>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button
                                        className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 h-16 text-sm font-bold shadow-lg shadow-orange-100 flex flex-col items-center justify-center gap-0.5 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                                                    total_price: totalPrice,
                                                    booking_type: "stay",
                                                    stay_duration: form.stay_duration as any,
                                                }, {
                                                    onSuccess: (data: any) => {
                                                        handleRazorpayPayment(data.id);
                                                    }
                                                });
                                            }
                                        }}
                                        disabled={bookingMutation.isPending || isPaymentVerified || confirmPropertyPaymentMutation.isPending}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={18} />
                                            <span>Pay Online</span>
                                        </div>
                                        <span className="text-[10px] opacity-80">Razorpay Secure</span>
                                    </Button>

                                    <Button
                                        className="w-full rounded-2xl bg-gray-900 hover:bg-black h-16 text-sm font-bold shadow-lg shadow-gray-100 flex flex-col items-center justify-center gap-0.5 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                                                    total_price: totalPrice,
                                                    booking_type: "stay",
                                                    stay_duration: form.stay_duration as any,
                                                }, {
                                                    onSuccess: (data: any) => {
                                                        confirmPropertyPaymentMutation.mutate(data.id);
                                                    }
                                                });
                                            }
                                        }}
                                        disabled={bookingMutation.isPending || isPaymentVerified || confirmPropertyPaymentMutation.isPending}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={18} />
                                            <span>Pay at Hostel</span>
                                        </div>
                                        <span className="text-[10px] opacity-80">Skip Payment Now</span>
                                    </Button>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Total Amount: <span className="text-gray-900 font-bold">₹{totalPrice.toLocaleString()}</span>
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-medium leading-tight">
                                        By selecting either option, you agree to our booking policies and local regulations.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
