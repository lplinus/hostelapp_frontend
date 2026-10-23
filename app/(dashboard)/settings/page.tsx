import { Settings as SettingsIcon, Shield, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import ChangePasswordForm from "@/components/user/settings/change-password-form";

export const metadata: Metadata = {
    title: "Settings | Hostel In",
    description: "Manage your account settings and preferences on Hostel In.",
};

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />

            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and system settings.</p>
                    </div>

                    <div className="grid gap-6 max-w-4xl">
                        {/* Account Section */}
                        <Card className="border border-border/40 rounded-xl bg-card shadow-xs">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
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
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs">Configure</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Section */}
                        <ChangePasswordForm />

                        {/* App Settings */}
                        <Card className="border border-border/40 rounded-xl bg-card shadow-xs">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Smartphone size={20} />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold text-foreground">System Settings</CardTitle>
                                    <CardDescription className="text-xs">Configure application-wide settings and theme.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">System Theme</p>
                                        <p className="text-xs text-muted-foreground">Switch between light and dark mode.</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs">Light Mode</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
