"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, User, Mail, Users, Baby, Phone, Activity, Calendar as CalendarIcon } from "lucide-react";
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
        <Card className={cn(
            "border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 bg-white rounded-2xl",
            isConfirmed && "bg-gray-50/50 border-gray-100"
        )}>
            {/* Step Header */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#312E81]/10 flex items-center justify-center">
                        <User size={16} className="text-[#312E81]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Guest Information</h2>
                        <p className="text-xs text-gray-500">Fill in the details of the guest staying at the hostel</p>
                    </div>
                </div>
            </div>

            <CardContent className="space-y-5 pt-2 px-6 pb-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                {/* Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                            <User size={13} className="text-[#312E81]" /> Full Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={form.guest_name}
                            disabled={isConfirmed}
                            readOnly={isConfirmed}
                            onChange={(e) => {
                                setForm({ ...form, guest_name: e.target.value });
                                if (errors.guest_name) setErrors(prev => ({ ...prev, guest_name: "" }));
                            }}
                            className={cn(
                                "h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-[#312E81] transition-all placeholder:text-gray-400",
                                errors.guest_name ? "border-red-400 focus:ring-red-400 bg-red-50/30" : form.guest_name.length > 2 ? "border-emerald-300 bg-emerald-50/20" : "",
                                isConfirmed && "bg-gray-100 border-gray-200 text-gray-500 opacity-80 cursor-not-allowed"
                            )}
                        />
                        {errors.guest_name && <p className="text-[10px] text-red-500 font-semibold mt-0.5 ml-1">{errors.guest_name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                            <Mail size={13} className="text-[#312E81]" /> Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.guest_email}
                            disabled={isConfirmed}
                            readOnly={isConfirmed}
                            onChange={(e) => {
                                setForm({ ...form, guest_email: e.target.value });
                                if (errors.guest_email) setErrors(prev => ({ ...prev, guest_email: "" }));
                            }}
                            className={cn(
                                "h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-[#312E81] transition-all placeholder:text-gray-400",
                                errors.guest_email ? "border-red-400 focus:ring-red-400 bg-red-50/30" : form.guest_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email) ? "border-emerald-300 bg-emerald-50/20" : "",
                                isConfirmed && "bg-gray-100 border-gray-200 text-gray-500 opacity-80 cursor-not-allowed"
                            )}
                        />
                        {errors.guest_email && <p className="text-[10px] text-red-500 font-semibold mt-0.5 ml-1">{errors.guest_email}</p>}
                    </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                    <Label htmlFor="mobile" className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                        <Phone size={13} className="text-[#312E81]" /> Mobile Number
                    </Label>
                    <Input
                        id="mobile"
                        type="tel"
                        placeholder="+91 9876543210"
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
                            "h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-[#312E81] transition-all placeholder:text-gray-400",
                            errors.mobile_number ? "border-red-400 focus:ring-red-400 bg-red-50/30" : form.mobile_number && /^\+?[\d\s-]{10,}$/.test(form.mobile_number) ? "border-emerald-300 bg-emerald-50/20" : "",
                            isConfirmed && "bg-gray-100 border-gray-200 text-gray-500 opacity-80 cursor-not-allowed"
                        )}
                    />
                    {errors.mobile_number && <p className="text-[10px] text-red-500 font-semibold mt-0.5 ml-1">{errors.mobile_number}</p>}
                </div>

                {/* Age, Adults, Children Row */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="age" className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                            <Activity size={13} className="text-[#312E81]" /> Age
                        </Label>
                        <Input
                            id="age"
                            type="number"
                            value={form.guest_age}
                            disabled={isConfirmed}
                            readOnly={isConfirmed}
                            onChange={(e) => {
                                setForm({ ...form, guest_age: e.target.value });
                                if (errors.guest_age) setErrors(prev => ({ ...prev, guest_age: "" }));
                            }}
                            className={cn(
                                "h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-[#312E81] transition-all",
                                errors.guest_age ? "border-red-400 focus:ring-red-400 bg-red-50/30" : (Number(form.guest_age) >= 10 && Number(form.guest_age) <= 100) ? "border-emerald-300 bg-emerald-50/20" : "",
                                isConfirmed && "bg-gray-100 border-gray-200 text-gray-500 opacity-80 cursor-not-allowed"
                            )}
                        />
                        {errors.guest_age && <p className="text-[10px] text-red-500 font-semibold mt-0.5 ml-1">{errors.guest_age}</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                        <Label htmlFor="adults" className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                            <Users size={13} className="text-[#312E81]" /> Adults
                        </Label>
                        <div className={cn(
                            "flex items-center justify-between h-11 px-2 border border-gray-200 rounded-xl bg-gray-50/50",
                            isConfirmed && "bg-gray-100 opacity-80 cursor-not-allowed"
                        )}>
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, adults: (Math.max(1, Number(form.adults) - 1)).toString() })}
                                className={cn(
                                    "w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-[#312E81] hover:text-white hover:border-[#312E81] transition-all active:scale-95 text-sm font-bold",
                                    isConfirmed && "cursor-not-allowed opacity-50 hover:bg-white hover:text-inherit hover:border-gray-100"
                                )}
                            >
                                -
                            </button>
                            <span className="text-sm font-black text-gray-900 mx-2">{form.adults}</span>
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, adults: (Math.min(20, Number(form.adults) + 1)).toString() })}
                                className={cn(
                                    "w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-[#312E81] hover:text-white hover:border-[#312E81] transition-all active:scale-95 text-sm font-bold",
                                    isConfirmed && "cursor-not-allowed opacity-50 hover:bg-white hover:text-inherit hover:border-gray-100"
                                )}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                        <Label htmlFor="children" className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                            <Baby size={13} className="text-[#312E81]" /> Children
                        </Label>
                        <div className={cn(
                            "flex items-center justify-between h-11 px-2 border border-gray-200 rounded-xl bg-gray-50/50",
                            isConfirmed && "bg-gray-100 opacity-80 cursor-not-allowed"
                        )}>
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, children: (Math.max(0, Number(form.children) - 1)).toString() })}
                                className={cn(
                                    "w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-[#312E81] hover:text-white hover:border-[#312E81] transition-all active:scale-95 text-sm font-bold",
                                    isConfirmed && "cursor-not-allowed opacity-50 hover:bg-white hover:text-inherit hover:border-gray-100"
                                )}
                            >
                                -
                            </button>
                            <span className="text-sm font-black text-gray-900 mx-2">{form.children}</span>
                            <button
                                type="button"
                                disabled={isConfirmed}
                                onClick={() => setForm({ ...form, children: (Math.min(20, Number(form.children) + 1)).toString() })}
                                className={cn(
                                    "w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-[#312E81] hover:text-white hover:border-[#312E81] transition-all active:scale-95 text-sm font-bold",
                                    isConfirmed && "cursor-not-allowed opacity-50 hover:bg-white hover:text-inherit hover:border-gray-100"
                                )}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                        <CalendarIcon size={13} className="text-[#312E81]" /> Staying Dates
                    </Label>
                    <div className={cn(
                        "flex flex-col sm:flex-row gap-0 sm:gap-0 rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden",
                        isConfirmed && "opacity-80"
                    )}>
                        <div className="flex-1 p-3 sm:p-4">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Check-In</p>
                            <Input
                                type="date"
                                disabled={isConfirmed}
                                readOnly={isConfirmed}
                                value={format(form.check_in, "yyyy-MM-dd")}
                                onChange={(e) => setForm({ ...form, check_in: parseISO(e.target.value) })}
                                min={format(new Date(), "yyyy-MM-dd")}
                                className={cn(
                                    "border-none bg-transparent font-bold text-base p-0 h-auto focus-visible:ring-0 text-gray-900",
                                    isConfirmed && "cursor-not-allowed"
                                )}
                            />
                        </div>
                        <div className="hidden sm:flex items-center">
                            <div className="w-px h-8 bg-gray-200" />
                        </div>
                        <div className="border-t sm:border-t-0 flex-1 p-3 sm:p-4">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Check-Out</p>
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
                                    "border-none bg-transparent font-bold text-base p-0 h-auto focus-visible:ring-0",
                                    errors.dates ? "text-red-500" : nights > 0 ? "text-[#10B981]" : "text-gray-900",
                                    isConfirmed && "cursor-not-allowed"
                                )}
                            />
                        </div>
                    </div>
                    {errors.dates && <p className="text-[10px] text-red-500 font-semibold mt-0.5 ml-1">{errors.dates}</p>}
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#312E81]" />
                        <p className="text-[11px] text-gray-500">
                            <strong className="text-gray-700">{nights} {nights === 1 ? 'night' : 'nights'}</strong> stay selected
                        </p>
                    </div>
                </div>

                {/* Duration Selector */}
                {form.booking_type === "stay" && (
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                            <CalendarIcon size={13} className="text-[#312E81]" /> Preferred Duration (Optional)
                        </Label>
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
                            <SelectTrigger className={cn(
                                "h-11 rounded-xl border-gray-200 bg-gray-50/50",
                                isConfirmed && "bg-gray-100 opacity-80 cursor-not-allowed"
                            )}>
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
                {/* Confirmation Box */}
                <div className="space-y-4 pt-1">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#312E81]/5 border border-[#312E81]/10">
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
                                "mt-1 w-4 h-4 rounded border-gray-300 text-[#312E81] focus:ring-[#312E81] accent-[#312E81]",
                                isConfirmed && "cursor-not-allowed opacity-50",
                                errors.confirm_booking && "border-red-500 ring-2 ring-red-100"
                            )}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="confirm_booking" className="text-sm font-bold text-[#312E81] cursor-pointer">
                                Confirm this booking
                            </Label>
                            <p className="text-[11px] text-[#312E81]/80 font-medium leading-tight">
                                By confirming, you acknowledge that you cannot book any other hostel for the next 24 hours.
                            </p>
                            {errors.confirm_booking && (
                                <p className="text-[11px] text-red-500 font-bold mt-1 animate-pulse">
                                    {errors.confirm_booking}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Terms & Conditions */}
                <div className="space-y-2">
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
                            className={cn(
                                "mt-1 w-4 h-4 rounded border-gray-300 text-[#312E81] focus:ring-[#312E81] accent-[#312E81]",
                                isConfirmed && "cursor-not-allowed opacity-50"
                            )}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                                I accept the <button type="button" disabled={isConfirmed} onClick={(e) => openLegalDocument('terms', e)} className={cn("text-[#312E81] hover:underline font-semibold", isConfirmed && "cursor-default text-[#312E81]/60 no-underline")}>Terms and Conditions</button> and <button type="button" disabled={isConfirmed} onClick={(e) => openLegalDocument('privacy', e)} className={cn("text-[#312E81] hover:underline font-semibold", isConfirmed && "cursor-default text-[#312E81]/60 no-underline")}>Privacy Policy</button>
                            </Label>
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
                            "w-full h-14 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]",
                            cooldownRemaining !== null && cooldownRemaining > 0
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-[#312E81] hover:bg-[#252361] text-white"
                        )}
                    >
                        {cooldownRemaining !== null && cooldownRemaining > 0 ? (
                            <div className="flex items-center gap-2">
                                <span>Cooldown: {formatCooldown(cooldownRemaining)}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>{form.booking_type === "visit" ? "Send Visit Request" : "Continue to Payment"}</span>
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
