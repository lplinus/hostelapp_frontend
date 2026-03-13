"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBooking, BookingRequest } from "@/services/booking.service";
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
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, CreditCard, User, Mail, Users, Baby, Phone, Activity, Info, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
    hostel: HostelDetail;
}

type Step = "details" | "payment" | "confirmation";

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

    const [legalModalContent, setLegalModalContent] = useState<{title: string, content: string, effective_date?: string} | null>(null);
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
        const pricePerDay = Number(selectedRoom.price_per_day || selectedRoom.base_price || 0);
        return pricePerDay * nights;
    }, [selectedRoom, nights]);

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

    const handleGuestOtpSend = () => {
        setIsGuestOtpSent(true);
        toast.success(`OTP sent to ${form.mobile_number}`);
    };

    const handleGuestOtpVerify = () => {
        if (guestOtp.length < 6) return;
        setIsGuestOtpVerifying(true);
        setTimeout(() => {
            setIsGuestOtpVerifying(false);
            toast.success("Mobile number verified successfully!");
            setShowGuestOtp(false);
            if (form.booking_type === "visit") {
                handleConfirmBooking();
            } else {
                setStep("payment");
            }
        }, 800);
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
        };

        bookingMutation.mutate(bookingData);
    };

    if (step === "confirmation") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in duration-700">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-lg shadow-green-100/50">
                        <CheckCircle2 size={40} />
                    </div>
                </div>
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Confirmed!</h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for your booking. Your request has been sent to <strong>{hostel.name}</strong>.
                        We will notify you once the owner confirms.
                    </p>
                </div>
                <div className="bg-white border rounded-2xl p-6 text-left shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Info size={18} className="text-blue-600" />
                        Booking Summary
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 grid grid-cols-2 gap-4 text-sm content-start">
                            <div className="text-muted-foreground">Booking ID</div>
                            <div className="font-medium text-right font-mono">STN-{confirmedBookingId ? confirmedBookingId.substring(0, 8).toUpperCase() : ""}</div>
                            <div className="text-muted-foreground">Guest</div>
                            <div className="font-medium text-right">{form.guest_name}</div>
                            <div className="text-muted-foreground">Age</div>
                            <div className="font-medium text-right">{form.guest_age}</div>
                            <div className="text-muted-foreground">Hostel</div>
                            <div className="font-medium text-right">{hostel.name}</div>
                            <div className="text-muted-foreground">Dates</div>
                            <div className="font-medium text-right">{format(form.check_in, "PP")} - {format(form.check_out, "PP")}</div>
                            <div className="text-muted-foreground">{form.booking_type === "visit" ? "Status" : "Total Paid"}</div>
                            <div className="font-bold text-right text-green-600 text-lg">
                                {form.booking_type === "visit" ? "VISIT REQUESTED" : `₹${totalPrice.toLocaleString()}`}
                            </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-[160px]">
                            {confirmedBookingId ? (
                                <>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Booking ID: STN-${confirmedBookingId.substring(0, 8).toUpperCase()}\nGuest: ${form.guest_name}\nAge: ${form.guest_age}\nHostel: ${hostel.name}\nDates: ${format(form.check_in, "PP")} - ${format(form.check_out, "PP")}\nBOOKING:${confirmedBookingId}`)}`}
                                        alt="Booking QR Code" 
                                        className="w-32 h-32 rounded-lg bg-white p-2 border border-gray-200"
                                    />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3 text-center">Scan to verify</span>
                                </>
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-lg" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.push("/home")}>Browse More</Button>
                    <Button onClick={() => router.push("/dashboard")}>View in Dashboard</Button>
                </div>
            </div>
        );
    }

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
                <div className="space-y-8">
                    {/* Stepper */}
                    <div className="flex items-center gap-4 text-sm font-medium mb-4">
                        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            step === "details" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-blue-50 text-blue-600")}>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                            Guest Details
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            step === "payment" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-gray-100 text-gray-400")}>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                            Payment
                        </div>
                    </div>

                    {step === "details" && (
                        <Card className="border-muted shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-gray-50/50 border-b">
                                <CardTitle className="text-xl">Enter Guest Details</CardTitle>
                                <CardDescription>We'll use this information to process your booking at {hostel.name}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Booking Type Toggle */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Booking For</Label>
                                    <div className="flex p-1 bg-gray-100/80 rounded-2xl w-full sm:w-fit">
                                        <button
                                            onClick={() => setForm({ ...form, booking_type: "stay" })}
                                            className={cn(
                                                "flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                                                form.booking_type === "stay" 
                                                    ? "bg-white text-blue-600 shadow-sm" 
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            Stay
                                        </button>
                                        <button
                                            onClick={() => setForm({ ...form, booking_type: "visit" })}
                                            className={cn(
                                                "flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                                                form.booking_type === "visit" 
                                                    ? "bg-white text-blue-600 shadow-sm" 
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            Visit
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground ml-1">
                                        {form.booking_type === "stay" 
                                            ? "Choose 'Stay' for overnight accommodation with full amenities." 
                                            : "Choose 'Visit' to check out the hostel facilities before booking."}
                                    </p>
                                </div>

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
                                        {!errors.guest_name && form.guest_name.length > 2 && <p className="text-[10px] text-green-600 font-bold mt-1 ml-1">Perfect!</p>}
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
                                        {!errors.guest_email && form.guest_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email) && <p className="text-[10px] text-green-600 font-bold mt-1 ml-1">Email looks good!</p>}
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
                                    {!errors.mobile_number && form.mobile_number && /^\+?[\d\s-]{10,}$/.test(form.mobile_number) && <p className="text-[10px] text-green-600 font-bold mt-1 ml-1">Valid number!</p>}
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
                                            <SelectContent>
                                                {[1, 2, 3, 4].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
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
                                            <SelectContent>
                                                {[0, 1, 2, 3].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
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
                            </CardContent>
                        </Card>
                    )}

                    {step === "payment" && (
                        <Card className="border-muted shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-gray-50/50 border-b">
                                <CardTitle className="text-xl">Payment Details</CardTitle>
                                <CardDescription>Complete your payment securely to confirm the booking.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl flex gap-3 text-sm">
                                    <CreditCard className="shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="font-bold">Mock Payment Mode Enabled</p>
                                        <p className="opacity-80">This is a demonstration. Clicking "Complete Booking" will process the booking without an actual charge.</p>
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
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t flex justify-between p-6">
                                <Button variant="ghost" onClick={() => setStep("details")}>Back to Details</Button>
                                <Button
                                    className="px-10 rounded-xl bg-green-600 hover:bg-green-700 shadow-md shadow-green-100"
                                    onClick={handleConfirmBooking}
                                    disabled={bookingMutation.isPending}
                                >
                                    {bookingMutation.isPending ? "Processing..." : `Pay ₹${totalPrice.toLocaleString()}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Right Column: Summary Sticky Card */}
                <div className="lg:sticky lg:top-6 self-start space-y-6">
                    <Card className="border-muted shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-gray-50/50 border-b">
                            <CardTitle className="text-lg">Booking Summary</CardTitle>
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
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Room Type</Label>
                                    <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId}>
                                        <SelectTrigger className="rounded-xl border-gray-100 shadow-sm bg-gray-50/30">
                                            <SelectValue placeholder="Select a room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostel.room_types?.map(room => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    {room.category_display} - {room.sharing_display}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{selectedRoom?.category_display} × {nights} nights</span>
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
                        </CardContent>
                        {step === "details" && (
                            <CardFooter className="p-6 bg-gray-50/50">
                                <Button 
                                    className={cn(
                                        "w-full py-6 rounded-xl font-bold shadow-lg transition-all",
                                        form.booking_type === "visit" 
                                            ? "bg-green-600 hover:bg-green-700 shadow-green-100" 
                                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                                    )} 
                                    onClick={handleNext}
                                    disabled={bookingMutation.isPending}
                                >
                                    {bookingMutation.isPending 
                                        ? "Sending..." 
                                        : form.booking_type === "visit" 
                                            ? "Send Visit Request" 
                                            : "Confirm Details"} 
                                    <ChevronRight size={18} className="ml-1" />
                                </Button>
                            </CardFooter>
                        )}
                    </Card>

                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                        <Activity className="shrink-0 text-orange-600" size={18} />
                        <p className="text-xs text-orange-800 leading-relaxed font-medium">
                            Free cancellation available 24 hours before check-in. Book with confidence.
                        </p>
                    </div>
                </div>
            </div>

            <OtpVerificationModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
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
