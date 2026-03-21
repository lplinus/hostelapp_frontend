"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      });
    } catch {
      // Error is handled by useAuth hook via toast
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <Card className="rounded-3xl shadow-2xl border border-gray-200">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            Create Account
          </CardTitle>
          <p className="text-gray-500 text-sm">
            Join Hostel In and start exploring hostels
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Your full name"
                  className={cn(
                    "pl-9 h-11 rounded-xl",
                    errors.name ? "border-red-500 focus:ring-red-500" : name.trim().length >= 3 ? "border-green-500 focus:ring-green-500" : ""
                  )}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
              {!errors.name && name.trim().length >= 3 && <p className="text-[10px] text-green-600 font-bold ml-1">Looks great!</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "pl-9 h-11 rounded-xl",
                    errors.email ? "border-red-500 focus:ring-red-500" : (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? "border-green-500 focus:ring-green-500" : ""
                  )}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  }}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
              {!errors.email && (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && <p className="text-[10px] text-green-600 font-bold ml-1">Valid email!</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className={cn(
                    "pl-9 pr-10 h-11 rounded-xl",
                    errors.password ? "border-red-500 focus:ring-red-500" : password.length >= 8 ? "border-green-500 focus:ring-green-500" : ""
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
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
              {!errors.password && password.length >= 8 && <p className="text-[10px] text-green-600 font-bold ml-1">Strong password!</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={cn(
                    "pl-9 pr-10 h-11 rounded-xl",
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : (confirmPassword && confirmPassword === password) ? "border-green-500 focus:ring-green-500" : ""
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
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword}</p>}
              {!errors.confirmPassword && (confirmPassword && confirmPassword === password) && <p className="text-[10px] text-green-600 font-bold ml-1">Passwords match!</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}