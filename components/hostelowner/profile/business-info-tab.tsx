'use client';

import { Store, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface BusinessInfoTabProps {
    vendorFormData: {
        business_name: string;
        description: string;
        address: string;
        contact_phone: string;
        contact_email: string;
    };
    setVendorFormData: (data: BusinessInfoTabProps['vendorFormData']) => void;
    vendorLogoPreview: string | null;
    setVendorLogo: (file: File | null) => void;
    setVendorLogoPreview: (url: string | null) => void;
    selectedVendorTypes: string[];
    setSelectedVendorTypes: (fn: (prev: string[]) => string[]) => void;
    isVendorTypeDropdownOpen: boolean;
    setIsVendorTypeDropdownOpen: (val: boolean) => void;
    setActiveTab: (tab: 'personal' | 'business') => void;
    mutation: { isPending: boolean };
}

export default function BusinessInfoTab({
    vendorFormData,
    setVendorFormData,
    vendorLogoPreview,
    setVendorLogo,
    setVendorLogoPreview,
    selectedVendorTypes,
    setSelectedVendorTypes,
    isVendorTypeDropdownOpen,
    setIsVendorTypeDropdownOpen,
    setActiveTab,
    mutation,
}: BusinessInfoTabProps) {
    return (
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

            <div className="pt-4">
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
        </div>
    );
}
