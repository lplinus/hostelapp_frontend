'use client';

import { useState } from 'react';
import {
    Bell,
    Shield,
    Save,
    Info,
    Smartphone,
    Monitor,
    History,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function VendorSettingsView() {
    const [isLoading, setIsLoading] = useState(false);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderUpdates: true,
        marketplaceVisibility: true,
        twoFactorAuth: false,
        loginAlerts: true,
    });

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Settings updated successfully!');
        }, 1000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your business preferences and account security.
                </p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 border">
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell size={15} /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield size={15} /> Security
                    </TabsTrigger>
                </TabsList>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Notification Preferences</CardTitle>
                            <CardDescription>Configure how you want to be notified about orders and updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <p className="text-xs text-muted-foreground">Receive daily summaries and critical updates via email.</p>
                                    </div>
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onCheckedChange={(val) => setSettings({ ...settings, emailNotifications: val })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Order Updates</Label>
                                        <p className="text-xs text-muted-foreground">Get instant alerts for new orders and procurement requests.</p>
                                    </div>
                                    <Switch
                                        checked={settings.orderUpdates}
                                        onCheckedChange={(val) => setSettings({ ...settings, orderUpdates: val })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Marketplace Visibility</Label>
                                        <p className="text-xs text-muted-foreground">Show your business to hostel owners in search results.</p>
                                    </div>
                                    <Switch
                                        checked={settings.marketplaceVisibility}
                                        onCheckedChange={(val) => setSettings({ ...settings, marketplaceVisibility: val })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSave} disabled={isLoading} className="gap-2 px-8">
                                    <Save size={16} /> Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Account Protection</CardTitle>
                            <CardDescription>Enhance your business panel security with additional verification layers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={16} className="text-blue-500" />
                                            <Label className="text-base">Two-Factor Authentication (2FA)</Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Add an extra layer of security by requiring a code from your phone.</p>
                                    </div>
                                    <Switch
                                        checked={settings.twoFactorAuth}
                                        onCheckedChange={(val) => setSettings({ ...settings, twoFactorAuth: val })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-blue-500" />
                                            <Label className="text-base">Login Alerts</Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Get notified immediately when your account is accessed from a new device.</p>
                                    </div>
                                    <Switch
                                        checked={settings.loginAlerts}
                                        onCheckedChange={(val) => setSettings({ ...settings, loginAlerts: val })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Button onClick={handleSave} disabled={isLoading} className="gap-2 px-8">
                                    <Save size={16} /> Update Security
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-muted-foreground" />
                                <CardTitle className="text-lg">Recent Login Activity</CardTitle>
                            </div>
                            <CardDescription>Review the devices that have accessed your vendor panel recently.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-0 p-0">
                            <div className="divide-y">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Monitor size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Windows PC • Pune, India</p>
                                            <p className="text-[10px] text-muted-foreground">Chrome • Active now</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={10} />
                                        This Device
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                            <Smartphone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">iPhone 14 • Mumbai, India</p>
                                            <p className="text-[10px] text-muted-foreground">Safari • 2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
