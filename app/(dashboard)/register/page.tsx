import RegisterForm from "@/components/user/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Hostel In - Hostel Booking Platform",
  description:
    "Create your Hostel In account to book hostels, manage stays, and explore amazing accommodations.",
};

export default function RegisterPage() {
  return (
    <main>
      <RegisterForm />
    </main>
  );
}