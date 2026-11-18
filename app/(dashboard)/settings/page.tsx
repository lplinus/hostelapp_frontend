import { Settings as SettingsIcon, Shield, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import ChangePasswordForm from "@/components/hostelowner/settings/change-password-form";
import ThemeSettings from "@/components/hostelowner/settings/theme-settings";

export const metadata: Metadata = {
    title: "Settings | Hostel In",
    description: "Manage your account settings and preferences on Hostel In.",
};

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6 min-w-0">
                <DashboardHeader />

                <div className="flex-1 w-full space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and system settings.</p>
                    </div>

                    <div className="w-full space-y-6">
                        {/* Account Section */}
                        <Card className="border border-border/40 rounded-lg bg-card shadow-xs w-full">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-md">
                                    <SettingsIcon size={20} />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold text-foreground">Account Preferences</CardTitle>
                                    <CardDescription className="text-xs">Update your personal information and language settings.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                                        <p className="text-xs text-muted-foreground">Receive updates about your hostel bookings.</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-md text-xs">Configure</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Section */}
                        <ChangePasswordForm />

                        {/* Theme & Display Settings */}
                        <ThemeSettings storageKey="owner-theme-preference" />
                    </div>
                </div>
            </main>
        </div>
    );
}
