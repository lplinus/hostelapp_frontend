"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CustomLightningBoltIcon, CustomPetIcon } from "@/components/ui/custom-icons";
import {
    Sparkles,
    RotateCcw,
    Zap,
    PawPrint,
    Palmtree,
    Waves,
    Trees,
    Building,
    Home,
    Filter
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
    readonly totalCount?: number;
    readonly filteredCount?: number;
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
    totalCount,
    filteredCount,
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

    const hasActiveFilters =
        filters.categories.length > 0 ||
        filters.maxPrice < 35000 ||
        filters.minBedrooms > 0 ||
        filters.instantBookOnly ||
        filters.petsAllowedOnly ||
        filters.superhostOnly ||
        filters.selectedAmenities.length > 0 ||
        Boolean(filters.searchQuery);

    return (
        <aside
            className={
                isDrawerMode
                    ? "w-full bg-transparent p-0 space-y-4"
                    : "w-full bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col max-h-[calc(100vh-9.5rem)]"
            }
        >
            {/* Header / Reset - Fixed at top of card (never scrolls away) */}
            {!isDrawerMode && (
                <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Palmtree size={13} />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Filters</h3>
                        {typeof filteredCount === "number" && typeof totalCount === "number" && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                {filteredCount}/{totalCount}
                            </span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                            <RotateCcw size={11} />
                            Reset
                        </button>
                    )}
                </div>
            )}

            {/* Scrollable Filters Body Container (Normal scrollable without visible scrollbar) */}
            <div
                className={
                    isDrawerMode
                        ? "space-y-3.5"
                        : "flex-1 overflow-y-auto pr-0 space-y-3.5 overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                }
            >
                {/* 1. Property Category */}
                <div className="space-y-2">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Property Category
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5">
                        {CATEGORIES.map((cat) => {
                            const isSelected = filters.categories.includes(cat.key);
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => handleCategoryToggle(cat.key)}
                                    className={`flex items-center gap-1.5 p-1.5 px-2 rounded-md border text-[11px] font-medium transition-all cursor-pointer ${isSelected
                                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                        : "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                                        }`}
                                >
                                    <Icon size={13} className={isSelected ? "text-rose-300" : "text-slate-500"} />
                                    <span className="truncate">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Price Range Slider */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                            Max Nightly Price
                        </h4>
                        <span className="text-[11px] font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-sm">
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
                        className="py-1"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>₹2,000</span>
                        <span>₹35,000+</span>
                    </div>
                </div>

                {/* 3. Minimum Bedrooms */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Bedrooms
                    </h4>
                    <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => onFilterChange({ ...filters, minBedrooms: num })}
                                className={`flex-1 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${filters.minBedrooms === num
                                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                    : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                {num === 0 ? "Any" : `${num}+`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Instant Booking & Superhost Toggles */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Booking Preferences
                    </h4>
                    <div className="space-y-2">
                        <label className="flex items-center justify-between py-0.5 cursor-pointer">
                            <div className="flex items-center gap-1.5">
                                <CustomLightningBoltIcon className="w-3.5 h-3.5 shrink-0" fill="#070707" />
                                <span className="text-[11px] font-medium text-slate-700">Instant Book Only</span>
                            </div>
                            <Switch
                                checked={filters.instantBookOnly}
                                onCheckedChange={(checked) =>
                                    onFilterChange({ ...filters, instantBookOnly: checked })
                                }
                            />
                        </label>

                        <label className="flex items-center justify-between py-0.5 cursor-pointer">
                            <div className="flex items-center gap-1.5">
                                <CustomPetIcon className="w-3.5 h-3.5 shrink-0" stroke="#070707" />
                                <span className="text-[11px] font-medium text-slate-700">Allows Pets</span>
                            </div>
                            <Switch
                                checked={filters.petsAllowedOnly}
                                onCheckedChange={(checked) =>
                                    onFilterChange({ ...filters, petsAllowedOnly: checked })
                                }
                            />
                        </label>

                        <label className="flex items-center justify-between py-0.5 cursor-pointer">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={13} className="text-rose-500" />
                                <span className="text-[11px] font-medium text-slate-700">Superhost Properties</span>
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
                <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Curated Amenities
                    </h4>
                    <div className="space-y-1.5">
                        {POPULAR_AMENITIES.map((amenity) => {
                            const isChecked = filters.selectedAmenities.includes(amenity);
                            return (
                                <label
                                    key={amenity}
                                    className="flex items-center gap-2 py-0.5 text-[11px] text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={() => handleAmenityToggle(amenity)}
                                        className="h-3.5 w-3.5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                    />
                                    <span className="font-medium">{amenity}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
