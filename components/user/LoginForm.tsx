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
    <div className="w-full min-h-screen flex">
      {/* ───── LEFT PANEL — Hero Image + Feature Badges ───── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden"
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-indigo-900/60 to-purple-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Animated decorative orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-20 w-56 h-56 rounded-full bg-purple-500/20 blur-3xl"
        />

        {/* Content on top */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          {/* Top — Brand */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <span className="text-lg font-bold text-white">H</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Hostel In</span>
            </motion.div>
          </div>

          {/* Center — Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-6 max-w-lg"
          >
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Your Perfect
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                Hostel Stay
              </span>
              <br />
              Awaits.
            </h1>
            <p className="text-indigo-200/80 text-base leading-relaxed max-w-md">
              Discover, compare, and book verified hostels across the country — all from one beautiful dashboard.
            </p>
          </motion.div>

          {/* Bottom — Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.12, duration: 0.35 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-sm font-medium hover:bg-white/20 transition-colors cursor-default"
              >
                <f.icon className="w-4 h-4 text-amber-300" />
                {f.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ───── RIGHT PANEL — Login Form ───── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-6 py-12 relative overflow-hidden">
        {/* Subtle decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          {/* Mobile-only brand badge */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-base font-bold text-white">H</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Hostel In</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Login to manage your hostel dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "pl-11 h-12 rounded-xl bg-gray-50/80 border-gray-200 text-sm placeholder:text-gray-400 transition-all focus:bg-white focus:shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                    errors.email ? "border-red-500 focus:ring-red-100 focus:border-red-500" : (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500" : ""
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-gray-400 transition-colors group-focus-within:text-indigo-500" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-11 pr-11 h-12 rounded-xl bg-gray-50/80 border-gray-200 text-sm placeholder:text-gray-400 transition-all focus:bg-white focus:shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                    errors.password ? "border-red-500 focus:ring-red-100 focus:border-red-500" : password.length > 0 ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500" : ""
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
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
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
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-200/60 hover:shadow-indigo-300/60 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <Separator className="my-7" />

          <Link href="/register">
            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <span className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline cursor-pointer transition-colors">
                Sign up
              </span>
            </p>
          </Link>

          {/* Footer badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}