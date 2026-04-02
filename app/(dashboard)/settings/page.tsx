import { Settings as SettingsIcon, Shield, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";

export const metadata: Metadata = {
    title: "Settings | Hostel In",
    description: "Manage your account settings and preferences on Hostel In.",
};

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <DashboardSidebar />

            <main className="flex-1 p-4 md:p-8 space-y-8">
                <DashboardHeader />

                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your account preferences and system settings.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Account Section */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl">
                                    <SettingsIcon size={20} />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Account Preferences</CardTitle>
                                    <CardDescription>Update your personal information and language settings.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive updates about your hostel bookings.</p>
                                    </div>
                                    <Button variant="outline" size="sm">Configure</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Section */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="p-3 bg-orange-100/50 text-orange-600 rounded-xl">
                                    <Shield size={20} />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Privacy & Security</CardTitle>
                                    <CardDescription>Manage your password and security protocols.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                    </div>
                                    <Badge variant="secondary">Disabled</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* App Settings */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="p-3 bg-green-100/50 text-green-600 rounded-xl">
                                    <Smartphone size={20} />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">System Settings</CardTitle>
                                    <CardDescription>Configure application-wide settings and theme.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="font-medium text-gray-900">System Theme</p>
                                        <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
                                    </div>
                                    <Button variant="outline" size="sm">Light Mode</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
