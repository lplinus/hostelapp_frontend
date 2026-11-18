import type { Metadata } from "next";
import { Suspense } from "react";
import GuestSidebar from "@/components/home/guestprofile/guest-sidebar";
import GuestSettingsHeader from "@/components/home/guestprofile/settings/guest-settings-header";
import GuestThemeSettings from "@/components/home/guestprofile/settings/guest-theme-settings";
import GuestNotificationSettings from "@/components/home/guestprofile/settings/guest-notification-settings";
import GuestPasswordForm from "@/components/home/guestprofile/settings/guest-password-form";

export const metadata: Metadata = {
    title: "Settings | Guest Portal",
    description: "Manage your theme, notification preferences, and guest security settings.",
};

export default function GuestSettingsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <Suspense fallback={null}>
                <GuestSidebar />
            </Suspense>

            <main className="flex-1 p-3 sm:p-5 lg:p-7 space-y-6 pb-24 md:pb-8 min-w-0 overflow-x-hidden">
                <div className="w-full space-y-6">
                    {/* Header (Client Component with sidebar toggle) */}
                    <GuestSettingsHeader />

                    {/* Settings Sections - Full Page Width */}
                    <div className="w-full space-y-6">
                        {/* Theme Section */}
                        <GuestThemeSettings />

                        {/* Account Notifications */}
                        <GuestNotificationSettings />

                        {/* Security / Password Section */}
                        <GuestPasswordForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
