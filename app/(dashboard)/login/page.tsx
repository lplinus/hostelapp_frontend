import LoginForm from "@/components/user/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Hostel In - Hostel Booking Platform",
  description:
    "Log in to your Hostel In account to manage bookings, explore hostels, and access your dashboard.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
      <LoginForm />
    </main>
  );
}