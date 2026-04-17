"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking, BookingRequest, sendBookingOtp, verifyBookingOtp, createRazorpayOrder, verifyRazorpayPayment, confirmPayAtProperty } from "@/services/booking.service";
import { getUserProfile } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import type { HostelDetail } from "@/types/hostel.types";
import { OtpVerificationModal } from "@/components/user/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import { format, addDays, differenceInDays, addMonths, parseISO } from "date-fns";
import { Activity, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingDetailsStep } from "./steps/BookingDetailsStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { BookingSummary } from "./steps/BookingSummary";
import { GuestOtpModal } from "./steps/GuestOtpModal";
import { LegalDocumentModal } from "./steps/LegalDocumentModal";
import { BookingProgressBar } from "./steps/BookingProgressBar";

interface Props {
    hostel: HostelDetail;
    initialRoomId?: string;
    initialPriceMode?: string;
    initialCheckIn?: string;
    initialCheckOut?: string;
    initialGuests?: string;
}

export type Step = "details" | "payment" | "confirmation" | null;

export default function BookingContainer({
    hostel,
    initialRoomId,
    initialPriceMode,
    initialCheckIn,
    initialCheckOut,
    initialGuests
}: Props) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("details");
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
        initialRoomId || hostel.room_types?.[0]?.id.toString() || null
    );
    const { user } = useAuth();
    const { executeRecaptcha } = useGoogleReCaptcha();
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
    const [isPhoneVerifiedManually, setIsPhoneVerifiedManually] = useState(false);
    const [isPaymentVerified, setIsPaymentVerified] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const isPhoneVerified = profile?.is_phone_verified || isPhoneVerifiedManually;

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
        mobile_number: "+91",
        guest_age: "20",
        adults: initialGuests || "1",
        children: "0",
        check_in: initialCheckIn ? parseISO(initialCheckIn) : new Date(),
        check_out: initialCheckOut ? parseISO(initialCheckOut) : (initialPriceMode === "monthly" ? addMonths(new Date(), 1) : addDays(new Date(), 1)),
        booking_type: "stay" as "stay" | "visit",
        stay_duration: initialPriceMode === "monthly" ? "1_month" : "none",
        confirm_booking: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const [bookingStatus, setBookingStatus] = useState<"pending" | "confirmed">("pending");
    // const bookingFee = 59;
    const bookingFee = 0;
    const finalTotalPrice = useMemo(() => totalPrice > 0 ? totalPrice + bookingFee : 0, [totalPrice]);

    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

    // Cooldown Timer Effect
    useEffect(() => {
        if (cooldownRemaining === null || cooldownRemaining <= 0) return;

        const timer = setInterval(() => {
            setCooldownRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    const formatCooldown = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"online" | "on_arrival">("online");

    const bookingMutation = useMutation({
        mutationFn: (data: BookingRequest) => createBooking(data),
        onSuccess: (data) => {
            setConfirmedBookingId(data.id);
            // Only move to confirmation automatically for "visit" bookings
            // For "stay" bookings, we wait for Razorpay payment to complete or Pay at Property confirmation
            if (form.booking_type === "visit") {
                setBookingStatus("confirmed");
                setStep("confirmation");
                toast.success("Visit request submitted successfully!");
            } else {
                toast.success("Booking initialized.");
            }
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            queryClient.invalidateQueries({ queryKey: ["recentBookings"] });
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
        onError: (error: any) => {
            // Priority 1: Use the pre-processed error message from our APIClient's handleApiError
            // Priority 2: Use error.response.data (Axios-style fallback if ever switched)
            // Priority 3: Use raw error.message
            const data = error.response?.data;
            let msg = error.message || "An unexpected error occurred.";

            if (data) {
                if (typeof data === 'string') {
                    msg = data;
                } else if (data.non_field_errors) {
                    msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
                } else if (data.detail || data.error || data.message) {
                    msg = data.detail || data.error || data.message;
                } else {
                    const values = Object.values(data);
                    if (values.length > 0) {
                        const firstVal = values[0];
                        msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                    }
                }
            }

            toast.error(msg, { duration: 5000 });
        }
    });

    const confirmPropertyPaymentMutation = useMutation({
        mutationFn: (bookingId: string) => confirmPayAtProperty(bookingId),
        onSuccess: () => {
            setBookingStatus("confirmed");
            setStep("confirmation");
            toast.success("Booking confirmed! You can pay at the property.");
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to confirm property payment.");
        }
    });

    const isFormValid = useMemo(() => {
        const hasName = form.guest_name.trim().length >= 3;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const hasEmail = emailRegex.test(form.guest_email);
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        const hasPhone = phoneRegex.test(form.mobile_number);
        const age = Number.parseInt(form.guest_age);
        const hasAge = !Number.isNaN(age) && age >= 10 && age <= 100;
        const hasRoom = !!selectedRoomId;
        const hasDates = nights > 0;

        return hasName && hasEmail && hasPhone && hasAge && hasRoom && hasDates && termsAccepted;
    }, [form, selectedRoomId, nights, termsAccepted]);

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
            toast.error("Please select a room type.");
            return false;
        }

        if (nights <= 0) {
            newErrors.dates = "Check-out date must be after check-in date.";
        }

        if (!form.confirm_booking) {
            newErrors.confirm_booking = "Please confirm this booking to proceed.";
        }

        setTermsError(!termsAccepted);
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0 && termsAccepted;
    };

    const handleNext = async () => {
        if (bookingStatus === "confirmed") return;

        if (step === "details") {
            if (!validateForm()) return;

            // 1. Initial verification check (If already verified in current session/profile)
            if (isPhoneVerified) {
                if (form.booking_type === "visit") {
                    handleConfirmBooking();
                    return;
                }
                setStep("payment");
                return;
            }

            // 2. Combined Smart Move: Checking for duplicates AND previous verification
            /*
            try {
                // Pass hostel.id to check for 24-hour duplicate bookings
                const response = await sendBookingOtp(form.mobile_number, hostel.id);

                // If backend returns verified: true, it means they've booked before (Smart OTP)
                if (response.verified) {
                    setIsPhoneVerifiedManually(true);
                    toast.success("Welcome back! Phone verified via previous booking.");
                    if (form.booking_type === "visit") {
                        handleConfirmBooking();
                    } else {
                        setStep("payment");
                    }
                    return;
                }

                // If not previously verified, the backend has now sent an OTP
                if (profile) {
                    setShowOtpModal(true);
                } else {
                    setShowGuestOtp(true);
                    // Initialize the guest modal with 'OTP sent' state
                    setIsGuestOtpSent(true);
                    setGuestOtpTimer(60);
                }
            } catch (error: any) {
                const errorData = error.response?.data;
                const backendMsg = errorData?.error || errorData?.message;
                
                if (errorData?.is_cooldown) {
                    setCooldownRemaining(errorData.remaining_seconds);
                    toast.error(backendMsg || `Cooldown active. Try again in ${formatCooldown(errorData.remaining_seconds)}`, {
                        duration: 5000,
                        icon: "⏳",
                    });
                    return;
                }

                if (errorData?.is_duplicate) {
                    toast.error(backendMsg || "Duplicate booking detected.", {
                        duration: 6000,
                        icon: "🚫",
                    });
                    return;
                }

                toast.error(backendMsg || error.message || "Failed to initiate verification");
            } finally {
                setIsSubmitting(false);
            }
            */

           // Bypassed OTP flow
           setIsPhoneVerifiedManually(true);
           if (form.booking_type === "visit") {
               handleConfirmBooking();
           } else {
               setStep("payment");
           }

        }
    };

    const handleGuestOtpSend = async () => {
        setIsGuestOtpSent(true);
        try {
            const response = await sendBookingOtp(form.mobile_number, hostel.id);
            
            if (response.verified) {
                setIsPhoneVerifiedManually(true);
                toast.success("Phone verified via previous booking!");
                setStep("payment");
                return;
            }

            toast.success("New verification code sent!");
            setErrors({});
            setGuestOtpTimer(60);
        } catch (error: any) {
            const errorData = error.response?.data;
            const backendMsg = errorData?.error || errorData?.message;

            if (errorData?.is_cooldown) {
                setCooldownRemaining(errorData.remaining_seconds);
                toast.error(backendMsg || `Cooldown active: ${formatCooldown(errorData.remaining_seconds)} remaining`);
            } else {
                toast.error(backendMsg || "Failed to resend code");
            }
        } finally {
            setIsGuestOtpSent(false);
        }
    };

    const handleGuestOtpVerify = async () => {
        if (guestOtp.length < 6) return;
        setIsGuestOtpVerifying(true);
        try {
            await verifyBookingOtp(form.mobile_number, guestOtp);
            setIsGuestOtpVerifying(false);
            setIsPhoneVerifiedManually(true);
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

    const handleConfirmBooking = async () => {
        if (!selectedRoom) return;

        let recaptchaToken = "";
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
        const hasSiteKey = siteKey.length > 0 && !siteKey.startsWith("YOUR_");
        
        if (hasSiteKey) {
            if (!executeRecaptcha) {
                toast.error("Security verification (reCAPTCHA) is not ready yet. Please wait a second and try again.");
                return;
            }
            try {
                recaptchaToken = await executeRecaptcha("booking");
            } catch (captchaError) {
                console.warn("reCAPTCHA failed or missing site key. Proceeding without it.", captchaError);
            }
        }

        try {
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
                total_price: form.booking_type === "visit" ? 0 : finalTotalPrice,
                booking_type: form.booking_type,
                stay_duration: form.stay_duration as any,
                payment_method: paymentMethod,
                recaptcha_token: recaptchaToken,
            };

            bookingMutation.mutate(bookingData);
        } catch (error) {
            toast.error("Failed to process booking. Please try again.");
        }
    };

    const handleRazorpayPayment = async (bookingId: string) => {
        setIsProcessingPayment(true);
        try {
            const order = await createRazorpayOrder(bookingId);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SRVXPRrskTPpW6",
                amount: order.amount,
                currency: order.currency,
                name: "Hostel In",
                description: `Booking for ${hostel.name}`,
                order_id: order.order_id,
                handler: async function (response: any) {
                    try {
                        await verifyRazorpayPayment({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        setPaymentId(response.razorpay_payment_id);
                        setIsPaymentVerified(true);
                        setBookingStatus("confirmed");
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
        } catch (error: any) {
            const errorMsg = error.message || "Failed to initiate payment.";
            if (errorMsg.includes("already 'confirmed'")) {
                toast.error("You have already booked this hostel. Please use 'Book Again' for a new booking.");
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const resetBooking = () => {
        setForm({
            guest_name: "",
            guest_email: "",
            mobile_number: "+91",
            guest_age: "20",
            adults: "1",
            children: "0",
            check_in: new Date(),
            check_out: addDays(new Date(), 1),
            booking_type: "stay",
            stay_duration: "none",
            confirm_booking: false,
        });
        setConfirmedBookingId(null);
        setCooldownRemaining(null);
        setStep("details");
        setBookingStatus("pending");
        setTermsAccepted(false);
        setErrors({});
        setIsPhoneVerifiedManually(false);
        setIsPaymentVerified(false);
        setPaymentId(null);
    };


    return (
        <div className="max-w-5xl mx-auto py-10 px-4 font-sans antialiased">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-[#312E81] transition-colors mb-6 group"
            >
                <div className="p-2 rounded-full border border-slate-200 group-hover:bg-slate-50 transition-all text-slate-900">
                    <ArrowLeft size={18} />
                </div>
                <span className="font-semibold">Back to Hostel</span>
            </button>

            {/* Progress Bar */}
            <BookingProgressBar
                currentStep={step}
                isPhoneVerified={isPhoneVerified}
                isPaymentVerified={isPaymentVerified}
                bookingStatus={bookingStatus}
                bookingType={form.booking_type}
                onStepClick={(clickedStep) => {
                    if (bookingStatus === "confirmed") {
                        setStep(clickedStep);
                    }
                }}
            />

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
                        isPhoneVerified={isPhoneVerified}
                        bookingStatus={bookingStatus}
                        cooldownRemaining={cooldownRemaining}
                        formatCooldown={formatCooldown}
                    />

                    {form.booking_type !== "visit" && (
                        <PaymentStep
                            step={step}
                            setStep={setStep}
                            confirmedBookingId={confirmedBookingId}
                            totalPrice={totalPrice}
                            bookingFee={bookingFee}
                            finalTotalPrice={finalTotalPrice}
                            hostel={hostel}
                            selectedRoom={selectedRoom}
                            form={form}
                            bookingMutation={bookingMutation}
                            handleRazorpayPayment={handleRazorpayPayment}
                            isPhoneVerified={isPhoneVerified}
                            validateForm={validateForm}
                            isFormValid={isFormValid}
                            isPaymentVerified={isPaymentVerified}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            confirmPropertyPaymentMutation={confirmPropertyPaymentMutation}
                            isProcessingPayment={isProcessingPayment}
                            bookingStatus={bookingStatus}
                        />
                    )}

                    {form.booking_type !== "visit" && (
                        <ConfirmationStep
                            step={step}
                            setStep={setStep}
                            confirmedBookingId={confirmedBookingId}
                            paymentId={paymentId}
                            paymentMethod={paymentMethod}
                            form={form}
                            totalPrice={totalPrice}
                            bookingFee={bookingFee}
                            finalTotalPrice={finalTotalPrice}
                            hostelName={hostel.name}
                            router={router}
                            isPhoneVerified={isPhoneVerified}
                            validateForm={validateForm}
                            isFormValid={isFormValid}
                            resetBooking={resetBooking}
                            isPaymentVerified={isPaymentVerified}
                            bookingStatus={bookingStatus}
                            extraCharges={hostel.extra_charges}
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
                        bookingFee={bookingFee}
                        finalTotalPrice={finalTotalPrice}
                        setStep={setStep}
                        bookingStatus={bookingStatus}
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
                    setIsPhoneVerifiedManually(true);
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
