"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ChevronRight, User, Mail, Users, Baby, Phone, Activity, Calendar as CalendarIcon } from "lucide-react";
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
    isPhoneVerified
}: BookingDetailsStepProps) {
    return (
        <Card className="border-2 border-gray-200 shadow-none overflow-hidden transition-all duration-300 bg-white rounded-3xl">
            <CardHeader className="bg-white border-none cursor-pointer p-2 hover:bg-gray-50/80 rounded-2xl transition-all" onClick={() => setStep(step === "details" ? null : "details")}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", (step !== "details" && isPhoneVerified) ? "bg-green-100 text-green-600" : "bg-blue-600 text-white")}>
                            {(step !== "details" && isPhoneVerified) ? <CheckCircle2 size={16} /> : "1"}
                        </div>
                        <div>
                            <CardTitle className="text-xl text-gray-900 font-bold">Confirm Booking details</CardTitle>
                            {step !== "details" && (
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                    {form.guest_name} • {form.mobile_number} 
                                    {isPhoneVerified ? (
                                        <span className="ml-2 text-green-600 font-bold uppercase text-[9px]">Verified</span>
                                    ) : (
                                        <span className="ml-2 text-orange-600 font-bold uppercase text-[9px]">Verification Pending</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {step !== "details" && (
                            <span className="text-xs font-bold text-blue-600">Change</span>
                        )}
                        <ChevronRight className={cn("h-5 w-5 text-black transition-transform duration-300", step === "details" ? "rotate-90" : "")} />
                    </div>
                </div>
            </CardHeader>
            {step === "details" && (
                <CardContent className="space-y-6 pt-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2 text-gray-700">
                                <User size={14} className="text-blue-600" /> Full Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={form.guest_name}
                                onChange={(e) => {
                                    setForm({ ...form, guest_name: e.target.value });
                                    if (errors.guest_name) setErrors(prev => ({ ...prev, guest_name: "" }));
                                }}
                                className={cn(
                                    "rounded-xl border-gray-200 focus:ring-blue-500",
                                    errors.guest_name ? "border-red-500 focus:ring-red-500" : form.guest_name.length > 2 ? "border-green-500 focus:ring-green-500" : ""
                                )}
                            />
                            {errors.guest_name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.guest_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                                <Mail size={14} className="text-blue-600" /> Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.guest_email}
                                onChange={(e) => {
                                    setForm({ ...form, guest_email: e.target.value });
                                    if (errors.guest_email) setErrors(prev => ({ ...prev, guest_email: "" }));
                                }}
                                className={cn(
                                    "rounded-xl border-gray-200 focus:ring-blue-500",
                                    errors.guest_email ? "border-red-500 focus:ring-red-500" : form.guest_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email) ? "border-green-500 focus:ring-green-500" : ""
                                )}
                            />
                            {errors.guest_email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.guest_email}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile" className="flex items-center gap-2 text-gray-700">
                            <Phone size={14} className="text-blue-600" /> Mobile Number
                        </Label>
                        <Input
                            id="mobile"
                            type="tel"
                            placeholder="+91 9876543210"
                            value={form.mobile_number}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (!val.startsWith("+91")) {
                                    val = "+91" + val.replace(/^\+?91?/, "");
                                }
                                setForm({ ...form, mobile_number: val });
                                if (errors.mobile_number) setErrors(prev => ({ ...prev, mobile_number: "" }));
                            }}
                            className={cn(
                                "rounded-xl border-gray-200 focus:ring-blue-500",
                                errors.mobile_number ? "border-red-500 focus:ring-red-500" : form.mobile_number && /^\+?[\d\s-]{10,}$/.test(form.mobile_number) ? "border-green-500 focus:ring-green-500" : ""
                            )}
                        />
                        {errors.mobile_number && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.mobile_number}</p>}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="age" className="flex items-center gap-2 text-gray-700">
                                <Activity size={14} className="text-blue-600" /> Age
                            </Label>
                            <Input
                                id="age"
                                type="number"
                                value={form.guest_age}
                                onChange={(e) => {
                                    setForm({ ...form, guest_age: e.target.value });
                                    if (errors.guest_age) setErrors(prev => ({ ...prev, guest_age: "" }));
                                }}
                                className={cn(
                                    "rounded-xl border-gray-200 focus:ring-blue-500",
                                    errors.guest_age ? "border-red-500 focus:ring-red-500" : (Number(form.guest_age) >= 10 && Number(form.guest_age) <= 100) ? "border-green-500 focus:ring-green-500" : ""
                                )}
                            />
                            {errors.guest_age && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.guest_age}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adults" className="flex items-center gap-2 text-gray-700">
                                <Users size={14} className="text-blue-600" /> Adults
                            </Label>
                            <Select value={form.adults} onValueChange={(v) => setForm({ ...form, adults: v })}>
                                <SelectTrigger className="rounded-xl border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" className="max-h-[200px] overflow-y-auto">
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="children" className="flex items-center gap-2 text-gray-700">
                                <Baby size={14} className="text-blue-600" /> Children
                            </Label>
                            <Select value={form.children} onValueChange={(v) => setForm({ ...form, children: v })}>
                                <SelectTrigger className="rounded-xl border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" className="max-h-[200px] overflow-y-auto">
                                    {Array.from({ length: 21 }, (_, i) => i).map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-gray-700">
                            <CalendarIcon size={14} className="text-blue-600" /> Staying Dates
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-2xl bg-gray-50/30 border-gray-200">
                            <div className="flex-1 space-y-1.5">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Check-In</p>
                                <Input
                                    type="date"
                                    value={format(form.check_in, "yyyy-MM-dd")}
                                    onChange={(e) => setForm({ ...form, check_in: parseISO(e.target.value) })}
                                    min={format(new Date(), "yyyy-MM-dd")}
                                    className="border-none bg-transparent font-bold text-lg p-0 h-auto focus-visible:ring-0"
                                />
                            </div>
                            <div className="hidden sm:flex items-center px-4">
                                <ChevronRight className="text-gray-300" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Check-Out</p>
                                <Input
                                    type="date"
                                    value={format(form.check_out, "yyyy-MM-dd")}
                                    onChange={(e) => {
                                        setForm({ ...form, check_out: parseISO(e.target.value) });
                                        if (errors.dates) setErrors(prev => ({ ...prev, dates: "" }));
                                    }}
                                    min={format(addDays(form.check_in, 1), "yyyy-MM-dd")}
                                    className={cn(
                                        "border-none bg-transparent font-bold text-lg p-0 h-auto focus-visible:ring-0",
                                        errors.dates ? "text-red-500" : nights > 0 ? "text-green-600" : ""
                                    )}
                                />
                            </div>
                        </div>
                        {errors.dates && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.dates}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                            Selected: <strong>{nights} {nights === 1 ? 'night' : 'nights'}</strong> stay.
                        </p>
                    </div>

                    {form.booking_type === "stay" && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon size={14} className="text-blue-600" /> Preferred Duration (Optional)
                            </Label>
                            <Select
                                value={form.stay_duration}
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
                                <SelectTrigger className="rounded-xl border-gray-200">
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

                    <Separator className="bg-gray-100 my-4" />

                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => {
                                    setTermsAccepted(e.target.checked);
                                    if (e.target.checked) setTermsError(false);
                                }}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                                    I accept the <button type="button" onClick={(e) => openLegalDocument('terms', e)} className="text-blue-600 hover:underline">Terms and Conditions</button> and <button type="button" onClick={(e) => openLegalDocument('privacy', e)} className="text-blue-600 hover:underline">Privacy Policy</button>
                                </Label>
                                {termsError && (
                                    <p className="text-[12px] text-red-500 font-bold mt-1">Accept terms and conditions to proceed</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button
                            className="px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 font-bold"
                            onClick={handleNext}
                        >
                            {form.booking_type === "visit" ? "Send Visit Request" : "Confirm Details"}
                            <ChevronRight size={18} className="ml-1" />
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
