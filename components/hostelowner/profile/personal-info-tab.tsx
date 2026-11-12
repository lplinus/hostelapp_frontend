'use client';

import { Pencil, Eye, EyeOff, Lock, CheckCircle2, Circle, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserProfile } from "@/services/user.service";
import { StorageSettings } from "@/services/cms.service";
import { UseMutationResult } from "@tanstack/react-query";

interface PersonalInfoTabProps {
    formData: Partial<UserProfile>;
    setFormData: (data: Partial<UserProfile>) => void;
    profile: UserProfile | undefined;
    preview: string | null;
    storageSettings: StorageSettings;
    isEmailEditable: boolean;
    setIsEmailEditable: (val: boolean) => void;
    isPhoneEditable: boolean;
    setIsPhoneEditable: (val: boolean) => void;
    // isPasswordEditable: boolean;
    // setIsPasswordEditable: (val: boolean) => void;
    // showPassword: boolean;
    // setShowPassword: (val: boolean) => void;
    isVerified: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setShowOtpModal: (val: boolean) => void;
    setActiveTab: (tab: 'personal' | 'business') => void;
    mutation: UseMutationResult<any, any, any, any>;
}

export default function PersonalInfoTab({
    formData,
    setFormData,
    profile,
    preview,
    storageSettings,
    isEmailEditable,
    setIsEmailEditable,
    isPhoneEditable,
    setIsPhoneEditable,
    // isPasswordEditable,
    // setIsPasswordEditable,
    // showPassword,
    // setShowPassword,
    isVerified,
    handleChange,
    handleFileChange,
    setShowOtpModal,
    setActiveTab,
    mutation,
}: PersonalInfoTabProps) {
    // Helper for password validation UI
    const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
        <div className={`flex items-center gap-2 text-[10px] transition-colors ${met ? "text-green-600" : "text-gray-400"}`}>
            {met ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            <span className={met ? "font-bold" : "font-medium"}>{label}</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Avatar & High-level Banner Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-7 bg-muted/40 rounded-sm border border-border/60">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-sm overflow-hidden bg-background border border-border shadow-2xs flex items-center justify-center transition-transform group-hover:scale-102">
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl text-muted-foreground font-bold capitalize">{profile?.username?.[0] || 'U'}</span>
                        )}
                    </div>
                    <label className="absolute -bottom-1.5 -right-1.5 cursor-pointer w-7 h-7 bg-primary rounded-xs flex items-center justify-center text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors">
                        <Pencil size={12} />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.username || 'User Profile'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {profile?.role ? `${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Account` : 'Hostel In Member'} · {profile?.email || 'No email registered'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 pt-1">
                        JPG, PNG or GIF. Max {storageSettings.max_image_size_mb}MB
                    </p>
                </div>
            </div>

            {/* Input fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label htmlFor="first_name" className="text-xs font-semibold text-foreground uppercase tracking-wider block">First Name</label>
                    <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="last_name" className="text-xs font-semibold text-foreground uppercase tracking-wider block">Last Name</label>
                    <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wider block">Email Address</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            disabled={!isEmailEditable}
                            className={`flex-1 px-3.5 py-2.5 rounded-sm border border-border text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!isEmailEditable ? "bg-muted/40 text-muted-foreground cursor-not-allowed" : "bg-background"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsEmailEditable(!isEmailEditable)}
                            className={`p-2.5 rounded-sm transition-all shadow-2xs flex items-center justify-center border cursor-pointer ${isEmailEditable
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                                }`}
                            title={isEmailEditable ? "Editing Email" : "Edit Email"}
                        >
                            <Pencil className={`w-4 h-4 ${isEmailEditable ? "animate-pulse" : ""}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold text-foreground uppercase tracking-wider block">Phone Number</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            maxLength={10}
                            value={formData.phone || ""}
                            disabled={!isPhoneEditable}
                            onChange={(e) => {
                                const val = e.target.value.replaceAll(/\D/g, "");
                                if (val.length <= 10) {
                                    setFormData({ ...formData, phone: val });
                                }
                            }}
                            placeholder="10-digit mobile number"
                            className={`flex-1 px-3.5 py-2.5 rounded-sm border border-border text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${!isPhoneEditable ? "bg-muted/40 text-muted-foreground cursor-not-allowed" : "bg-background"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setIsPhoneEditable(!isPhoneEditable)}
                            className={`p-2.5 rounded-sm transition-all shadow-2xs flex items-center justify-center border cursor-pointer ${isPhoneEditable
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                                }`}
                            title={isPhoneEditable ? "Editing Phone" : "Edit Phone"}
                        >
                            <Pencil className={`w-4 h-4 ${isPhoneEditable ? "animate-pulse" : ""}`} />
                        </button>
                        {isVerified ? (
                            <span className="inline-flex items-center px-3 py-2.5 rounded-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                                ✓ Verified
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!formData.phone || formData.phone.length < 10) {
                                        toast.error("Please enter a valid 10-digit phone number first.");
                                        return;
                                    }
                                    toast.success("OTP verification disabled. Proceeding...");
                                }}
                                className="inline-flex items-center px-4 py-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                            >
                                Verify
                            </button>
                        )}
                    </div>
                    {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                        <p className="mt-1 text-xs text-rose-500 font-semibold">Please enter a valid 10-digit phone number.</p>
                    )}
                </div>
            </div>

            {profile?.role === 'vendor' ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-border/40">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full sm:flex-1 h-11 rounded-sm font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                        {mutation.isPending ? (
                            <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Check size={15} className="stroke-[3]" />
                        )}
                        {mutation.isPending ? "Saving..." : "Update Profile"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('business')}
                        className="w-full sm:flex-1 h-11 rounded-sm text-xs font-bold tracking-wide hover:bg-muted transition-all flex items-center justify-center gap-2 cursor-pointer border-border"
                    >
                        Business Details
                        <ChevronDown className="-rotate-90" size={14} />
                    </Button>
                </div>
            ) : (
                <div className="pt-6 border-t border-border/40">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full sm:w-auto min-w-[200px] h-11 rounded-sm font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-xs px-8"
                    >
                        {mutation.isPending ? (
                            <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Check size={15} className="stroke-[3]" />
                        )}
                        {mutation.isPending ? "Saving..." : "Update Profile"}
                    </Button>
                </div>
            )}
        </div>
    );
}
