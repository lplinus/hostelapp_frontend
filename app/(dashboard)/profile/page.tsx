"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OtpVerificationModal } from "@/components/user/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import { getStorageSettings, StorageSettings } from "@/services/cms.service";
import { Pencil, Eye, EyeOff, Lock, CheckCircle2, Circle } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: profile, isLoading } = useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
    });

    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [storageSettings, setStorageSettings] = useState<StorageSettings>({ max_image_size_mb: 15 });
    const [isEmailEditable, setIsEmailEditable] = useState(false);
    const [isPhoneEditable, setIsPhoneEditable] = useState(false);
    const [isPasswordEditable, setIsPasswordEditable] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        getStorageSettings().then(setStorageSettings);
    }, []);

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                first_name: prev.first_name ?? profile.first_name,
                last_name: prev.last_name ?? profile.last_name,
                email: prev.email ?? profile.email,
                phone: prev.phone ?? profile.phone,
            }));
            if (profile.profile_picture && !preview) {
                setPreview(profile.profile_picture);
            }
        }
    }, [profile, preview]);

    // Robust verification check
    const isVerified = profile?.is_phone_verified && 
                      formData.phone && 
                      profile.phone && 
                      formData.phone === profile.phone;

    const mutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success("Profile updated successfully");
        },
        onError: () => {
            toast.error("Error updating profile");
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > storageSettings.max_image_size_mb * 1024 * 1024) {
                toast.error(`Profile picture must be under ${storageSettings.max_image_size_mb}MB`);
                return;
            }
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check for phone verification if phone is changed or not verified
        if (formData.phone && !isVerified) {
            setShowOtpModal(true);
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                data.append(key, String(value));
            }
        });
        if (profilePic) {
            data.append("profile_picture", profilePic);
        }
        mutation.mutate(data);
    };

    // Helper for password validation UI
    const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
        <div className={`flex items-center gap-2 text-[10px] transition-colors ${met ? "text-green-600" : "text-gray-400"}`}>
            {met ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            <span className={met ? "font-bold" : "font-medium"}>{label}</span>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        className={`p-2 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center ${
                                            isPasswordEditable 
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
                                                        setFormData({ ...formData, password: undefined }); // Reset after save
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
                                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-2">Password Requirements</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <ValidationItem label="8+ Characters" met={(formData.password?.length ?? 0) >= 8} />
                                            <ValidationItem label="Upper Case" met={/[A-Z]/.test(formData.password || "")} />
                                            <ValidationItem label="Lower Case" met={/[a-z]/.test(formData.password || "")} />
                                            <ValidationItem label="Numbers" met={/\d/.test(formData.password || "")} />
                                            <ValidationItem label="Special Char" met={/[^A-Za-z0-9]/.test(formData.password || "")} />
                                        </div>
                                        <p className="mt-3 text-[9px] text-gray-500 italic border-t border-gray-200 pt-2">
                                            Please note your password carefully. Once saved, it will be encrypted and shown only as stars for security.
                                        </p>
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
                                        className={`p-2 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center ${
                                            isEmailEditable 
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
                                        className={`p-2 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center ${
                                            isPhoneEditable 
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


                            {/* Avatar File Upload Dummy Field */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-100 flex items-center justify-center mb-2">
                                    {preview ? (
                                        <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl text-gray-400 capitalize">{profile?.username?.[0] || 'U'}</span>
                                    )}
                                </div>
                                <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    Change Photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-[10px] text-gray-400 mt-1">Max {storageSettings.max_image_size_mb}MB</p>
                            </div>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {mutation.isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
            <OtpVerificationModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onSuccess={async () => {
                    toast.success("Phone verified! You can now save your profile.");
                    await queryClient.refetchQueries({ queryKey: ["userProfile"] });
                    await queryClient.refetchQueries({ queryKey: ["authUser"] });
                }}
                phone={formData.phone}
            />
        </div>
    );
}
