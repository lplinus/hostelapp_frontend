"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, User, Mail, Phone, Activity, Calendar as CalendarIcon, Users, Baby, Clock, ArrowRight } from "lucide-react";
import { format, addDays, parseISO, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import type { Step } from "../booking-container";

interface BookingDetailsStepProps {
    step: Step;
    setStep: (s: Step) => void;
    form: any;
    setForm: (f: any) => void;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    nights: number;
    termsAccepted: boolean;
    setTermsAccepted: (t: boolean) => void;
    termsError: boolean;
    setTermsError: (t: boolean) => void;
    openLegalDocument: (type: 'terms' | 'privacy', e: React.MouseEvent) => void;
    handleNext: () => void;
    isPhoneVerified: boolean;
    bookingStatus: "pending" | "confirmed";
    cooldownRemaining: number | null;
    formatCooldown: (s: number) => string;
}

export function BookingDetailsStep({
    step,
    setStep,
    form,
    setForm,
    errors,
    setErrors,
    nights,
    termsAccepted,
    setTermsAccepted,
    termsError,
    setTermsError,
    openLegalDocument,
    handleNext,
    isPhoneVerified,
    bookingStatus,
    cooldownRemaining,
    formatCooldown
}: BookingDetailsStepProps) {
    const isConfirmed = bookingStatus === "confirmed";

    if (step !== "details") return null;

    return (
        <div className={cn(
            "transition-all duration-500",
            isConfirmed && "opacity-60 pointer-events-none"
        )}>
            {/* ═══ Section 1: Guest Information ═══ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Guest Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Please enter the details of the primary guest.</p>
                </div>

                <div className="space-y-5">
                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Julianne Moore"
                                value={form.guest_name}
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                onChange={(e) => {
                                    setForm({ ...form, guest_name: e.target.value });
                                    if (errors.guest_name) setErrors(prev => ({ ...prev, guest_name: "" }));
                                }}
                                className={cn(
                                    "h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#312E81] focus:ring-[#312E81]/20 transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                                    errors.guest_name && "border-red-400 bg-red-50/30"
                                )}
                            />
                            {errors.guest_name && <p className="text-[11px] text-red-500 font-medium">{errors.guest_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="julianne@example.com"
                                value={form.guest_email}
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                onChange={(e) => {
                                    setForm({ ...form, guest_email: e.target.value });
                                    if (errors.guest_email) setErrors(prev => ({ ...prev, guest_email: "" }));
                                }}
                                className={cn(
                                    "h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#312E81] focus:ring-[#312E81]/20 transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                                    errors.guest_email && "border-red-400 bg-red-50/30"
                                )}
                            />
                            {errors.guest_email && <p className="text-[11px] text-red-500 font-medium">{errors.guest_email}</p>}
                        </div>
                    </div>

                    {/* Mobile & Age */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Number</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={form.mobile_number}
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (!val.startsWith("+91")) {
                                        val = "+91" + val.replace(/^\+?91?/, "");
                                    }
                                    setForm({ ...form, mobile_number: val });
                                    if (errors.mobile_number) setErrors(prev => ({ ...prev, mobile_number: "" }));
                                }}
                                className={cn(
                                    "h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#312E81] focus:ring-[#312E81]/20 transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                                    errors.mobile_number && "border-red-400 bg-red-50/30"
                                )}
                            />
                            {errors.mobile_number && <p className="text-[11px] text-red-500 font-medium">{errors.mobile_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="24"
                                value={form.guest_age}
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                onChange={(e) => {
                                    setForm({ ...form, guest_age: e.target.value });
                                    if (errors.guest_age) setErrors(prev => ({ ...prev, guest_age: "" }));
                                }}
                                className={cn(
                                    "h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#312E81] focus:ring-[#312E81]/20 transition-all text-gray-900 font-medium",
                                    errors.guest_age && "border-red-400 bg-red-50/30"
                                )}
                            />
                            {errors.guest_age && <p className="text-[11px] text-red-500 font-medium">{errors.guest_age}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Section 2: Stay Details ═══ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Stay Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Select your arrival and departure schedule.</p>
                </div>

                {/* Check-in / Check-out / Duration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden mb-4">
                    <div className="p-4 sm:border-r border-b sm:border-b-0 border-gray-200">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Check-in</p>
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-gray-400 flex-shrink-0" />
                            <Input
                                type="date"
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                value={format(form.check_in, "yyyy-MM-dd")}
                                onChange={(e) => setForm({ ...form, check_in: parseISO(e.target.value) })}
                                min={format(new Date(), "yyyy-MM-dd")}
                                className="border-none bg-transparent font-semibold text-sm p-0 h-auto focus-visible:ring-0 text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="p-4 sm:border-r border-b sm:border-b-0 border-gray-200">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Check-out</p>
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-gray-400 flex-shrink-0" />
                            <Input
                                type="date"
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                value={format(form.check_out, "yyyy-MM-dd")}
                                onChange={(e) => {
                                    setForm({ ...form, check_out: parseISO(e.target.value) });
                                    if (errors.dates) setErrors(prev => ({ ...prev, dates: "" }));
                                }}
                                min={format(addDays(form.check_in, 1), "yyyy-MM-dd")}
                                className={cn(
                                    "border-none bg-transparent font-semibold text-sm p-0 h-auto focus-visible:ring-0",
                                    errors.dates ? "text-red-500" : "text-gray-900"
                                )}
                            />
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Duration</p>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="font-semibold text-sm text-gray-900">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                        </div>
                    </div>
                </div>
                {errors.dates && <p className="text-[11px] text-red-500 font-medium mb-3">{errors.dates}</p>}

                {/* Duration Selector */}
                {form.booking_type === "stay" && (
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Preferred Duration (Optional)</Label>
                        <Select
                            value={form.stay_duration}
                            disabled={isConfirmed}
                            onValueChange={(v) => {
                                let newCheckOut = form.check_out;
                                const checkIn = form.check_in;

                                if (v === "1_month") newCheckOut = addMonths(checkIn, 1);
                                else if (v === "2_months") newCheckOut = addMonths(checkIn, 2);
                                else if (v === "3_months") newCheckOut = addMonths(checkIn, 3);
                                else if (v === "4_months") newCheckOut = addMonths(checkIn, 4);
                                else if (v === "5_months") newCheckOut = addMonths(checkIn, 5);
                                else if (v === "gt_5_months") newCheckOut = addMonths(checkIn, 6);

                                setForm({ ...form, stay_duration: v, check_out: newCheckOut });
                                if (errors.dates) setErrors(prev => ({ ...prev, dates: "" }));
                            }}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50">
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Custom Dates</SelectItem>
                                <SelectItem value="1_month">1 Month</SelectItem>
                                <SelectItem value="2_months">2 Months</SelectItem>
                                <SelectItem value="3_months">3 Months</SelectItem>
                                <SelectItem value="4_months">4 Months</SelectItem>
                                <SelectItem value="5_months">5 Months</SelectItem>
                                <SelectItem value="gt_5_months">More than 5 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* ═══ Section 3: Preferences ═══ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Preferences</h2>
                    <p className="text-sm text-gray-500 mt-1">How many people are coming with you?</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Adults</p>
                            <p className="text-xs text-gray-400">Ages 13 or above</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, adults: (Math.max(1, Number(form.adults) - 1)).toString() })}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#312E81] hover:text-[#312E81] transition-all active:scale-90 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                −
                            </button>
                            <span className="text-base font-bold text-gray-900 min-w-[20px] text-center tabular-nums">{form.adults}</span>
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, adults: (Math.min(20, Number(form.adults) + 1)).toString() })}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#312E81] hover:text-[#312E81] transition-all active:scale-90 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Children</p>
                            <p className="text-xs text-gray-400">Ages 2 to 12</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, children: (Math.max(0, Number(form.children) - 1)).toString() })}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#312E81] hover:text-[#312E81] transition-all active:scale-90 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                −
                            </button>
                            <span className="text-base font-bold text-gray-900 min-w-[20px] text-center tabular-nums">{form.children}</span>
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, children: (Math.min(20, Number(form.children) + 1)).toString() })}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#312E81] hover:text-[#312E81] transition-all active:scale-90 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Checkboxes & CTA ═══ */}
            <div className="space-y-4 mb-2">
                {/* Confirm booking */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="confirm_booking"
                        disabled={isConfirmed}
                        checked={form.confirm_booking}
                        onChange={(e) => {
                            setForm({ ...form, confirm_booking: e.target.checked });
                            if (errors.confirm_booking) setErrors(prev => ({ ...prev, confirm_booking: "" }));
                        }}
                        className={cn(
                            "mt-0.5 w-[18px] h-[18px] rounded border-gray-300 text-[#312E81] focus:ring-[#312E81] accent-[#312E81] cursor-pointer",
                            errors.confirm_booking && "border-red-500 ring-2 ring-red-100"
                        )}
                    />
                    <div>
                        <label htmlFor="confirm_booking" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                            I confirm that all provided information is accurate and matches my legal identification.
                        </label>
                        {errors.confirm_booking && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.confirm_booking}</p>
                        )}
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="terms"
                        disabled={isConfirmed}
                        checked={termsAccepted}
                        onChange={(e) => {
                            setTermsAccepted(e.target.checked);
                            if (e.target.checked) setTermsError(false);
                        }}
                        className="mt-0.5 w-[18px] h-[18px] rounded border-gray-300 text-[#312E81] focus:ring-[#312E81] accent-[#312E81] cursor-pointer"
                    />
                    <div>
                        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                            I have read and agree to the{" "}
                            <button type="button" disabled={isConfirmed} onClick={(e) => openLegalDocument('terms', e)} className="text-[#312E81] hover:underline font-semibold">Terms of Service</button>
                            {" "}and{" "}
                            <button type="button" disabled={isConfirmed} onClick={(e) => openLegalDocument('privacy', e)} className="text-[#312E81] hover:underline font-semibold">Cancellation Policy</button>.
                        </label>
                        {termsError && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1">Please accept terms and conditions to proceed</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Continue Button */}
            {!isConfirmed && (
                <Button
                    onClick={handleNext}
                    disabled={cooldownRemaining !== null && cooldownRemaining > 0}
                    className={cn(
                        "w-full h-14 rounded-2xl text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] mt-6",
                        cooldownRemaining !== null && cooldownRemaining > 0
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-[#312E81] hover:bg-[#252361] text-white"
                    )}
                >
                    {cooldownRemaining !== null && cooldownRemaining > 0 ? (
                        <span>Cooldown: {formatCooldown(cooldownRemaining)}</span>
                    ) : (
                        <span className="flex items-center gap-2">
                            {form.booking_type === "visit" ? "Send Visit Request" : "Continue to Payment"}
                            <ArrowRight size={18} />
                        </span>
                    )}
                </Button>
            )}
        </div>
    );
}
