"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function OtpVerificationModal({
    isOpen,
    onClose,
    onSuccess,
}: OtpVerificationModalProps) {
    const [otp, setOtp] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSendOtp = async () => {
        setIsSending(true);
        try {
            await authService.sendOtp();
            toast.success("OTP sent to your phone number");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to send OTP");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length < 6) return;
        setIsPending(true);
        try {
            await authService.verifyOtp(otp);
            toast.success("Phone number verified!");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Invalid OTP");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Verify Phone</DialogTitle>
                    <DialogDescription>
                        We'll send a 6-digit verification code to your registered mobile number.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleSendOtp}
                        disabled={isSending || isPending}
                        className="w-full h-11 rounded-xl border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-semibold"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Verification Code"
                        )}
                    </Button>

                    <div className="w-full space-y-2 mt-2">
                        <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="h-12 text-center text-xl tracking-[0.3em] font-bold rounded-xl bg-gray-50 border-gray-100"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleVerify}
                        disabled={isPending || otp.length < 6}
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all font-semibold"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Verify & Proceed"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
