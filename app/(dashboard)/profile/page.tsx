"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import VendorSidebar from "@/components/vendordashboard/vendor-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/user.service";
import { vendorService } from "@/services/marketplaceservices/vendor.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OtpVerificationModal } from "@/components/user/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import { getStorageSettings, StorageSettings } from "@/services/cms.service";
import PersonalInfoTab from "@/components/user/profile/personal-info-tab";
import BusinessInfoTab from "@/components/user/profile/business-info-tab";

export default function ProfilePage() {
    const { user, initializing: authInitializing } = useAuth();
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
    const [selectedVendorTypes, setSelectedVendorTypes] = useState<string[]>([]);
    const [isVendorTypeDropdownOpen, setIsVendorTypeDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
    const [vendorFormData, setVendorFormData] = useState({
        business_name: "",
        description: "",
        address: "",
        contact_phone: "",
        contact_email: ""
    });
    const [vendorLogo, setVendorLogo] = useState<File | null>(null);
    const [vendorLogoPreview, setVendorLogoPreview] = useState<string | null>(null);

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
            if (profile.vendor_profile) {
                setSelectedVendorTypes(profile.vendor_profile.vendor_types || []);
                setVendorFormData({
                    business_name: profile.vendor_profile.business_name || "",
                    description: profile.vendor_profile.description || "",
                    address: profile.vendor_profile.address || "",
                    contact_phone: profile.vendor_profile.contact_phone || "",
                    contact_email: profile.vendor_profile.contact_email || ""
                });
                if (profile.vendor_profile.logo) {
                    setVendorLogoPreview(profile.vendor_profile.logo);
                }
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

        // Only require OTP verification if the phone number was actually changed or newly added
        const phoneChanged = formData.phone && (
            (!profile?.phone && formData.phone) || // New phone being set
            (profile?.phone && formData.phone !== profile.phone) // Phone was changed
        );
        if (phoneChanged && !isVerified) {
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

        mutation.mutate(data, {
            onSuccess: async () => {
                // Handle Vendor profile (Create or Update)
                if (user?.role === 'vendor') {
                    try {
                        const vendorData = new FormData();
                        Object.entries(vendorFormData).forEach(([k, v]) => {
                            if (v !== undefined && v !== null) {
                                vendorData.append(k, String(v));
                            }
                        });
                        vendorData.append('vendor_types', JSON.stringify(selectedVendorTypes));
                        if (vendorLogo) {
                            vendorData.append('logo', vendorLogo);
                        }

                        if (profile?.vendor_profile?.id) {
                            // Update existing
                            await vendorService.updateVendorProfile(profile.vendor_profile.id, vendorData as any);
                            toast.success("Business details updated");
                        } else {
                            // Create new (if business name is provided)
                            if (vendorFormData.business_name) {
                                await vendorService.createVendorProfile(vendorData as any);
                                toast.success("Business profile created successfully");
                                queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                            }
                        }
                    } catch (err) {
                        console.error("Error managing vendor profile:", err);
                        toast.error("Failed to save business details");
                    }
                }
            }
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {authInitializing ? (
                <div className="w-72 bg-white border-r border-slate-200 hidden md:block" />
            ) : (
                user?.role === 'vendor' ? <VendorSidebar /> : <DashboardSidebar />
            )}
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {activeTab === 'personal' ? 'Personal Profile' : 'Business Identity'}
                            </h2>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">
                                {activeTab === 'personal' ? 'Manage your account details' : 'Professional business presence'}
                            </p>
                        </div>
                        {profile?.role === 'vendor' && (
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Personal
                                </button>
                                <button
                                    onClick={() => setActiveTab('business')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'business' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Business
                                </button>
                            </div>
                        )}
                    </div>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'personal' ? (
                                <PersonalInfoTab
                                    formData={formData}
                                    setFormData={setFormData}
                                    profile={profile}
                                    preview={preview}
                                    storageSettings={storageSettings}
                                    isEmailEditable={isEmailEditable}
                                    setIsEmailEditable={setIsEmailEditable}
                                    isPhoneEditable={isPhoneEditable}
                                    setIsPhoneEditable={setIsPhoneEditable}
                                    isPasswordEditable={isPasswordEditable}
                                    setIsPasswordEditable={setIsPasswordEditable}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    isVerified={!!isVerified}
                                    handleChange={handleChange}
                                    handleFileChange={handleFileChange}
                                    setShowOtpModal={setShowOtpModal}
                                    setActiveTab={setActiveTab}
                                    mutation={mutation}
                                />
                            ) : (
                                <BusinessInfoTab
                                    vendorFormData={vendorFormData}
                                    setVendorFormData={setVendorFormData}
                                    vendorLogoPreview={vendorLogoPreview}
                                    setVendorLogo={setVendorLogo}
                                    setVendorLogoPreview={setVendorLogoPreview}
                                    selectedVendorTypes={selectedVendorTypes}
                                    setSelectedVendorTypes={setSelectedVendorTypes}
                                    isVendorTypeDropdownOpen={isVendorTypeDropdownOpen}
                                    setIsVendorTypeDropdownOpen={setIsVendorTypeDropdownOpen}
                                    setActiveTab={setActiveTab}
                                    mutation={mutation}
                                />
                            )}
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
