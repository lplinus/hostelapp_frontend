"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, RefreshCw, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { sendBookingEmailOtp, verifyBookingEmailOtp } from "@/services/booking.service";
import { cn } from "@/lib/utils";

interface EmailOtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    guestName?: string;
    onVerified: () => void;
}

export function EmailOtpModal({
    isOpen,
    onClose,
    email,
    guestName,
    onVerified,
}: EmailOtpModalProps) {
    const [otp, setOtp] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [timer, setTimer] = useState(60);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Auto-send OTP when modal opens
    useEffect(() => {
        if (isOpen && email) {
            setOtp("");
            setErrorMsg(null);
            handleSendOtp(true);
        }
    }, [isOpen, email]);

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async (isInitial = false) => {
        if (!email) return;
        setIsSending(true);
        setErrorMsg(null);
        try {
            const res = await sendBookingEmailOtp(email, guestName);
            if (res.verified) {
                toast.success("Email verified!");
                onVerified();
                onClose();
                return;
            }
            if (isInitial) {
                toast.success(`Verification code sent to ${email}`);
            } else {
                toast.success("New verification code sent!");
            }
            setTimer(60);
        } catch (error: any) {
            const err = error.response?.data?.error || "Failed to send verification code. Please try again.";
            setErrorMsg(err);
            toast.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = async () => {
        const cleanOtp = otp.trim();
        if (cleanOtp.length < 6) {
            setErrorMsg("Please enter the complete 6-digit code.");
            return;
        }

        setIsVerifying(true);
        setErrorMsg(null);
        try {
            const res = await verifyBookingEmailOtp(email, cleanOtp);
            if (res.verified || res.message) {
                toast.success("Email verified successfully! Proceeding to payment...");
                onVerified();
                onClose();
            } else {
                setErrorMsg("Verification failed. Please check the code.");
            }
        } catch (error: any) {
            const err = error.response?.data?.error || "Invalid or expired code. Please try again.";
            setErrorMsg(err);
            toast.error(err);
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-6 sm:p-7 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Header with Mail Icon Badge */}
                <div className="text-center space-y-2 mb-6">
                    <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#003580] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                        <Mail size={26} strokeWidth={2.3} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-950 tracking-tight">Verify Your Email</h3>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                        We sent a 6-digit verification code to{" "}
                        <strong className="text-gray-950 font-bold break-all underline decoration-blue-200">{email}</strong>
                    </p>
                </div>

                {/* OTP Input */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            placeholder="······"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                                setErrorMsg(null);
                                setOtp(e.target.value.replace(/\D/g, ""));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && otp.length === 6) {
                                    handleVerify();
                                }
                            }}
                            className={cn(
                                "h-14 text-center text-2xl tracking-[0.4em] font-black font-mono rounded-xl bg-gray-50/60 border-2 transition-all focus:bg-white text-gray-950",
                                errorMsg
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-[#003580] focus:ring-[#003580]/15"
                            )}
                        />
                        {errorMsg && (
                            <p className="text-xs text-red-600 font-semibold text-center pt-1 animate-in fade-in">
                                {errorMsg}
                            </p>
                        )}
                    </div>

                    {/* Resend Code Section */}
                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-gray-500">Didn't receive code?</span>
                        <button
                            type="button"
                            onClick={() => handleSendOtp(false)}
                            disabled={isSending || timer > 0}
                            className={cn(
                                "font-bold flex items-center gap-1 transition-colors cursor-pointer",
                                timer > 0 || isSending
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-[#003580] hover:text-[#002244] hover:underline"
                            )}
                        >
                            {isSending && <RefreshCw size={12} className="animate-spin" />}
                            {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-3">
                        <Button
                            type="button"
                            onClick={handleVerify}
                            disabled={isVerifying || otp.length < 6}
                            className="w-full h-12 rounded-xl text-sm font-extrabold bg-[#003580] hover:bg-[#002244] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Verifying Code...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={16} />
                                    Verify & Complete Booking
                                </>
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full h-9 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel & Edit Details
                        </button>
                    </div>

                    {/* Spam hint */}
                    <p className="text-[11px] text-gray-400 text-center leading-relaxed pt-1">
                        Tip: If the email doesn't arrive within a minute, please check your spam or junk folder.
                    </p>
                </div>
            </div>
        </div>
    );
}
