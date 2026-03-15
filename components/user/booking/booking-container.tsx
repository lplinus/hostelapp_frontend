"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking, BookingRequest, sendBookingOtp, verifyBookingOtp, createRazorpayOrder, verifyRazorpayPayment } from "@/services/booking.service";
import { getUserProfile } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HostelDetail } from "@/types/hostel.types";
import { OtpVerificationModal } from "@/components/user/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays, parseISO, addMonths } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, CreditCard, User, Mail, Users, Baby, Phone, Activity, Info, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingDetailsStep } from "./steps/BookingDetailsStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { BookingSummary } from "./steps/BookingSummary";
import { GuestOtpModal } from "./steps/GuestOtpModal";
import { LegalDocumentModal } from "./steps/LegalDocumentModal";

interface Props {
    hostel: HostelDetail;
}

export type Step = "details" | "payment" | "confirmation" | null;

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
    const [guestOtpTimer, setGuestOtpTimer] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (guestOtpTimer > 0) {
            interval = setInterval(() => {
                setGuestOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [guestOtpTimer]);

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

        const guestCount = Number.parseInt(form.adults) || 1;

        // 1. If a fixed monthly duration is selected, use monthly rate
        if (form.stay_duration && form.stay_duration !== "none") {
            let months = 0;
            if (form.stay_duration === "1_month") months = 1;
            else if (form.stay_duration === "2_months") months = 2;
            else if (form.stay_duration === "3_months") months = 3;
            else if (form.stay_duration === "4_months") months = 4;
            else if (form.stay_duration === "5_months") months = 5;
            else if (form.stay_duration === "gt_5_months") months = 6;

            if (months > 0) return baseMonthly * months * guestCount;
        }

        // 2. If no duration selected (Custom Dates) or fallback, use daily rate
        return Math.ceil(dailyRate * nights * guestCount);
    }, [selectedRoom, nights, form.stay_duration, form.booking_type, form.adults]);

    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

    const bookingMutation = useMutation({
        mutationFn: (data: BookingRequest) => createBooking(data),
        onSuccess: (data) => {
            setConfirmedBookingId(data.id);
            // Only move to confirmation automatically for "visit" bookings
            // For "stay" bookings, we wait for Razorpay payment to complete
            if (form.booking_type === "visit") {
                setStep("confirmation");
                toast.success("Visit request submitted successfully!");
            } else {
                toast.success("Booking initialized. Please complete your payment.");
            }
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
            setGuestOtpTimer(60);
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

    const handleRazorpayPayment = async (bookingId: string) => {
        try {
            const order = await createRazorpayOrder(bookingId);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SRVXPRrskTPpW6",
                amount: order.amount,
                currency: order.currency,
                name: "StayNest",
                description: `Booking for ${hostel.name}`,
                order_id: order.order_id,
                handler: async function (response: any) {
                    try {
                        await verifyRazorpayPayment({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        setStep("confirmation");
                        toast.success("Payment successful!");
                        queryClient.invalidateQueries({ queryKey: ["userBookings"] });
                    } catch (error) {
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: form.guest_name,
                    email: form.guest_email,
                    contact: form.mobile_number
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Failed to initiate payment.");
        }
    };


    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
            >
                <div className="p-2 rounded-full border border-gray-200 group-hover:bg-gray-100 transition-all text-black">
                    <ArrowLeft size={18} />
                </div>
                <span className="font-medium">Back to Hostel</span>
            </button>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    <BookingDetailsStep
                        step={step}
                        setStep={setStep}
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        setErrors={setErrors}
                        nights={nights}
                        termsAccepted={termsAccepted}
                        setTermsAccepted={setTermsAccepted}
                        termsError={termsError}
                        setTermsError={setTermsError}
                        openLegalDocument={openLegalDocument}
                        handleNext={handleNext}
                    />

                    {form.booking_type !== "visit" && (
                        <PaymentStep
                            step={step}
                            setStep={setStep}
                            confirmedBookingId={confirmedBookingId}
                            totalPrice={totalPrice}
                            hostel={hostel}
                            selectedRoom={selectedRoom}
                            form={form}
                            bookingMutation={bookingMutation}
                            handleRazorpayPayment={handleRazorpayPayment}
                        />
                    )}

                    {form.booking_type !== "visit" && (
                        <ConfirmationStep
                            step={step}
                            setStep={setStep}
                            confirmedBookingId={confirmedBookingId}
                            form={form}
                            totalPrice={totalPrice}
                            hostelName={hostel.name}
                            router={router}
                        />
                    )}
                </div>

                {/* Right Column: Summary Sticky Card */}
                <div className="lg:sticky lg:top-6 self-start space-y-6">
                    <BookingSummary
                        hostel={hostel}
                        selectedRoom={selectedRoom}
                        selectedRoomId={selectedRoomId}
                        setSelectedRoomId={setSelectedRoomId}
                        form={form}
                        nights={nights}
                        totalPrice={totalPrice}
                        setStep={setStep}
                    />

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

            <GuestOtpModal
                isOpen={showGuestOtp}
                onClose={() => setShowGuestOtp(false)}
                handleGuestOtpSend={handleGuestOtpSend}
                handleGuestOtpVerify={handleGuestOtpVerify}
                isGuestOtpVerifying={isGuestOtpVerifying}
                isGuestOtpSent={isGuestOtpSent}
                guestOtpTimer={guestOtpTimer}
                guestOtp={guestOtp}
                setGuestOtp={setGuestOtp}
            />

            <LegalDocumentModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                legalLoading={legalLoading}
                legalModalContent={legalModalContent}
            />
        </div>
    );
}
