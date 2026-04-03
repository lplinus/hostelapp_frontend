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
    isPasswordEditable: boolean;
    setIsPasswordEditable: (val: boolean) => void;
    showPassword: boolean;
    setShowPassword: (val: boolean) => void;
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
    isPasswordEditable,
    setIsPasswordEditable,
    showPassword,
    setShowPassword,
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
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>
            </div>

            {/* Password Section */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 flex items-center gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password ?? "********"}
                            onChange={handleChange}
                            disabled={!isPasswordEditable}
                            placeholder="Enter new password"
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 pl-10 ${!isPasswordEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed font-mono" : "bg-white"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={!isPasswordEditable}
                            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${!isPasswordEditable ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600"} transition-colors`}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (isPasswordEditable) {
                                setShowPassword(false);
                                setFormData({ ...formData, password: undefined });
                            }
                            setIsPasswordEditable(!isPasswordEditable);
                        }}
                        className={`p-2 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center ${isPasswordEditable
                            ? "bg-indigo-600 text-white shadow-indigo-200 rotate-12 scale-110"
                            : "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 hover:scale-105"
                            }`}
                        title={isPasswordEditable ? "Cancel" : "Edit Password"}
                    >
                        <Pencil className={`w-4 h-4 ${isPasswordEditable ? "animate-pulse" : ""}`} />
                    </button>

                    {isPasswordEditable && (
                        <button
                            type="button"
                            onClick={() => {
                                const pwd = formData.password || "";
                                const isValid = pwd.length >= 8 &&
                                    /[A-Z]/.test(pwd) &&
                                    /[a-z]/.test(pwd) &&
                                    /\d/.test(pwd) &&
                                    /[^A-Za-z0-9]/.test(pwd);

                                if (!isValid) {
                                    toast.error("Please meet all password requirements.");
                                    return;
                                }

                                const data = new FormData();
                                data.append("password", pwd);
                                mutation.mutate(data, {
                                    onSuccess: () => {
                                        setIsPasswordEditable(false);
                                        setShowPassword(false);
                                        setFormData({ ...formData, password: undefined });
                                    }
                                });
                            }}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            {mutation.isPending ? "Saving..." : "Save"}
                        </button>
                    )}
                </div>
                {isPasswordEditable && (
                    <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="mb-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <p className="text-[9px] text-orange-700 leading-relaxed font-bold">
                                <span className="text-orange-600 uppercase tracking-wider block mb-0.5">⚠️ Security Caution</span>
                                Please remember your password carefully. Once saved, it will be encrypted and shown only as stars for security, and cannot be viewed in plain text.
                            </p>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-2">Password Requirements</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <ValidationItem label="8+ Characters" met={(formData.password?.length ?? 0) >= 8} />
                            <ValidationItem label="Upper Case" met={/[A-Z]/.test(formData.password || "")} />
                            <ValidationItem label="Lower Case" met={/[a-z]/.test(formData.password || "")} />
                            <ValidationItem label="Numbers" met={/\d/.test(formData.password || "")} />
                            <ValidationItem label="Special Char" met={/[^A-Za-z0-9]/.test(formData.password || "")} />
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center gap-2">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        disabled={!isEmailEditable}
                        className={`flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 ${!isEmailEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                    />
                    <button
                        type="button"
                        onClick={() => setIsEmailEditable(!isEmailEditable)}
                        className={`p-2 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center ${isEmailEditable
                            ? "bg-indigo-600 text-white shadow-indigo-200 rotate-12 scale-110"
                            : "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 hover:scale-105"
                            }`}
                        title={isEmailEditable ? "Editing Email" : "Edit Email"}
                    >
                        <Pencil className={`w-4 h-4 ${isEmailEditable ? "animate-pulse" : ""}`} />
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 flex items-center gap-2">
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
                        className={`flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 ${!isPhoneEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                    />
                    <button
                        type="button"
                        onClick={() => setIsPhoneEditable(!isPhoneEditable)}
                        className={`p-2 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center ${isPhoneEditable
                            ? "bg-indigo-600 text-white shadow-indigo-200 rotate-12 scale-110"
                            : "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 hover:scale-105"
                            }`}
                        title={isPhoneEditable ? "Editing Phone" : "Edit Phone"}
                    >
                        <Pencil className={`w-4 h-4 ${isPhoneEditable ? "animate-pulse" : ""}`} />
                    </button>
                    {isVerified ? (
                        <span className="inline-flex items-center px-3 py-2 rounded-md bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
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
                                setShowOtpModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            Verify
                        </button>
                    )}
                </div>
                {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">Please enter a valid 10-digit phone number.</p>
                )}
            </div>

            {/* Avatar section inside personal info */}
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl text-slate-300 font-black capitalize">{profile?.username?.[0] || 'U'}</span>
                        )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 cursor-pointer w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white hover:bg-blue-700 transition-colors">
                        <Pencil size={14} />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-700">Display Picture</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG or GIF. Max {storageSettings.max_image_size_mb}MB</p>
                </div>
            </div>

            {profile?.role === 'vendor' ? (
                <div className="flex items-center gap-3 mt-10">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 bg-[#0a0e27] text-white h-11 rounded-xl hover:bg-black transition-all text-xs font-bold tracking-wide flex items-center justify-center gap-2"
                    >
                        {mutation.isPending ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check size={14} className="stroke-[3]" />
                        )}
                        {mutation.isPending ? "Saving..." : "Update Profile"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('business')}
                        className="flex-1 h-11 rounded-xl border-slate-200 text-slate-700 text-xs font-bold tracking-wide hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        Business Details
                        <ChevronDown className="-rotate-90" size={14} />
                    </Button>
                </div>
            ) : (
                <div className="mt-10">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-[#0a0e27] text-white h-11 rounded-xl hover:bg-black transition-all text-xs font-bold tracking-wide flex items-center justify-center gap-2"
                    >
                        {mutation.isPending ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check size={14} className="stroke-[3]" />
                        )}
                        {mutation.isPending ? "Saving..." : "Update Profile"}
                    </Button>
                </div>
            )}
        </div>
    );
}
