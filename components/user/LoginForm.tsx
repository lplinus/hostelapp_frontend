"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Eye, EyeOff, Shield, Star, MapPin, CalendarCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please provide a valid email address.";
      }
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await login({ username: email, password });
    } catch {
      // Error is handled by useAuth hook via toast
    }
  };

  const features = [
    { icon: MapPin, label: "Find Hostels Nearby" },
    { icon: CalendarCheck, label: "Instant Booking" },
    { icon: Star, label: "Verified Reviews" },
    { icon: Shield, label: "Secure Payments" },
  ];

  return (
    <div className="w-full h-screen max-h-screen flex overflow-hidden bg-white">
      {/* ───── LEFT PANEL — Hero Image (Compact & Stable) ───── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[40%] xl:w-[38%] h-full relative overflow-hidden shrink-0 select-none"
      >
        {/* Background Image */}
        <Image
          src="/images/hostel-login-hero.webp"
          alt="Hostel App Showcase"
          fill
          priority
          className="object-cover"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-indigo-900/65 to-[#0F172A]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Subtle decorative orbs */}
        <div className="absolute top-20 left-16 w-60 h-60 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-32 right-20 w-52 h-52 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Content on top */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 h-full w-full">
          {/* Top — Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-white">H</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Hostel In</span>
            </div>
          </div>

          {/* Center — Headline */}
          <div className="space-y-4 max-w-sm">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Your Perfect
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-200 to-amber-300 bg-clip-text text-transparent">
                Hostel Stay
              </span>
              <br />
              Awaits.
            </h1>
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              Discover, compare, and book verified hostels across the country — all from one dashboard.
            </p>
          </div>

          {/* Bottom — Feature Pills */}
          <div className="flex flex-wrap gap-2.5">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold"
              >
                <f.icon className="w-3.5 h-3.5 text-amber-300" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ───── RIGHT PANEL — Login Form (Scrollable & Stable) ───── */}
      <div className="flex-1 h-full overflow-y-auto flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 px-6 py-10 relative">
        {/* Subtle decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="w-full max-w-md relative z-10 py-4">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#1E1B4B] transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          {/* Mobile-only brand badge */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#1E1B4B] flex items-center justify-center shadow-sm">
              <span className="text-base font-bold text-white">H</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Hostel In</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-600 font-medium text-sm mt-1.5">
              Login to manage your hostel dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-900">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-slate-400 transition-colors group-focus-within:text-[#1E1B4B]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "pl-11 h-12 rounded-xl bg-white border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-black focus:border-black focus-visible:border-black focus:ring-1 focus:ring-black focus-visible:ring-1 focus-visible:ring-black",
                    errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:border-red-500 focus-visible:ring-red-100 hover:border-red-500" : ""
                  )}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  }}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-slate-900">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-slate-400 transition-colors group-focus-within:text-[#1E1B4B]" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-11 pr-11 h-12 rounded-xl bg-white border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-black focus:border-black focus-visible:border-black focus:ring-1 focus:ring-black focus-visible:ring-1 focus-visible:ring-black",
                    errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:border-red-500 focus-visible:ring-red-100 hover:border-red-500" : ""
                  )}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] active:bg-[#1E1B4B] text-white font-bold text-sm shadow-md shadow-indigo-950/20 transition-all duration-200 cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <Separator className="my-6 bg-slate-200" />

          <Link href="/register">
            <p className="text-center text-sm font-medium text-slate-700">
              Don&apos;t have an account?{" "}
              <span className="text-[#1E1B4B] font-bold hover:underline cursor-pointer transition-colors ml-1">
                Sign up
              </span>
            </p>
          </Link>

          {/* Footer badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}