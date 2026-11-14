"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function VerificationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !code) return;

        setIsPending(true);
        try {
            await authService.verifyEmail({ email, code });
            setIsSuccess(true);
            toast.success("Email verified successfully!");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Verification failed. Please check the code.");
        } finally {
            setIsPending(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-3xl shadow-sm border border-[#D2CABC] bg-[#E5DFD4] text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-[#DBD5C8] p-4 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-[#1F1E1B]" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2 text-[#1A1916]">Verified!</CardTitle>
                    <CardDescription className="text-[#686259]">
                        Your email has been successfully verified.
                        Redirecting you to login in a few seconds...
                    </CardDescription>
                    <Button
                        onClick={() => router.push("/login")}
                        className="mt-8 w-full h-11 rounded-xl bg-[#1F1E1B] hover:bg-[#34322D] text-[#EDE8DF]"
                    >
                        Go to Login Now
                    </Button>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md px-4"
        >
            <Card className="rounded-3xl shadow-sm border border-[#D2CABC] bg-[#E5DFD4] overflow-hidden">
                <div className="h-1.5 bg-[#1F1E1B] w-full" />
                <CardHeader className="space-y-2 text-center pt-8">
                    <CardTitle className="text-3xl font-bold text-[#1A1916]">Verify Email</CardTitle>
                    <CardDescription className="text-[#686259]">
                        Enter the 6-digit code we sent to your email
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email" className="text-sm font-semibold text-[#1A1916] ml-1">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#7A746B]" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="pl-10 h-11 rounded-xl border-[#D2CABC] bg-[#E5DFD4] text-[#1A1916] placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-[#1F1E1B]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <Label htmlFor="code" className="text-sm font-semibold text-[#1A1916] ml-1">Verification Code</Label>
                            <Input
                                id="code"
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                className="h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border-[#D2CABC] bg-[#E5DFD4] text-[#1A1916] placeholder:text-[#7A746B] focus:border-[#1F1E1B] focus:ring-[#1F1E1B]"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending || code.length < 6}
                            className="w-full h-12 rounded-xl bg-[#1F1E1B] hover:bg-[#34322D] text-[#EDE8DF] shadow-md shadow-black/10 text-base font-semibold transition-all active:scale-[0.98]"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Verify Account"
                            )}
                        </Button>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/register")}
                                className="text-sm text-[#686259] hover:text-[#1F1E1B] flex items-center gap-1 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Signup
                            </button>
                            <button
                                type="button"
                                className="text-sm text-[#1F1E1B] font-semibold hover:underline"
                                onClick={() => toast.info("Check your inbox and spam folder.")}
                            >
                                Resend Code?
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8 flex items-start gap-3 bg-[#DBD5C8] border border-[#D2CABC] p-4 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-[#1F1E1B] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1A1916] leading-relaxed">
                    Check your email inbox for a 6-digit code. If you don't see it, please check your <strong>spam</strong> or <strong>promotions</strong> folder.
                </p>
            </div>
        </motion.div>
    );
}
