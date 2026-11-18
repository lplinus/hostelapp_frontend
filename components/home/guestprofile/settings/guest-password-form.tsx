'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { authApiClient } from '@/lib/api/auth-client';

export default function GuestPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.new_password !== formData.confirm_new_password) {
            toast.error('New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await authApiClient.post('/api/auth/change-password/', formData);
            toast.success('Password changed successfully');
            setFormData({
                current_password: '',
                new_password: '',
                confirm_new_password: ''
            });
        } catch (error: any) {
            console.error('Password change error:', error);
            const errorData = error.response?.data;
            const errorMessage = errorData?.detail || errorData?.new_password?.[0] || errorData?.current_password?.[0] || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border border-border/60 rounded-lg bg-card shadow-xs w-full">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-md">
                    <Lock size={20} />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-foreground">Change Password</CardTitle>
                    <CardDescription className="text-xs">Update your guest account password to stay secure.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="guest_current_password">Current Password</Label>
                        <div className="relative group">
                            <Input
                                id="guest_current_password"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter current password"
                                required
                                value={formData.current_password}
                                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                className="pr-10 border-muted-foreground/20 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer"
                                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guest_new_password">New Password</Label>
                            <div className="relative group">
                                <Input
                                    id="guest_new_password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    required
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    className="pr-10 border-muted-foreground/20 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer"
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guest_confirm_password">Confirm New Password</Label>
                            <div className="relative group">
                                <Input
                                    id="guest_confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    required
                                    value={formData.confirm_new_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_new_password: e.target.value })}
                                    className="pr-10 border-muted-foreground/20 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#312E81] hover:bg-[#252269] text-white font-semibold rounded-md px-6 h-10 shadow-sm cursor-pointer transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
