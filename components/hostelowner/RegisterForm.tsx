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
  Wrench,
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
  const [role, setRole] = useState<"guest" | "hostel_owner" | "vendor" | "service">("guest");
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
    <div className="w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden bg-[#EDE8DF]">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1E1B]/90 via-[#2A2824]/85 to-[#141311]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Subtle decorative orbs */}
        <div className="absolute top-20 left-16 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-32 right-20 w-52 h-52 rounded-full bg-stone-500/10 blur-3xl pointer-events-none" />

        {/* Content on top */}
        <div className="relative z-10 flex flex-col justify-between p-8 xl:p-10 h-full w-full">
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
          <div className="space-y-3 max-w-sm">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Your Complete
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-stone-200 to-amber-200 bg-clip-text text-transparent">
                Hostel Living
              </span>
              <br />
              Experience.
            </h1>
            <p className="text-stone-200 text-sm font-medium leading-relaxed">
              Join verified student and working-professional accommodations with hassle-free booking.
            </p>
          </div>

          {/* Bottom — Feature Pills & Social Proof */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold"
                >
                  <f.icon className="w-3.5 h-3.5 text-amber-200" />
                  {f.label}
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex -space-x-2">
                {["A", "B", "C"].map((char) => (
                  <div
                    key={char}
                    className="w-7 h-7 rounded-full bg-[#1F1E1B] border-2 border-[#D2CABC] flex items-center justify-center text-[#EDE8DF] text-[11px] font-bold shadow-sm"
                  >
                    {char}
                  </div>
                ))}
              </div>
              <span className="text-stone-200 text-xs font-medium">
                Trusted by 1,000+ residents & owners
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ───── RIGHT PANEL — Registration Form (Scrollable & Stable) ───── */}
      <div className="w-full lg:flex-1 h-full overflow-y-auto flex flex-col items-center bg-[#EDE8DF] px-4 sm:px-6 py-6 sm:py-8 lg:py-8 relative">
        {/* Subtle decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #1F1E1B 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="w-full max-w-md relative z-10 my-auto py-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#686259] hover:text-[#1F1E1B] transition-colors mb-3 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          {/* Mobile-only brand badge */}
          <div className="lg:hidden flex items-center gap-2 mb-4 justify-center">
            <div className="w-8 h-8 rounded-xl bg-[#1F1E1B] flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-[#EDE8DF]">H</span>
            </div>
            <span className="text-base font-bold text-[#1A1916] tracking-tight">Hostel In</span>
          </div>

          {/* Header */}
          <div className="mb-3.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1916] tracking-tight">
              Create Account
            </h2>
            <p className="text-[#686259] font-medium text-xs sm:text-sm mt-0.5">
              Join Hostel In and start exploring hostels
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-2.5 sm:space-y-3">

            {/* Role Selection */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-[#686259] ml-0.5">I am a...</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: any) => setRole(value)}
                className="grid grid-cols-2 gap-2"
              >
                <div className="relative">
                  <RadioGroupItem value="guest" id="guest" className="peer sr-only" />
                  <Label
                    htmlFor="guest"
                    className="flex flex-col items-center justify-center py-2 px-2 rounded-lg border-2 peer-data-[state=checked]:border-[#1F1E1B] peer-data-[state=checked]:bg-[#DBD5C8] hover:bg-[#DBD5C8]/50 bg-[#E5DFD4] cursor-pointer transition-all duration-150 h-full border-[#D2CABC]"
                  >
                    <User className={cn("w-4 h-4 mb-1 transition-colors", role === "guest" ? "text-[#1F1E1B]" : "text-[#686259]")} />
                    <span className={cn("text-xs tracking-tight text-center leading-tight transition-colors", role === "guest" ? "text-[#1F1E1B] font-bold" : "text-[#686259] font-semibold")}>Guest</span>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="hostel_owner" id="hostel_owner" className="peer sr-only" />
                  <Label
                    htmlFor="hostel_owner"
                    className="flex flex-col items-center justify-center py-2 px-2 rounded-lg border-2 peer-data-[state=checked]:border-[#1F1E1B] peer-data-[state=checked]:bg-[#DBD5C8] hover:bg-[#DBD5C8]/50 bg-[#E5DFD4] cursor-pointer transition-all duration-150 h-full border-[#D2CABC]"
                  >
                    <Building2 className={cn("w-4 h-4 mb-1 transition-colors", role === "hostel_owner" ? "text-[#1F1E1B]" : "text-[#686259]")} />
                    <span className={cn("text-xs tracking-tight text-center leading-tight transition-colors", role === "hostel_owner" ? "text-[#1F1E1B] font-bold" : "text-[#686259] font-semibold")}>Owner</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#1A1916]">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#7A746B] transition-colors group-focus-within:text-[#1F1E1B]" />
                <Input
                  type="text"
                  placeholder="Your full name"
                  className={cn(
                    "pl-10 h-10 rounded-xl bg-[#E5DFD4] border-[#D2CABC] text-sm font-medium text-[#1A1916] placeholder:text-[#7A746B] transition-all hover:border-[#1F1E1B] focus:border-[#1F1E1B] focus-visible:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B] focus-visible:ring-1 focus-visible:ring-[#1F1E1B]",
                    errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:border-red-500 focus-visible:ring-red-100 hover:border-red-500" : ""
                  )}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#1A1916]">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#7A746B] transition-colors group-focus-within:text-[#1F1E1B]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "pl-10 h-10 rounded-xl bg-[#E5DFD4] border-[#D2CABC] text-sm font-medium text-[#1A1916] placeholder:text-[#7A746B] transition-all hover:border-[#1F1E1B] focus:border-[#1F1E1B] focus-visible:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B] focus-visible:ring-1 focus-visible:ring-[#1F1E1B]",
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
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#1A1916]">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#7A746B] transition-colors group-focus-within:text-[#1F1E1B]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password (min 8 chars)"
                  className={cn(
                    "pl-10 pr-10 h-10 rounded-xl bg-[#E5DFD4] border-[#D2CABC] text-sm font-medium text-[#1A1916] placeholder:text-[#7A746B] transition-all hover:border-[#1F1E1B] focus:border-[#1F1E1B] focus-visible:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B] focus-visible:ring-1 focus-visible:ring-[#1F1E1B]",
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
                  className="absolute right-3.5 top-2.5 text-[#7A746B] hover:text-[#1A1916] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#1A1916]">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#7A746B] transition-colors group-focus-within:text-[#1F1E1B]" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={cn(
                    "pl-10 pr-10 h-10 rounded-xl bg-[#E5DFD4] border-[#D2CABC] text-sm font-medium text-[#1A1916] placeholder:text-[#7A746B] transition-all hover:border-[#1F1E1B] focus:border-[#1F1E1B] focus-visible:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B] focus-visible:ring-1 focus-visible:ring-[#1F1E1B]",
                    errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:border-red-500 focus-visible:ring-red-100 hover:border-red-500" : ""
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
                  className="absolute right-3.5 top-2.5 text-[#7A746B] hover:text-[#1A1916] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-red-500 font-semibold ml-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10.5 rounded-xl bg-[#1F1E1B] hover:bg-[#34322D] active:bg-[#1F1E1B] text-[#EDE8DF] font-bold text-sm shadow-md shadow-black/10 transition-all duration-200 mt-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <Separator className="my-3.5 bg-[#D2CABC]" />

          <p className="text-center text-xs sm:text-sm font-medium text-[#686259]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1F1E1B] font-bold hover:underline cursor-pointer transition-colors ml-1"
            >
              Login
            </Link>
          </p>

          {/* Footer badge */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#686259]">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}