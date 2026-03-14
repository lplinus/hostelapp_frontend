"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OtpVerificationModal } from "@/components/user/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";

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

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
                phone: profile.phone,
            });
            if (profile.profile_picture) {
                setPreview(profile.profile_picture);
            }
        }
    }, [profile]);

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
            if (file.size > 15 * 1024 * 1024) {
                toast.error("Profile picture must be under 15MB");
                return;
            }
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check for phone verification if phone is changed or not verified
        if (profile && !profile.is_phone_verified && formData.phone) {
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
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
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
                                        onChange={(e) => {
                                            const val = e.target.value.replaceAll(/\D/g, "");
                                            if (val.length <= 10) {
                                                setFormData({ ...formData, phone: val });
                                            }
                                        }}
                                        placeholder="10-digit mobile number"
                                        className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    />
                                    {profile?.is_phone_verified && profile.phone && formData.phone === profile.phone ? (
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
                                <p className="text-[10px] text-gray-400 mt-1">Max 15MB</p>
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
                onSuccess={() => {
                    toast.success("Phone verified! You can now save your profile.");
                    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                }}
                phone={formData.phone}
            />
        </div>
    );
}
