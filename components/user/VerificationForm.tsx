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
                <Card className="rounded-3xl shadow-2xl border border-gray-100 text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2 text-gray-900">Verified!</CardTitle>
                    <CardDescription className="text-gray-600">
                        Your email has been successfully verified.
                        Redirecting you to login in a few seconds...
                    </CardDescription>
                    <Button
                        onClick={() => router.push("/login")}
                        className="mt-8 w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700"
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
            <Card className="rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="h-2 bg-indigo-600 w-full" />
                <CardHeader className="space-y-2 text-center pt-8">
                    <CardTitle className="text-3xl font-bold text-gray-900">Verify Email</CardTitle>
                    <CardDescription className="text-gray-500">
                        Enter the 6-digit code we sent to your email
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <Label htmlFor="code" className="text-sm font-semibold text-gray-700 ml-1">Verification Code</Label>
                            <Input
                                id="code"
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                className="h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending || code.length < 6}
                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 text-base font-semibold transition-all active:scale-[0.98]"
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
                                className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Signup
                            </button>
                            <button
                                type="button"
                                className="text-sm text-indigo-600 font-semibold hover:underline"
                                onClick={() => toast.info("Check your inbox and spam folder.")}
                            >
                                Resend Code?
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8 flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Check your email inbox for a 6-digit code. If you don't see it, please check your <strong>spam</strong> or <strong>promotions</strong> folder.
                </p>
            </div>
        </motion.div>
    );
}
