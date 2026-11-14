import VerificationForm from "@/components/hostelowner/VerificationForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Verify Account | Hostel In",
    description: "Verify your Hostel In account to start booking hostels.",
};

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#EDE8DF] px-6">
            <Suspense fallback={null}>
                <VerificationForm />
            </Suspense>
        </main>
    );
}
