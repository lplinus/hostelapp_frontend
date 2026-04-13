"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  Zap,
  ArrowLeft,
  Shield,
  CalendarCheck,
  Star,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"guest" | "hostel_owner" | "vendor">("guest");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (name.trim().length < 3) {
      newErrors.name = "Full name must be at least 3 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please provide a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      // Derive username from email (before @)
      const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      const nameParts = name.trim().split(" ");

      await register({
        username,
        email,
        password,
        confirm_password: confirmPassword,
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        role,
      });
    } catch {
      // Error is handled by useAuth hook via toast
    }
  };

  const features = [
    { icon: CalendarCheck, label: "Instant Hostel Booking" },
    { icon: CheckCircle2, label: "Verified Listings" },
    { icon: Star, label: "Food & Daily Services" },
    { icon: Shield, label: "Laundry & Complaints" },
    { icon: MapPin, label: "Smart Digital Check-in" },
  ];

  return (
    <div className="w-full min-h-screen flex">
      {/* ───── LEFT PANEL — Hero Image + Feature Badges ───── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[50%] relative overflow-hidden"
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
              Your Complete
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                Hostel Living
              </span>
              <br />
              Experience
            </h1>
          </motion.div>

          {/* Bottom — Feature Pills + Trust Badge */}
          <div className="space-y-6">
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

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white/20 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-white/70 text-sm">
                Trusted by 1000+ students & professionals
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ───── RIGHT PANEL — Registration Form ───── */}
      <div className="w-full lg:w-[50%] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-6 py-8 relative overflow-hidden">
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
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-5 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          {/* Mobile-only brand badge */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-base font-bold text-white">H</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Hostel In</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm mt-1.5">
              Join Hostel In and start exploring hostels
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Role Selection */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">I am a...</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: any) => setRole(value)}
                className="grid grid-cols-3 gap-3"
              >
                <div className="relative">
                  <RadioGroupItem value="guest" id="guest" className="peer sr-only" />
                  <Label
                    htmlFor="guest"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50/50 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 h-full border-gray-100"
                  >
                    <User className={cn("w-5 h-5 mb-1.5 transition-colors", role === "guest" ? "text-indigo-600" : "text-gray-400")} />
                    <span className={cn("text-[10px] font-bold tracking-tight text-center leading-tight transition-colors", role === "guest" ? "text-indigo-700" : "text-gray-500")}>Guest</span>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="hostel_owner" id="hostel_owner" className="peer sr-only" />
                  <Label
                    htmlFor="hostel_owner"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50/50 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 h-full border-gray-100"
                  >
                    <Building2 className={cn("w-5 h-5 mb-1.5 transition-colors", role === "hostel_owner" ? "text-indigo-600" : "text-gray-400")} />
                    <span className={cn("text-[10px] font-bold tracking-tight text-center leading-tight transition-colors", role === "hostel_owner" ? "text-indigo-700" : "text-gray-500")}>Hostel<br/>Owner</span>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="vendor" id="vendor" className="peer sr-only" />
                  <Label
                    htmlFor="vendor"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50/50 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 h-full border-gray-100"
                  >
                    <Zap className={cn("w-5 h-5 mb-1.5 transition-colors", role === "vendor" ? "text-indigo-600" : "text-gray-400")} />
                    <span className={cn("text-[10px] font-bold tracking-tight text-center leading-tight transition-colors", role === "vendor" ? "text-indigo-700" : "text-gray-500")}>Vendor</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                <Input
                  type="text"
                  placeholder="Your full name"
                  className={cn(
                    "pl-11 h-12 rounded-xl bg-gray-50/80 border-gray-200 text-sm placeholder:text-gray-400 transition-all focus:bg-white focus:shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                    errors.name ? "border-red-500 focus:ring-red-100 focus:border-red-500" : name.trim().length >= 3 ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500" : ""
                  )}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.name}</p>}
              {!errors.name && name.trim().length >= 3 && <p className="text-[11px] text-emerald-600 font-semibold ml-1">Looks great!</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
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
              {!errors.email && (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && <p className="text-[11px] text-emerald-600 font-semibold ml-1">Valid email!</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className={cn(
                    "pl-11 pr-11 h-12 rounded-xl bg-gray-50/80 border-gray-200 text-sm placeholder:text-gray-400 transition-all focus:bg-white focus:shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                    errors.password ? "border-red-500 focus:ring-red-100 focus:border-red-500" : password.length >= 8 ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500" : ""
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
              {!errors.password && password.length >= 8 && <p className="text-[11px] text-emerald-600 font-semibold ml-1">Strong password!</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-[18px] h-[18px] text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={cn(
                    "pl-11 pr-11 h-12 rounded-xl bg-gray-50/80 border-gray-200 text-sm placeholder:text-gray-400 transition-all focus:bg-white focus:shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                    errors.confirmPassword ? "border-red-500 focus:ring-red-100 focus:border-red-500" : (confirmPassword && confirmPassword === password) ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500" : ""
                  )}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.confirmPassword}</p>}
              {!errors.confirmPassword && (confirmPassword && confirmPassword === password) && <p className="text-[11px] text-emerald-600 font-semibold ml-1">Passwords match!</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-200/60 hover:shadow-indigo-300/60 transition-all duration-200 mt-1 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <Separator className="my-5" />

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors"
            >
              Login
            </Link>
          </p>

          {/* Footer badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}