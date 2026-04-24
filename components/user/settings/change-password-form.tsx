'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { authApiClient } from '@/lib/api/auth-client';

export default function ChangePasswordForm() {
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
            // Error handler in auth-client might already toast, but let's be safe
            // Actually, handleApiError in client.ts throws errors which are then caught here.
            const errorData = error.response?.data;
            const errorMessage = errorData?.detail || errorData?.new_password?.[0] || errorData?.current_password?.[0] || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-muted shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-indigo-100/50 text-indigo-600 rounded-xl">
                    <Lock size={20} />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-xl">Change Password</CardTitle>
                    <CardDescription>Update your account password to stay secure.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <div className="relative group">
                            <Input
                                id="current_password"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter current password"
                                required
                                value={formData.current_password}
                                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                className="pr-10 border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 transition-colors"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_password">New Password</Label>
                            <div className="relative group">
                                <Input
                                    id="new_password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    required
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    className="pr-10 border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm_new_password">Confirm New Password</Label>
                            <div className="relative group">
                                <Input
                                    id="confirm_new_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    required
                                    value={formData.confirm_new_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_new_password: e.target.value })}
                                    className="pr-10 border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-8 h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
