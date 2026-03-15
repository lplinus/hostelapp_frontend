"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GuestOtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleGuestOtpSend: () => void;
    handleGuestOtpVerify: () => void;
    isGuestOtpVerifying: boolean;
    isGuestOtpSent: boolean;
    guestOtpTimer: number;
    guestOtp: string;
    setGuestOtp: (otp: string) => void;
}

export function GuestOtpModal({
    isOpen,
    onClose,
    handleGuestOtpSend,
    handleGuestOtpVerify,
    isGuestOtpVerifying,
    isGuestOtpSent,
    guestOtpTimer,
    guestOtp,
    setGuestOtp
}: GuestOtpModalProps) {
    return (
        <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-all", isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
            <div className={cn("bg-white rounded-3xl shadow-xl w-full max-w-[400px] p-6 transition-transform duration-300", isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8")}>
                <div className="text-center space-y-2 mb-6">
                    <h2 className="text-2xl font-bold">Verify Phone</h2>
                    <p className="text-gray-500 text-sm">We'll send a 6-digit verification code to your mobile number.</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleGuestOtpSend}
                        disabled={isGuestOtpVerifying || guestOtpTimer > 0}
                        className="w-full h-11 rounded-xl border-blue-100 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold"
                    >
                        {isGuestOtpSent && guestOtpTimer > 0 ? (
                            `Resend OTP in ${guestOtpTimer}s`
                        ) : isGuestOtpSent ? (
                            "Resend Verification Code"
                        ) : (
                            "Send Verification Code"
                        )}
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
                            onClick={onClose}
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
    );
}
