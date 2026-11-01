"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
    Sparkles,
    RotateCcw,
    Zap,
    PawPrint,
    ShieldCheck,
    Palmtree,
    Waves,
    Trees,
    Building,
    Home,
    Bed,
    Search
} from "lucide-react";

export interface VacationRentalFilterState {
    searchQuery: string;
    categories: string[];
    maxPrice: number;
    minBedrooms: number;
    instantBookOnly: boolean;
    petsAllowedOnly: boolean;
    superhostOnly: boolean;
    selectedAmenities: string[];
}

interface VacationRentalFiltersSidebarProps {
    readonly filters: VacationRentalFilterState;
    readonly onFilterChange: (filters: VacationRentalFilterState) => void;
    readonly onResetFilters: () => void;
    readonly isDrawerMode?: boolean;
}

const CATEGORIES = [
    { key: "villa", label: "Villa", icon: Palmtree },
    { key: "beach_house", label: "Beach House", icon: Waves },
    { key: "cabin", label: "Cabin", icon: Trees },
    { key: "farmhouse", label: "Farmhouse", icon: Home },
    { key: "penthouse", label: "Penthouse", icon: Building },
    { key: "cottage", label: "Cottage", icon: Home },
    { key: "apartment", label: "Apartment", icon: Building },
];

const POPULAR_AMENITIES = [
    "Private Pool",
    "High-Speed Wi-Fi",
    "Air Conditioning",
    "Ocean View",
    "Free Parking",
    "Fully Equipped Kitchen",
    "Barbecue Grill",
    "Patio & Garden",
    "Dedicated Workspace",
    "Daily Housekeeping",
];

export default function VacationRentalFiltersSidebar({
    filters,
    onFilterChange,
    onResetFilters,
    isDrawerMode = false,
}: VacationRentalFiltersSidebarProps) {
    const handleCategoryToggle = (categoryKey: string) => {
        const nextCategories = filters.categories.includes(categoryKey)
            ? filters.categories.filter((c) => c !== categoryKey)
            : [...filters.categories, categoryKey];

        onFilterChange({
            ...filters,
            categories: nextCategories,
        });
    };

    const handleAmenityToggle = (amenity: string) => {
        const nextAmenities = filters.selectedAmenities.includes(amenity)
            ? filters.selectedAmenities.filter((a) => a !== amenity)
            : [...filters.selectedAmenities, amenity];

        onFilterChange({
            ...filters,
            selectedAmenities: nextAmenities,
        });
    };

    return (
        <aside
            className={
                isDrawerMode
                    ? "w-full bg-transparent p-0 space-y-6"
                    : "w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-6"
            }
        >
            {/* Header / Reset - Shown only in non-drawer mode */}
            {!isDrawerMode && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Palmtree size={15} />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Filters</span>
                    </div>
                    <button
                        onClick={onResetFilters}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                        <RotateCcw size={12} />
                        Reset
                    </button>
                </div>
            )}

            {/* 1. Property Category */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Property Category
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => {
                        const isSelected = filters.categories.includes(cat.key);
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => handleCategoryToggle(cat.key)}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                                    isSelected
                                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                        : "bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                                }`}
                            >
                                <Icon size={14} className={isSelected ? "text-rose-300" : "text-slate-500"} />
                                <span className="truncate">{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Price Range Slider */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Max Nightly Price
                    </h4>
                    <span className="text-xs font-extrabold text-slate-900">
                        ₹{filters.maxPrice.toLocaleString("en-IN")}
                    </span>
                </div>
                <Slider
                    value={[filters.maxPrice]}
                    min={2000}
                    max={35000}
                    step={1000}
                    onValueChange={(val) =>
                        onFilterChange({
                            ...filters,
                            maxPrice: val[0],
                        })
                    }
                    className="py-2"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>₹2,000</span>
                    <span>₹35,000+</span>
                </div>
            </div>

            {/* 3. Minimum Bedrooms */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Bedrooms
                </h4>
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((num) => (
                        <button
                            key={num}
                            onClick={() => onFilterChange({ ...filters, minBedrooms: num })}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                filters.minBedrooms === num
                                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                    : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {num === 0 ? "Any" : `${num}+`}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Instant Booking & Superhost Toggles */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Booking Preferences
                </h4>
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-emerald-600 fill-current" />
                            <span className="text-xs font-medium text-slate-700">Instant Book Only</span>
                        </div>
                        <Switch
                            checked={filters.instantBookOnly}
                            onCheckedChange={(checked) =>
                                onFilterChange({ ...filters, instantBookOnly: checked })
                            }
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                            <PawPrint size={14} className="text-amber-600" />
                            <span className="text-xs font-medium text-slate-700">Allows Pets</span>
                        </div>
                        <Switch
                            checked={filters.petsAllowedOnly}
                            onCheckedChange={(checked) =>
                                onFilterChange({ ...filters, petsAllowedOnly: checked })
                            }
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-rose-500" />
                            <span className="text-xs font-medium text-slate-700">Superhost Properties</span>
                        </div>
                        <Switch
                            checked={filters.superhostOnly}
                            onCheckedChange={(checked) =>
                                onFilterChange({ ...filters, superhostOnly: checked })
                            }
                        />
                    </label>
                </div>
            </div>

            {/* 5. Amenities Checklist */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Curated Amenities
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {POPULAR_AMENITIES.map((amenity) => {
                        const isChecked = filters.selectedAmenities.includes(amenity);
                        return (
                            <label
                                key={amenity}
                                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => handleAmenityToggle(amenity)}
                                    className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                />
                                <span className="font-medium">{amenity}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
