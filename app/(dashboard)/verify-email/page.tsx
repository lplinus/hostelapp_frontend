import VerificationForm from "@/components/user/VerificationForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Verify Account | Hostel In",
    description: "Verify your Hostel In account to start booking hostels.",
};

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 px-6">
            <Suspense fallback={null}>
                <VerificationForm />
            </Suspense>
        </main>
    );
}
