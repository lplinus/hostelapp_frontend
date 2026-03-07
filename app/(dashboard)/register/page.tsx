import RegisterForm from "@/components/user/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | StayNest - Hostel Booking Platform",
  description:
    "Create your StayNest account to book hostels, manage stays, and explore amazing accommodations.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 px-6">
      <RegisterForm />
    </main>
  );
}