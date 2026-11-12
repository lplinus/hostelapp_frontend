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
            {/* Business Logo Banner Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-7 bg-muted/40 rounded-sm border border-border/60">
                <div className="w-24 h-24 rounded-sm bg-background border border-border flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
                    {vendorLogoPreview ? (
                        <img src={vendorLogoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                        <Store size={32} className="text-muted-foreground/60" />
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                    <h3 className="text-base font-bold text-foreground">
                        {vendorFormData.business_name || 'Business Identity'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Upload your official brand logo for higher credibility across vendor catalogs and marketplace listings.
                    </p>
                    <div>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer px-4 py-2 bg-background border border-border rounded-sm text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-2xs">
                            Upload Logo
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
                        <span className="text-[11px] text-muted-foreground ml-3">Recommended square image (512x512)</span>
                    </div>
                </div>
            </div>

            {/* Business Info Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Business Name</label>
                    <input
                        type="text"
                        value={vendorFormData.business_name}
                        onChange={(e) => setVendorFormData({ ...vendorFormData, business_name: e.target.value })}
                        placeholder="Enter store or company name"
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Business Description</label>
                    <textarea
                        rows={3}
                        value={vendorFormData.description}
                        onChange={(e) => setVendorFormData({ ...vendorFormData, description: e.target.value })}
                        placeholder="Tell us about your business, specialties, supply capabilities..."
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium resize-none shadow-2xs"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Business Address</label>
                    <textarea
                        rows={2}
                        value={vendorFormData.address}
                        onChange={(e) => setVendorFormData({ ...vendorFormData, address: e.target.value })}
                        placeholder="Enter complete business location and address"
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium resize-none shadow-2xs"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Contact Phone</label>
                    <input
                        type="text"
                        value={vendorFormData.contact_phone}
                        onChange={(e) => setVendorFormData({ ...vendorFormData, contact_phone: e.target.value })}
                        placeholder="Business mobile"
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Contact Email</label>
                    <input
                        type="email"
                        value={vendorFormData.contact_email}
                        onChange={(e) => setVendorFormData({ ...vendorFormData, contact_email: e.target.value })}
                        placeholder="Business email"
                        className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Specialties & Categories */}
            <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Specialties & Categories</label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsVendorTypeDropdownOpen(!isVendorTypeDropdownOpen)}
                        className="w-full flex flex-wrap items-center gap-2 p-3 min-h-[50px] rounded-sm border border-border bg-background hover:border-primary/50 transition-all text-left cursor-pointer"
                    >
                        <div className="flex-1 flex flex-wrap gap-2">
                            {selectedVendorTypes.length === 0 ? (
                                <span className="text-muted-foreground text-xs italic">Select your business categories...</span>
                            ) : (
                                selectedVendorTypes.map(typeValue => (
                                    <span key={typeValue} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground text-[11px] font-bold rounded-xs shadow-2xs">
                                        {VENDOR_TYPES.find(t => t.value === typeValue)?.label || typeValue}
                                    </span>
                                ))
                            )}
                        </div>
                        <ChevronDown className={`text-muted-foreground transition-transform duration-200 ${isVendorTypeDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                    </button>

                    {isVendorTypeDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-card rounded-sm border border-border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-64 overflow-y-auto p-2">
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
                                                flex items-center justify-between p-3 rounded-xs transition-all text-left w-full cursor-pointer
                                                ${isSelected
                                                    ? 'bg-primary/10 text-primary font-bold'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground font-medium'}
                                            `}
                                        >
                                            <span className="text-xs">
                                                {type.label}
                                            </span>
                                            {isSelected && <Check size={14} className="text-primary stroke-[3]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                    {mutation.isPending ? "Saving..." : "Update Business Identity"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('personal')}
                    className="w-full sm:w-auto h-11 rounded-sm text-xs font-bold tracking-wide hover:bg-muted transition-all flex items-center justify-center gap-2 cursor-pointer border-border px-6"
                >
                    Personal Profile
                </Button>
            </div>
        </div>
    );
}
