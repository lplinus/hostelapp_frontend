"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking, BookingRequest, sendBookingOtp, verifyBookingOtp } from "@/services/booking.service";
import { getUserProfile } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HostelDetail } from "@/types/hostel.types";
import { OtpVerificationModal } from "@/components/user/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays, parseISO, addMonths } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, CreditCard, User, Mail, Users, Baby, Phone, Activity, Info, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
    hostel: HostelDetail;
}

type Step = "details" | "payment" | "confirmation" | null;

export default function BookingContainer({ hostel }: Props) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("details");
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
        hostel.room_types?.[0]?.id.toString() || null
    );
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: profile } = useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
        enabled: !!user,
    });

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showGuestOtp, setShowGuestOtp] = useState(false);
    const [guestOtp, setGuestOtp] = useState("");
    const [isGuestOtpVerifying, setIsGuestOtpVerifying] = useState(false);
    const [isGuestOtpSent, setIsGuestOtpSent] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState(false);

    const [legalModalContent, setLegalModalContent] = useState<{ title: string, content: string, effective_date?: string } | null>(null);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalLoading, setLegalLoading] = useState(false);

    const [form, setForm] = useState({
        guest_name: "",
        guest_email: "",
        mobile_number: "",
        guest_age: "20",
        adults: "1",
        children: "0",
        check_in: new Date(),
        check_out: addDays(new Date(), 1),
        booking_type: "stay" as "stay" | "visit",
        stay_duration: "none",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedRoom = useMemo(() =>
        hostel.room_types?.find(r => r.id.toString() === selectedRoomId),
        [hostel.room_types, selectedRoomId]);

    const nights = useMemo(() =>
        differenceInDays(form.check_out, form.check_in),
        [form.check_in, form.check_out]);

    const totalPrice = useMemo(() => {
        if (!selectedRoom || nights <= 0) return 0;
        if (form.booking_type === "visit") return 0;

        const baseMonthly = Number(selectedRoom.base_price || 0);
        // Fallback to monthly/30 if daily rate is not provided
        const dailyRate = Number(selectedRoom.price_per_day || (baseMonthly / 30));

        // 1. If a fixed monthly duration is selected, use monthly rate
        if (form.stay_duration && form.stay_duration !== "none") {
            let months = 0;
            if (form.stay_duration === "1_month") months = 1;
            else if (form.stay_duration === "2_months") months = 2;
            else if (form.stay_duration === "3_months") months = 3;
            else if (form.stay_duration === "4_months") months = 4;
            else if (form.stay_duration === "5_months") months = 5;
            else if (form.stay_duration === "gt_5_months") months = 6;

            if (months > 0) return baseMonthly * months;
        }

        // 2. If no duration selected (Custom Dates) or fallback, use daily rate
        return Math.ceil(dailyRate * nights);
    }, [selectedRoom, nights, form.stay_duration, form.booking_type]);

    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

    const bookingMutation = useMutation({
        mutationFn: (data: BookingRequest) => createBooking(data),
        onSuccess: (data) => {
            setConfirmedBookingId(data.id);
            setStep("confirmation");
            toast.success("Booking submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            queryClient.invalidateQueries({ queryKey: ["recentBookings"] });
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create booking. Please try again.");
        }
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.guest_name.trim()) {
            newErrors.guest_name = "Full name is required.";
        } else if (form.guest_name.trim().length < 3) {
            newErrors.guest_name = "Name must be at least 3 characters long.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.guest_email) {
            newErrors.guest_email = "Email address is required.";
        } else if (!emailRegex.test(form.guest_email)) {
            newErrors.guest_email = "Please enter a valid email address.";
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!form.mobile_number) {
            newErrors.mobile_number = "Mobile number is required.";
        } else if (!phoneRegex.test(form.mobile_number)) {
            newErrors.mobile_number = "Please enter a valid mobile number (at least 10 digits).";
        }

        const age = Number.parseInt(form.guest_age);
        if (!form.guest_age) {
            newErrors.guest_age = "Age is required.";
        } else if (Number.isNaN(age) || age < 10 || age > 100) {
            newErrors.guest_age = "Please enter a valid age (10-100).";
        }

        if (!selectedRoomId) {
            toast.error("Please select a room type."); // Still use toast for global/hidden field errors if necessary, but try to avoid
            return false;
        }

        if (nights <= 0) {
            newErrors.dates = "Check-out date must be after check-in date.";
        }

        if (!termsAccepted) {
            setTermsError(true);
        } else {
            setTermsError(false);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && termsAccepted;
    };

    const handleNext = () => {
        if (step === "details") {
            if (!validateForm()) return;

            // Verification check
            if (profile) {
                if (!profile.is_phone_verified) {
                    setShowOtpModal(true);
                    return;
                }
            } else {
                // Mobile verification for guest booking
                setShowGuestOtp(true);
                return;
            }

            if (form.booking_type === "visit") {
                handleConfirmBooking();
                return;
            }

            setStep("payment");
        }
    };

    const handleGuestOtpSend = async () => {
        setIsGuestOtpSent(true);
        try {
            await sendBookingOtp(form.mobile_number);
            toast.success(`OTP sent to ${form.mobile_number}`);
        } catch (error: any) {
            setIsGuestOtpSent(false);
            toast.error(error.response?.data?.error || "Failed to send OTP");
        }
    };

    const handleGuestOtpVerify = async () => {
        if (guestOtp.length < 6) return;
        setIsGuestOtpVerifying(true);
        try {
            await verifyBookingOtp(form.mobile_number, guestOtp);
            setIsGuestOtpVerifying(false);
            toast.success("Mobile number verified successfully!");
            setShowGuestOtp(false);
            if (form.booking_type === "visit") {
                handleConfirmBooking();
            } else {
                setStep("payment");
            }
        } catch (error: any) {
            setIsGuestOtpVerifying(false);
            toast.error(error.response?.data?.error || "Invalid or expired OTP");
        }
    };

    const openLegalDocument = async (type: 'terms' | 'privacy', e: React.MouseEvent) => {
        e.preventDefault();
        setIsLegalModalOpen(true);
        setLegalLoading(true);
        setLegalModalContent(null);
        try {
            const endpoint = type === 'terms' ? 'terms-and-conditions' : 'privacy-policy';
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${baseUrl}/api/cms/${endpoint}/`);
            if (res.ok) {
                const data = await res.json();
                setLegalModalContent(data);
            } else {
                setLegalModalContent({ title: "Error", content: "Failed to load content. Please try again later." });
            }
        } catch (error) {
            setLegalModalContent({ title: "Error", content: "Failed to load content. Please try again later." });
        } finally {
            setLegalLoading(false);
        }
    };

    const handleConfirmBooking = () => {
        if (!selectedRoom) return;

        const bookingData: BookingRequest = {
            hostel: hostel.id,
            room_type: selectedRoom.id,
            guest_name: form.guest_name,
            guest_email: form.guest_email,
            mobile_number: form.mobile_number,
            guest_age: Number.parseInt(form.guest_age),
            adults: Number.parseInt(form.adults),
            children: Number.parseInt(form.children),
            check_in: format(form.check_in, "yyyy-MM-dd"),
            check_out: format(form.check_out, "yyyy-MM-dd"),
            guests_count: Number.parseInt(form.adults) + Number.parseInt(form.children),
            total_price: form.booking_type === "visit" ? 0 : totalPrice,
            booking_type: form.booking_type,
            stay_duration: form.stay_duration as any,
        };

        bookingMutation.mutate(bookingData);
    };


    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
            >
                <div className="p-2 rounded-full border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                    <ArrowLeft size={18} />
                </div>
                <span className="font-medium">Back to Hostel</span>
            </button>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    {/* Step 1: Log in or sign up */}
                    <Card className="border-none shadow-none overflow-hidden transition-all duration-300 bg-white">
                        <CardHeader className="bg-white border-none cursor-pointer p-2 hover:bg-gray-50/80 rounded-2xl transition-all" onClick={() => setStep(step === "details" ? null : "details")}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step !== "details" ? "bg-green-100 text-green-600" : "bg-blue-600 text-white")}>
                                        {step !== "details" ? <CheckCircle2 size={16} /> : "1"}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-gray-900 font-bold">Log in or sign up</CardTitle>
                                        {step !== "details" && (
                                            <p className="text-xs text-gray-500 mt-1 font-medium">{form.guest_name} • {form.mobile_number}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {step !== "details" && (
                                        <span className="text-xs font-bold text-blue-600">Change</span>
                                    )}
                                    <ChevronRight className={cn("h-5 w-5 text-gray-400 transition-transform duration-300", step === "details" ? "rotate-90" : "")} />
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
                                            setForm({ ...form, mobile_number: e.target.value });
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
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-2xl bg-gray-50/30">
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

                    {/* Step 2: Add a payment method */}
                    {form.booking_type !== "visit" && (
                        <Card className="border-none shadow-none overflow-hidden transition-all duration-300 bg-white">
                            <CardHeader 
                                className="bg-white border-none cursor-pointer p-2 hover:bg-gray-50/80 rounded-2xl transition-all"
                                onClick={() => setStep(step === "payment" ? null : "payment")}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step === "payment" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500")}>
                                            2
                                        </div>
                                        <CardTitle className="text-xl text-gray-900 font-bold">Add a payment method</CardTitle>
                                    </div>
                                    <ChevronRight className={cn("h-5 w-5 text-gray-400 transition-transform duration-300", step === "payment" ? "rotate-90" : "")} />
                                </div>
                            </CardHeader>
                            {step === "payment" && (
                                <CardContent className="space-y-6 pt-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-4 bg-blue-50/30 text-blue-700 rounded-2xl flex gap-3 text-sm">
                                        <CreditCard className="shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="font-bold">Mock Payment Mode Enabled</p>
                                            <p className="text-gray-500">This is a demonstration. Clicking "Complete & Pay" will process the booking without an actual charge.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="card">Card Details</Label>
                                            <Input id="card" placeholder="0000 0000 0000 0000" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="exp">Expiry Date</Label>
                                                <Input id="exp" placeholder="MM/YY" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvv">CVV</Label>
                                                <Input id="cvv" placeholder="***" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            className="px-10 rounded-xl bg-green-600 hover:bg-green-700 shadow-md shadow-green-100 py-6 font-bold"
                                            onClick={handleConfirmBooking}
                                            disabled={bookingMutation.isPending}
                                        >
                                            {bookingMutation.isPending ? "Processing..." : `Complete & Pay ₹${totalPrice.toLocaleString()}`}
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )}

                    {form.booking_type !== "visit" && (
                        <Card className="border-none shadow-none overflow-hidden transition-all duration-300 bg-white">
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
                                    <ChevronRight className={cn("h-5 w-5 text-gray-400 transition-transform duration-300", step === "confirmation" ? "rotate-90" : "")} />
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
                                                        Your request has been sent to <strong>{hostel.name}</strong>.
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
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Booking ID: STN-${confirmedBookingId?.substring(0, 8).toUpperCase()}\nGuest: ${form.guest_name}\nHostel: ${hostel.name}\nBOOKING:${confirmedBookingId}`)}`}
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
                    )}
                </div>

                {/* Right Column: Summary Sticky Card */}
                <div className="lg:sticky lg:top-6 self-start space-y-6">
                    <Card className="border-none shadow-none overflow-hidden bg-gray-50/30 rounded-3xl">
                        <CardHeader className="bg-transparent border-none">
                            <CardTitle className="text-lg">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Hostel Mini Info */}
                            <div className="p-4 flex gap-4 border-b">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                                    {hostel.images?.[0]?.image ? (
                                        <img src={hostel.images[0].image} alt={hostel.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">STAY</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 leading-tight">{hostel.name}</h4>
                                    <p className="text-xs text-muted-foreground">{hostel.city.name}, {hostel.area?.name}</p>
                                    <Badge variant="secondary" className="text-[10px] uppercase font-black">{hostel.hostel_type}</Badge>
                                </div>
                            </div>

                            {/* Selection Info */}
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {/* Dates Summary */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dates</p>
                                            <p className="text-sm font-semibold">{format(form.check_in, "MMM d")} - {format(form.check_out, "MMM d, yyyy")}</p>
                                        </div>
                                        <button onClick={() => setStep("details")} className="text-xs font-bold underline hover:text-blue-600 transition-colors">Change</button>
                                    </div>

                                    {/* Guests Summary */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Guests</p>
                                            <p className="text-sm font-semibold">{form.adults} adult{Number(form.adults) > 1 ? 's' : ''}{Number(form.children) > 0 ? `, ${form.children} child${Number(form.children) > 1 ? 'ren' : ''}` : ''}</p>
                                        </div>
                                        <button onClick={() => setStep("details")} className="text-xs font-bold underline hover:text-blue-600 transition-colors">Change</button>
                                    </div>
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Room Type</Label>
                                        <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId}>
                                            <SelectTrigger className="rounded-xl border-gray-100 shadow-sm bg-gray-50/30">
                                                <SelectValue placeholder="Select a room" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="max-h-[200px] overflow-y-auto">
                                                {hostel.room_types?.map(room => (
                                                    <SelectItem key={room.id} value={room.id.toString()}>
                                                        {room.category_display} - {room.sharing_display}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{selectedRoom?.category_display || "Room"} × {nights} nights</span>
                                            <span className="font-medium">₹{(form.booking_type === "visit" ? 0 : totalPrice).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Service Charge</span>
                                            <span className="text-green-600 font-bold">FREE</span>
                                        </div>
                                        <Separator className="bg-blue-50" />
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="font-bold text-gray-900">Total Price</span>
                                            <span className="font-black text-blue-600">₹{(form.booking_type === "visit" ? 0 : totalPrice).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-orange-50/30 rounded-2xl flex gap-3">
                        <Activity className="shrink-0 text-orange-600" size={18} />
                        <p className="text-[11px] text-orange-800 leading-relaxed font-semibold">
                            Free cancellation available 24 hours before check-in. Book with confidence.
                        </p>
                    </div>
                </div>
            </div>

            <OtpVerificationModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                phone={form.mobile_number}
                onSuccess={() => {
                    toast.success("Phone verified! Proceeding...");
                    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                    if (form.booking_type === "visit") {
                        handleConfirmBooking();
                    } else {
                        setStep("payment");
                    }
                }}
            />

            {/* Guest OTP Modal */}
            <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-all", showGuestOtp ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
                <div className={cn("bg-white rounded-3xl shadow-xl w-full max-w-[400px] p-6 transition-transform duration-300", showGuestOtp ? "scale-100 translate-y-0" : "scale-95 translate-y-8")}>
                    <div className="text-center space-y-2 mb-6">
                        <h2 className="text-2xl font-bold">Verify Phone</h2>
                        <p className="text-gray-500 text-sm">We'll send a 6-digit verification code to your mobile number.</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleGuestOtpSend}
                            disabled={isGuestOtpSent || isGuestOtpVerifying}
                            className="w-full h-11 rounded-xl border-blue-100 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold"
                        >
                            {isGuestOtpSent ? "Verification Code Sent" : "Send Verification Code"}
                        </Button>

                        <div className="w-full space-y-2 mt-2">
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                value={guestOtp}
                                onChange={(e) => setGuestOtp(e.target.value.replace(/\D/g, ""))}
                                className="h-12 text-center text-xl tracking-[0.3em] font-bold rounded-xl bg-gray-50 border-gray-100"
                            />
                        </div>

                        <div className="w-full mt-4 flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setShowGuestOtp(false)}
                                className="flex-1 h-11 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGuestOtpVerify}
                                disabled={isGuestOtpVerifying || guestOtp.length < 6}
                                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all font-semibold"
                            >
                                {isGuestOtpVerifying ? "Verifying..." : "Verify & Proceed"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Modal */}
            <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-all", isLegalModalOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
                <div className={cn("bg-white rounded-3xl shadow-xl w-full max-w-[600px] max-h-[80vh] flex flex-col p-6 transition-transform duration-300", isLegalModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8")}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h2 className="text-xl font-bold">{legalModalContent?.title || (legalLoading ? "Loading..." : "")}</h2>
                        <button onClick={() => setIsLegalModalOpen(false)} className="text-gray-500 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
                    </div>
                    {legalLoading ? (
                        <div className="flex-1 flex justify-center items-center py-10">
                            <span className="text-gray-500 font-medium">Loading Document...</span>
                        </div>
                    ) : legalModalContent ? (
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {legalModalContent.effective_date && (
                                <p className="text-sm text-gray-500 font-medium tracking-wide border-b pb-2">
                                    Effective Date: <span className="text-gray-900 font-bold">{legalModalContent.effective_date}</span>
                                </p>
                            )}
                            <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: legalModalContent.content }} />
                        </div>
                    ) : null}
                    <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button onClick={() => setIsLegalModalOpen(false)} className="h-10 rounded-xl px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold">Done</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
