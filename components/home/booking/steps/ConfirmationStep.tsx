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
                <div className="bg-[#E5DFD4] rounded-xl border border-[#D2CABC] p-8 shadow-sm">
                    <div className="py-12 px-6 text-center space-y-4 bg-[#DBD5C8]/40 rounded-xl border border-dashed border-[#D2CABC]">
                        <div className="flex justify-center">
                            <div className="w-14 h-14 bg-[#DBD5C8] rounded-full flex items-center justify-center text-[#686259]">
                                <Info size={28} />
                            </div>
                        </div>
                        <div className="space-y-1.5 max-w-xs mx-auto">
                            <h4 className="font-bold text-[#1A1916]">Previous Steps Incomplete</h4>
                            <p className="text-xs text-[#686259] leading-relaxed">
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
                            className="rounded-lg font-bold border-[#D2CABC] bg-[#EDE8DF] text-[#1A1916] hover:bg-[#DBD5C8]"
                            onClick={() => setStep(!isFormValid || !isPhoneVerified ? "details" : "payment")}
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            {!isFormValid || !isPhoneVerified ? "Go to Details" : "Go to Payment"}
                        </Button>
                    </div>
                </div>
            ) : (confirmedBookingId && (form.booking_type === "visit" || paymentMethod === "on_arrival" || isPaymentVerified || isConfirmed)) ? (
                <div className="space-y-4">
                    {/* ═══ Success Hero (Refined, Balanced & Elegant) ═══ */}
                    <div className="text-center py-4 bg-[#E5DFD4] rounded-xl border border-[#D2CABC] px-4">
                        <div className="w-11 h-11 bg-[#DBD5C8] text-[#1A1916] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#D2CABC]">
                            <CheckCircle2 size={22} strokeWidth={2.2} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1916] tracking-tight">Booking Confirmed!</h2>
                        <p className="text-xs sm:text-sm font-medium text-[#686259] mt-0.5">Your reservation has been successfully confirmed and registered.</p>
                    </div>

                    {/* ═══ Booking Details Card (Compact & Clean Border) ═══ */}
                    <div className="bg-[#E5DFD4] rounded-xl border border-[#D2CABC] shadow-sm p-5 sm:p-6">
                        {/* Confirmation Code & Status */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#D2CABC]">
                            <div>
                                <p className="text-[11px] text-[#686259] font-bold uppercase tracking-wider mb-0.5">Confirmation Code</p>
                                <p className="text-lg sm:text-xl font-black font-mono text-[#1A1916] tracking-wider">
                                    NS-{confirmedBookingId?.substring(0, 4).toUpperCase()}-{confirmedBookingId?.substring(4, 6).toUpperCase()}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DBD5C8] text-[#1A1916] border border-[#D2CABC]">
                                <span className="w-2 h-2 rounded-full bg-[#1F1E1B] animate-pulse" />
                                Confirmed
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#D2CABC]">
                            <div>
                                <p className="text-[11px] text-[#686259] font-bold uppercase tracking-wider mb-1">Primary Guest</p>
                                <p className="font-extrabold text-[#1A1916] text-sm leading-snug">{form.guest_name}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-[#686259] font-bold uppercase tracking-wider mb-1">Check-in / Out</p>
                                <p className="font-extrabold text-[#1A1916] text-sm leading-snug">{format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d, yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-[#686259] font-bold uppercase tracking-wider mb-1">Hostel</p>
                                <p className="font-extrabold text-[#1A1916] text-sm leading-snug truncate" title={hostelName}>{hostelName}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-[#686259] font-bold uppercase tracking-wider mb-1">Payment Method</p>
                                <p className="font-extrabold text-[#1A1916] text-sm leading-snug">
                                    {paymentMethod === "on_arrival" ? "Pay at Hostel" : "Paid Online"}
                                </p>
                            </div>
                        </div>

                        {/* Mini Total Row */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#DBD5C8] border border-[#D2CABC] flex items-center justify-center text-sm">🏠</div>
                                <div>
                                    <p className="font-bold text-[#1A1916] text-sm">{hostelName}</p>
                                    <p className="text-xs font-semibold text-[#686259]">All taxes & fees included</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] text-[#686259] font-bold uppercase tracking-wider">Total Amount</p>
                                <p className="text-xl sm:text-2xl font-black text-[#1A1916]">₹{finalTotalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══ QR Code Section (Compact Horizontal Card) ═══ */}
                    <div className="bg-[#E5DFD4] rounded-xl border border-[#D2CABC] shadow-sm p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-2 bg-[#EDE8DF] rounded-xl border border-[#D2CABC] flex-shrink-0">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                    `Booking ID: NS-${confirmedBookingId?.substring(0, 4).toUpperCase()}-{confirmedBookingId?.substring(4, 6).toUpperCase()}\nGuest: ${form.guest_name}\nHostel: ${hostelName}\nDates: ${format(form.check_in, "MMM d, yyyy")} - ${format(form.check_out, "MMM d, yyyy")}\nPayment: ${paymentMethod === 'on_arrival' ? 'Pay at Hostel' : 'Paid Online'}${paymentId ? `\nPayment ID: ${paymentId}` : ''}${extraCharges && extraCharges.length > 0 ? extraCharges.map(c => `\n${c.charge_type.replace('_',' ')}: ₹${c.amount}${c.description ? ` (${c.description})` : ''}`).join('') : ''}`
                                )}`}
                                alt="Booking QR Code"
                                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-[#1A1916] text-sm sm:text-base mb-0.5">Front Desk Check-in Pass</h4>
                            <p className="text-xs font-medium text-[#686259] leading-relaxed">Present this QR code on arrival at the hostel reception to complete instant check-in verification.</p>
                            <p className="text-[11px] font-bold text-[#1A1916] mt-1.5 flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-[#1F1E1B] shrink-0" /> Fast-track verification pass
                            </p>
                        </div>
                    </div>

                    {/* ═══ Extra Charges (Compact) ═══ */}
                    {extraCharges && extraCharges.length > 0 && (
                        <div className="bg-[#DBD5C8]/50 border border-[#D2CABC] rounded-xl p-4">
                            <p className="text-[11px] text-[#1A1916] font-bold uppercase tracking-wider mb-2">Extra Charges (billed separately by property)</p>
                            {extraCharges.map((charge, i) => (
                                <div
                                    key={charge.id ?? i}
                                    className={`flex justify-between items-center py-1.5 ${i !== extraCharges.length - 1 ? 'border-b border-[#D2CABC]' : ''}`}
                                >
                                    <span className="text-xs font-bold text-[#1A1916] capitalize">
                                        {charge.charge_type.replace('_', ' ')}
                                        {charge.description && <span className="font-normal text-[#686259] ml-1">({charge.description})</span>}
                                    </span>
                                    <span className="text-xs font-black text-[#1A1916]">
                                        ₹{Number(charge.amount).toLocaleString()}
                                        <span className="text-[10px] font-semibold text-[#686259]">/mo</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ═══ Action Buttons (Refined, Balanced & Elegant) ═══ */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                            type="button"
                            className="h-11 rounded-xl bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                            onClick={() => router.push("/home")}
                        >
                            <Search size={15} />
                            <span>Browse Hostels</span>
                        </button>
                        <button
                            type="button"
                            className="h-11 rounded-xl bg-[#EDE8DF] hover:bg-[#DBD5C8] border border-[#D2CABC] text-[#1A1916] font-semibold text-xs sm:text-sm transition-all duration-200 shadow-2xs active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                            onClick={resetBooking}
                        >
                            <RotateCcw size={15} />
                            <span>Book Again</span>
                        </button>
                    </div>

                    {/* ═══ Email Notice (Soft & Clean) ═══ */}
                    <div className="text-center pt-1 pb-1">
                        <p className="text-xs sm:text-sm font-medium text-[#686259] flex items-center justify-center gap-1.5">
                            <Mail size={15} className="text-[#1F1E1B]" />
                            Confirmation details & invoice sent to <strong className="text-[#1A1916] font-semibold underline">{form.guest_email}</strong>
                        </p>
                    </div>

                    {/* ═══ Quick Links ═══ */}
                    <div className="flex items-center justify-center gap-6 pt-1 pb-2">
                        <button className="text-xs font-bold text-[#1A1916] hover:underline underline-offset-2 flex items-center gap-1 transition-colors">
                            <FileText size={13} /> Download Invoice
                        </button>
                        <button className="text-xs font-bold text-[#1A1916] hover:underline underline-offset-2 flex items-center gap-1 transition-colors">
                            <CalendarPlus size={13} /> Add to Calendar
                        </button>
                        <button className="text-xs font-bold text-[#1A1916] hover:underline underline-offset-2 flex items-center gap-1 transition-colors">
                            <Headphones size={13} /> Contact Support
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
