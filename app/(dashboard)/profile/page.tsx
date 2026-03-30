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
import { Pencil, Eye, EyeOff, Lock, CheckCircle2, Circle, Store, Check, ChevronDown } from "lucide-react";

const VENDOR_TYPES = [
    { value: 'rice', label: 'Rice & Grains' },
    { value: 'vegetables', label: 'Vegetables & Fruits' },
    { value: 'dairy', label: 'Milk & Dairy Products' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'meat', label: 'Meat & Poultry' },
    { value: 'kirana', label: 'Kirana / General Store' },
    { value: 'oil', label: 'Cooking Oil & Spices' },
    { value: 'bakery', label: 'Bakery & Bread' },
    { value: 'water', label: 'Drinking Water Supply' },
];

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

    // Helper for password validation UI
    const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
        <div className={`flex items-center gap-2 text-[10px] transition-colors ${met ? "text-green-600" : "text-gray-400"}`}>
            {met ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            <span className={met ? "font-bold" : "font-medium"}>{label}</span>
        </div>
    );

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
                            {/* View Content Switching */}
                            {activeTab === 'personal' ? (
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

                                    {profile?.role === 'vendor' && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('business')}
                                            className="w-full mt-8 py-4 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.99]"
                                        >
                                            Next: Business Details
                                            <ChevronDown className="-rotate-90 text-slate-400" size={16} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Business Name</label>
                                            <input
                                                type="text"
                                                value={vendorFormData.business_name}
                                                onChange={(e) => setVendorFormData({ ...vendorFormData, business_name: e.target.value })}
                                                placeholder="Enter store/company name"
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Business Description</label>
                                            <textarea
                                                rows={3}
                                                value={vendorFormData.description}
                                                onChange={(e) => setVendorFormData({ ...vendorFormData, description: e.target.value })}
                                                placeholder="Tell us about your business history, specialties, and goals..."
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium resize-none shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Business Address</label>
                                            <textarea
                                                rows={2}
                                                value={vendorFormData.address}
                                                onChange={(e) => setVendorFormData({ ...vendorFormData, address: e.target.value })}
                                                placeholder="Enter complete business location"
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium resize-none shadow-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Contact Phone</label>
                                                <input
                                                    type="text"
                                                    value={vendorFormData.contact_phone}
                                                    onChange={(e) => setVendorFormData({ ...vendorFormData, contact_phone: e.target.value })}
                                                    placeholder="Business mobile"
                                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Contact Email</label>
                                                <input
                                                    type="email"
                                                    value={vendorFormData.contact_email}
                                                    onChange={(e) => setVendorFormData({ ...vendorFormData, contact_email: e.target.value })}
                                                    placeholder="Business email"
                                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Business Logo</label>
                                            <div className="flex items-center gap-4 p-4 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                                                <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                                    {vendorLogoPreview ? (
                                                        <img src={vendorLogoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Store size={24} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="inline-block cursor-pointer px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm">
                                                        Upload New Logo
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setVendorLogo(file);
                                                                    setVendorLogoPreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400">Recommended square size (e.g. 512x512)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Specialties & Categories</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsVendorTypeDropdownOpen(!isVendorTypeDropdownOpen)}
                                                className="w-full flex flex-wrap items-center gap-2 p-3 min-h-[50px] rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-all text-left"
                                            >
                                                <div className="flex-1 flex flex-wrap gap-2">
                                                    {selectedVendorTypes.length === 0 ? (
                                                        <span className="text-gray-400 text-xs italic">Select your business categories...</span>
                                                    ) : (
                                                        selectedVendorTypes.map(typeValue => (
                                                            <span key={typeValue} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                                                                {VENDOR_TYPES.find(t => t.value === typeValue)?.label || typeValue}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                                <ChevronDown className={`text-gray-400 transition-transform duration-200 ${isVendorTypeDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                            </button>

                                            {isVendorTypeDropdownOpen && (
                                                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto p-2 custom-scrollbar">
                                                        {VENDOR_TYPES.map((type) => {
                                                            const isSelected = selectedVendorTypes.includes(type.value);
                                                            return (
                                                                <button
                                                                    key={type.value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedVendorTypes(prev =>
                                                                            isSelected
                                                                                ? prev.filter(v => v !== type.value)
                                                                                : [...prev, type.value]
                                                                        );
                                                                    }}
                                                                    className={`
                                                                        flex items-center justify-between p-3 rounded-lg transition-all duration-150 text-left w-full
                                                                        ${isSelected
                                                                            ? 'bg-blue-50 text-blue-700'
                                                                            : 'hover:bg-slate-50 text-gray-600'}
                                                                    `}
                                                                >
                                                                    <span className="text-xs font-bold">
                                                                        {type.label}
                                                                    </span>
                                                                    {isSelected && <Check size={14} className="text-blue-600 stroke-[3]" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('personal')}
                                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors py-2"
                                    >
                                        ← Back to Personal Profile
                                    </button>
                                </div>
                            )}

                            <div className="pt-10">
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full bg-[#0a0e27] text-white py-4 rounded-2xl hover:bg-black hover:shadow-2xl hover:shadow-indigo-500/10 border border-white/5 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {mutation.isPending ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Check size={14} className="stroke-[4]" />
                                    )}
                                    {mutation.isPending ? "Synchronizing..." : "Update Your Profile"}
                                </button>
                            </div>
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
