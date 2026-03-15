"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Step } from "../booking-container";

interface ConfirmationStepProps {
    step: Step;
    setStep: (s: Step) => void;
    confirmedBookingId: string | null;
    form: any;
    totalPrice: number;
    hostelName: string;
    router: any;
}

export function ConfirmationStep({
    step,
    setStep,
    confirmedBookingId,
    form,
    totalPrice,
    hostelName,
    router
}: ConfirmationStepProps) {
    return (
        <Card className="border-2 border-gray-200 shadow-none overflow-hidden transition-all duration-300 bg-white rounded-3xl">
            <CardHeader
                className="bg-white border-none cursor-pointer p-2 hover:bg-gray-50/80 rounded-2xl transition-all"
                onClick={() => setStep(step === "confirmation" ? null : "confirmation")}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step === "confirmation" ? "bg-green-600 text-white" : confirmedBookingId ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500")}>
                            {confirmedBookingId && step !== "confirmation" ? <CheckCircle2 size={16} /> : "3"}
                        </div>
                        <CardTitle className="text-xl text-gray-900 font-bold">Confirmation & QR Code</CardTitle>
                    </div>
                    <ChevronRight className={cn("h-5 w-5 text-black transition-transform duration-300", step === "confirmation" ? "rotate-90" : "")} />
                </div>
            </CardHeader>
            {step === "confirmation" && (
                <CardContent className="space-y-6 pt-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {confirmedBookingId ? (
                        <>
                            <div className="text-center space-y-4 mb-4">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                        <CheckCircle2 size={32} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Your request has been sent to <strong>{hostelName}</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-left text-gray-700">
                                        <div className="text-gray-400 font-bold uppercase tracking-wider">Booking ID</div>
                                        <div className="font-bold text-right font-mono text-blue-600 text-sm">STN-{confirmedBookingId?.substring(0, 8).toUpperCase()}</div>
                                        <div className="text-gray-400 font-bold uppercase tracking-wider">Guest</div>
                                        <div className="font-semibold text-right">{form.guest_name}</div>
                                        <div className="text-gray-400 font-bold uppercase tracking-wider">Dates</div>
                                        <div className="font-semibold text-right">{format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d")}</div>
                                        <div className="text-gray-400 font-bold uppercase tracking-wider">Total Price</div>
                                        <div className="font-bold text-right text-green-600 text-sm">₹{totalPrice.toLocaleString()}</div>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Booking ID: STN-${confirmedBookingId?.substring(0, 8).toUpperCase()}\nGuest: ${form.guest_name}\nHostel: ${hostelName}\nBOOKING:${confirmedBookingId}`)}`}
                                            alt="Booking QR Code"
                                            className="w-24 h-24"
                                        />
                                        <span className="text-[8px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Scan to verify</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => router.push("/home")}>Browse Hostels</Button>
                                <Button className="flex-1 rounded-xl h-12 bg-blue-600 font-bold shadow-md shadow-blue-100" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 px-6 text-center space-y-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <div className="flex justify-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <Info size={28} />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-xs mx-auto">
                                <h4 className="font-bold text-gray-900">No Confirmation Yet</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Complete your guest details and process the mock payment to receive your booking ID and QR code.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 font-bold hover:bg-blue-50"
                                onClick={() => setStep("details")}
                            >
                                Start with Details
                            </Button>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
