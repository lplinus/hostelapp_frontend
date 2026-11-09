"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    BedDouble,
    Users,
    Sparkles,
    Upload,
    X,
    CheckCircle2,
    ImageIcon,
    Trash2,
    Coffee,
    Wind,
    Sun,
    Building2,
    Palmtree,
    HelpCircle,
    Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { toLocalMediaPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface RoomFormData {
    id?: string | number;
    propertyId: string;
    propertyName?: string;
    propertyType: "hotel" | "vacation_rental";
    name: string;
    category: string;
    bed_type: string;
    base_price_per_night: string;
    weekend_price_per_night?: string;
    tax_percentage?: string;
    max_adults: string;
    max_children: string;
    max_occupancy?: string;
    total_rooms: string;
    rooms_available: string;
    room_size_sqft?: string;
    has_balcony: boolean;
    has_view: boolean;
    includes_breakfast: boolean;
    is_refundable: boolean;
    is_available: boolean;
    description: string;
    features: string[];
    existingImages?: Array<{
        id: number;
        image: string;
        altText?: string;
        isPrimary?: boolean;
    }>;
}

export interface PropertyOption {
    id: string;
    name: string;
    type: "hotel" | "vacation_rental";
    slug?: string;
}

interface RoomEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: RoomFormData | null;
    properties: PropertyOption[];
    selectedPropertyId?: string;
    onSubmit: (formData: RoomFormData, photoFiles: File[]) => Promise<void>;
    isSubmitting?: boolean;
}

const HOTEL_TEMPLATES = [
    {
        label: "Deluxe King Suite",
        category: "deluxe",
        bed_type: "king",
        max_adults: "2",
        max_children: "1",
        room_size_sqft: "380",
        base_price_per_night: "3499",
        has_balcony: true,
        has_view: true,
        includes_breakfast: true,
        features: ["Air Conditioning", "Free WiFi", "Bathtub", "Mini-bar", "City View"],
    },
    {
        label: "Executive Business Suite",
        category: "executive_suite",
        bed_type: "king",
        max_adults: "2",
        max_children: "0",
        room_size_sqft: "450",
        base_price_per_night: "4999",
        has_balcony: true,
        has_view: true,
        includes_breakfast: true,
        features: ["Air Conditioning", "Work Desk", "High-speed WiFi", "Smart TV", "Safe"],
    },
    {
        label: "Standard Twin Room",
        category: "standard",
        bed_type: "twin",
        max_adults: "2",
        max_children: "0",
        room_size_sqft: "280",
        base_price_per_night: "2199",
        has_balcony: false,
        has_view: false,
        includes_breakfast: false,
        features: ["Air Conditioning", "Free WiFi", "Smart TV"],
    },
    {
        label: "Family Suite",
        category: "family_suite",
        bed_type: "double",
        max_adults: "4",
        max_children: "2",
        room_size_sqft: "580",
        base_price_per_night: "5999",
        has_balcony: true,
        has_view: true,
        includes_breakfast: true,
        features: ["Air Conditioning", "Free WiFi", "2 Queen Beds", "Bathtub", "Living Area"],
    },
    {
        label: "Studio Penthouse",
        category: "studio",
        bed_type: "king",
        max_adults: "2",
        max_children: "1",
        room_size_sqft: "520",
        base_price_per_night: "6499",
        has_balcony: true,
        has_view: true,
        includes_breakfast: true,
        features: ["Air Conditioning", "Kitchenette", "Private Balcony", "Panoramic View"],
    },
];

const VACATION_RENTAL_TEMPLATES = [
    {
        label: "Luxury Villa",
        category: "villa",
        bed_type: "king",
        max_adults: "6",
        max_children: "2",
        room_size_sqft: "1800",
        base_price_per_night: "12999",
        has_balcony: true,
        has_view: true,
        includes_breakfast: false,
        features: ["Private Pool", "High-Speed Wi-Fi", "Air Conditioning", "Kitchenette", "Garden View"],
    },
    {
        label: "Modern Penthouse",
        category: "penthouse",
        bed_type: "king",
        max_adults: "4",
        max_children: "1",
        room_size_sqft: "1200",
        base_price_per_night: "16999",
        has_balcony: true,
        has_view: true,
        includes_breakfast: false,
        features: ["Panoramic View", "Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Bathtub"],
    },
    {
        label: "Countryside Cottage",
        category: "cottage",
        bed_type: "double",
        max_adults: "4",
        max_children: "2",
        room_size_sqft: "850",
        base_price_per_night: "6499",
        has_balcony: true,
        has_view: true,
        includes_breakfast: true,
        features: ["Fireplace", "Garden View", "Air Conditioning", "Free Parking"],
    },
    {
        label: "Urban Studio",
        category: "studio",
        bed_type: "queen",
        max_adults: "2",
        max_children: "0",
        room_size_sqft: "450",
        base_price_per_night: "3999",
        has_balcony: false,
        has_view: true,
        includes_breakfast: false,
        features: ["Work Desk", "High-Speed Wi-Fi", "Smart TV", "Kitchenette"],
    },
    {
        label: "Beach House",
        category: "beach_house",
        bed_type: "king",
        max_adults: "8",
        max_children: "3",
        room_size_sqft: "2200",
        base_price_per_night: "21999",
        has_balcony: true,
        has_view: true,
        includes_breakfast: true,
        features: ["Sea View", "Private Pool", "Air Conditioning", "Direct Beach Access", "BBQ Grill"],
    },
];

const HOTEL_CATEGORIES = [
    { value: "standard", label: "Standard Room" },
    { value: "deluxe", label: "Deluxe Room" },
    { value: "executive_suite", label: "Executive Suite" },
    { value: "family_suite", label: "Family Suite" },
    { value: "presidential_suite", label: "Presidential Suite" },
    { value: "studio", label: "Studio Penthouse" },
];

const VACATION_CATEGORIES = [
    { value: "villa", label: "Villa" },
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "Independent House" },
    { value: "cottage", label: "Cottage" },
    { value: "farmhouse", label: "Farmhouse" },
    { value: "beach_house", label: "Beach House" },
    { value: "cabin", label: "Cabin" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
];

const AVAILABLE_AMENITIES = [
    "Air Conditioning",
    "High-Speed Wi-Fi",
    "Smart TV",
    "Bathtub",
    "Mini-bar",
    "Work Desk",
    "Coffee / Tea Maker",
    "In-Room Safe",
    "Room Service",
    "Hair Dryer",
    "Soundproofing",
    "Wardrobe",
];

export default function RoomEditModal({
    open,
    onOpenChange,
    initialData,
    properties,
    selectedPropertyId,
    onSubmit,
    isSubmitting = false,
}: RoomEditModalProps) {
    const isEditMode = !!initialData?.id;

    const [form, setForm] = useState<RoomFormData>({
        propertyId: selectedPropertyId || (properties[0]?.id ?? ""),
        propertyType: properties[0]?.type || "hotel",
        name: "",
        category: "deluxe",
        bed_type: "king",
        base_price_per_night: "",
        weekend_price_per_night: "",
        tax_percentage: "12",
        max_adults: "2",
        max_children: "1",
        total_rooms: "5",
        rooms_available: "5",
        room_size_sqft: "350",
        has_balcony: false,
        has_view: true,
        includes_breakfast: false,
        is_refundable: true,
        is_available: true,
        description: "",
        features: ["Air Conditioning", "High-Speed Wi-Fi"],
    });

    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync form state when modal opens or initialData changes
    useEffect(() => {
        if (open) {
            const defaultPropId = selectedPropertyId || (properties[0]?.id ?? "");
            const defaultProp = properties.find((p) => p.id === defaultPropId);
            const activeType = initialData?.propertyType || defaultProp?.type || "hotel";

            if (initialData) {
                const validChoices = activeType === "vacation_rental" ? VACATION_CATEGORIES : HOTEL_CATEGORIES;
                const hasValidCat = validChoices.some((c) => c.value === initialData.category);
                const safeCat = hasValidCat
                    ? initialData.category
                    : (activeType === "vacation_rental" ? "villa" : "deluxe");

                setForm({
                    ...initialData,
                    category: safeCat,
                    tax_percentage: initialData.tax_percentage || "12",
                    features: initialData.features || [],
                });
            } else {
                setForm({
                    propertyId: defaultPropId,
                    propertyType: activeType,
                    name: "",
                    category: activeType === "vacation_rental" ? "villa" : "deluxe",
                    bed_type: "king",
                    base_price_per_night: "",
                    weekend_price_per_night: "",
                    tax_percentage: "12",
                    max_adults: activeType === "vacation_rental" ? "4" : "2",
                    max_children: "1",
                    total_rooms: activeType === "vacation_rental" ? "1" : "5",
                    rooms_available: activeType === "vacation_rental" ? "1" : "5",
                    room_size_sqft: activeType === "vacation_rental" ? "1200" : "350",
                    has_balcony: false,
                    has_view: true,
                    includes_breakfast: false,
                    is_refundable: true,
                    is_available: true,
                    description: "",
                    features: activeType === "vacation_rental"
                        ? ["High-Speed Wi-Fi", "Air Conditioning"]
                        : ["Air Conditioning", "High-Speed Wi-Fi"],
                });
            }
            setPhotoFiles([]);
            setPhotoPreviews([]);
        }
    }, [open, initialData, selectedPropertyId, properties]);

    // Apply template preset
    const applyPreset = (preset: typeof HOTEL_TEMPLATES[0] | typeof VACATION_RENTAL_TEMPLATES[0]) => {
        setForm((prev) => ({
            ...prev,
            name: preset.label,
            category: preset.category,
            bed_type: preset.bed_type,
            max_adults: preset.max_adults,
            max_children: preset.max_children,
            room_size_sqft: preset.room_size_sqft,
            base_price_per_night: preset.base_price_per_night,
            has_balcony: preset.has_balcony,
            has_view: preset.has_view,
            includes_breakfast: preset.includes_breakfast,
            features: preset.features,
        }));
        toast.info(`Applied template: ${preset.label}`);
    };

    const activeTemplates = form.propertyType === "vacation_rental"
        ? VACATION_RENTAL_TEMPLATES
        : HOTEL_TEMPLATES;

    const categoryOptions = form.propertyType === "vacation_rental"
        ? VACATION_CATEGORIES
        : HOTEL_CATEGORIES;

    // Toggle amenity feature
    const toggleFeature = (feature: string) => {
        setForm((prev) => {
            const exists = prev.features.includes(feature);
            return {
                ...prev,
                features: exists
                    ? prev.features.filter((f) => f !== feature)
                    : [...prev.features, feature],
            };
        });
    };

    // Handle photo file selection
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setPhotoFiles((prev) => [...prev, ...files]);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removePhotoPreview = (index: number) => {
        setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.propertyId) {
            toast.error("Please select a property for this room.");
            return;
        }

        if (!form.name.trim()) {
            toast.error("Room category name is required.");
            return;
        }

        const price = parseFloat(form.base_price_per_night);
        if (isNaN(price) || price <= 0) {
            toast.error("Please enter a valid positive nightly rate.");
            return;
        }

        await onSubmit(form, photoFiles);
    };

    const selectedProp = properties.find((p) => p.id === form.propertyId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Header */}
                    <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-card sticky top-0 z-20">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#312E81]/10 text-[#312E81]">
                                        <BedDouble size={12} />
                                        {isEditMode ? "Edit Room Unit" : "Add Room Unit"}
                                    </span>
                                    {selectedProp && (
                                        <span className="text-xs text-muted-foreground font-medium">
                                            for {selectedProp.name}
                                        </span>
                                    )}
                                </div>
                                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                    {isEditMode ? `Edit ${form.name || "Room"}` : "Create New Room or Suite Type"}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Define inventory, bed setup, per-night tariffs, perks, and photos for guest reservations.
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Quick Preset Templates (Only when creating) */}
                        {!isEditMode && (
                            <div className="pt-3 border-t mt-3 space-y-1.5">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={11} className="text-amber-500" />
                                    Quick Autofill Templates:
                                </span>
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                    {activeTemplates.map((tmpl) => (
                                        <button
                                            key={tmpl.label}
                                            type="button"
                                            onClick={() => applyPreset(tmpl)}
                                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-[#312E81] text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 transition-all shrink-0 cursor-pointer"
                                        >
                                            + {tmpl.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DialogHeader>

                    {/* Form Fields Body */}
                    <div className="p-5 sm:p-6 space-y-5 text-xs">
                        {/* 1. Property Association (if multiple properties exist) */}
                        {properties.length > 1 && !selectedPropertyId && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Associated Property *</Label>
                                <Select
                                    value={form.propertyId}
                                    onValueChange={(val) => {
                                        const prop = properties.find((p) => p.id === val);
                                        const newType = prop?.type || "hotel";
                                        setForm((prev) => ({
                                            ...prev,
                                            propertyId: val,
                                            propertyType: newType,
                                            category: newType === "vacation_rental" ? "villa" : "deluxe",
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs bg-background">
                                        <SelectValue placeholder="Select Property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {properties.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} ({p.type === "hotel" ? "Hotel" : "Vacation Rental"})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* 2. Room Name & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Room / Unit Name *</Label>
                                <Input
                                    placeholder="e.g. Deluxe Sea View King Suite"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Category Classification</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(val) => setForm({ ...form, category: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs bg-background">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 3. Bed Setup & Capacity */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                <Label className="text-xs font-semibold">Bed Configuration</Label>
                                <Select
                                    value={form.bed_type}
                                    onValueChange={(val) => setForm({ ...form, bed_type: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs bg-background">
                                        <SelectValue placeholder="Bed Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="king">1 King Bed</SelectItem>
                                        <SelectItem value="queen">1 Queen Bed</SelectItem>
                                        <SelectItem value="twin">2 Twin Beds</SelectItem>
                                        <SelectItem value="double">2 Double Beds</SelectItem>
                                        <SelectItem value="single">1 Single Bed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Max Adults</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={form.max_adults}
                                    onChange={(e) => setForm({ ...form, max_adults: e.target.value })}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Max Children</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="6"
                                    value={form.max_children}
                                    onChange={(e) => setForm({ ...form, max_children: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Room Size (Sq Ft)</Label>
                                <Input
                                    type="number"
                                    placeholder="350"
                                    value={form.room_size_sqft || ""}
                                    onChange={(e) => setForm({ ...form, room_size_sqft: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        {/* 4. Pricing & Inventory */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border space-y-3">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders size={13} className="text-[#312E81]" />
                                Tariffs & Inventory Limits
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Nightly Rate (₹) *</Label>
                                    <Input
                                        type="number"
                                        placeholder="2999"
                                        value={form.base_price_per_night}
                                        onChange={(e) => setForm({ ...form, base_price_per_night: e.target.value })}
                                        className="h-9 text-xs font-bold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Weekend Rate (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Optional surge"
                                        value={form.weekend_price_per_night || ""}
                                        onChange={(e) => setForm({ ...form, weekend_price_per_night: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Total Units</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={form.total_rooms}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                total_rooms: e.target.value,
                                                rooms_available: e.target.value,
                                            })
                                        }
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Available Units</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={form.rooms_available}
                                        onChange={(e) => setForm({ ...form, rooms_available: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Inclusions & Policies */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Highlights & Stay Policies</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.includes_breakfast}
                                        onChange={(e) => setForm({ ...form, includes_breakfast: e.target.checked })}
                                        className="rounded border-input text-[#312E81] focus:ring-[#312E81]"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <Coffee size={13} className="text-amber-500" />
                                        <span className="font-medium">Free Breakfast</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.has_balcony}
                                        onChange={(e) => setForm({ ...form, has_balcony: e.target.checked })}
                                        className="rounded border-input text-[#312E81] focus:ring-[#312E81]"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <Wind size={13} className="text-sky-500" />
                                        <span className="font-medium">Private Balcony</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.has_view}
                                        onChange={(e) => setForm({ ...form, has_view: e.target.checked })}
                                        className="rounded border-input text-[#312E81] focus:ring-[#312E81]"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <Sun size={13} className="text-amber-500" />
                                        <span className="font-medium">Scenic View</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.is_refundable}
                                        onChange={(e) => setForm({ ...form, is_refundable: e.target.checked })}
                                        className="rounded border-input text-[#312E81] focus:ring-[#312E81]"
                                    />
                                    <span className="font-medium">Free Cancellation</span>
                                </label>

                                <label className="flex items-center gap-2 p-2.5 rounded-lg border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.is_available}
                                        onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                                        className="rounded border-input text-[#312E81] focus:ring-[#312E81]"
                                    />
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                        Active / Available
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* 6. Amenities Checklist */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Room Amenities & Features</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border">
                                {AVAILABLE_AMENITIES.map((amenity) => {
                                    const isChecked = form.features.includes(amenity);
                                    return (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleFeature(amenity)}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer text-xs",
                                                isChecked
                                                    ? "bg-[#312E81] text-white font-semibold shadow-2xs"
                                                    : "bg-background border border-slate-200/80 hover:bg-slate-100 text-foreground"
                                            )}
                                        >
                                            <CheckCircle2
                                                size={13}
                                                className={isChecked ? "text-white" : "text-muted-foreground/40"}
                                            />
                                            <span className="truncate">{amenity}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 7. Room Description */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Room Description (Optional)</Label>
                            <textarea
                                rows={2}
                                placeholder="Describe the ambiance, bedding quality, terrace views, or exclusive amenities..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:ring-1 focus:ring-[#312E81]"
                            />
                        </div>

                        {/* 8. Room Photos Upload */}
                        <div className="space-y-2.5 pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-xs font-semibold">Room Photos</Label>
                                    <p className="text-[11px] text-muted-foreground">
                                        Upload dedicated photos for this room or suite type (PNG, JPG, WEBP).
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="gap-1.5 text-xs h-8"
                                >
                                    <Upload size={12} />
                                    Choose Photos
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoSelect}
                                />
                            </div>

                            {/* Existing Photos (if editing) */}
                            {form.existingImages && form.existingImages.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                        Current Photos ({form.existingImages.length})
                                    </span>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {form.existingImages.map((img) => (
                                            <div
                                                key={img.id}
                                                className="relative h-20 rounded-lg overflow-hidden border group bg-slate-900"
                                            >
                                                <img
                                                    src={toLocalMediaPath(img.image) || img.image}
                                                    alt="Room photo"
                                                    className="w-full h-full object-cover"
                                                />
                                                {img.isPrimary && (
                                                    <span className="absolute bottom-1 left-1 bg-[#312E81] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                        Cover
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Photos Previews */}
                            {photoPreviews.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        New Photos to Upload ({photoPreviews.length})
                                    </span>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {photoPreviews.map((preview, i) => (
                                            <div
                                                key={i}
                                                className="relative h-20 rounded-lg overflow-hidden border group bg-slate-100"
                                            >
                                                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhotoPreview(i)}
                                                    className="absolute top-1 right-1 p-1 rounded-md bg-black/75 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="p-4 sm:p-5 border-t bg-card sticky bottom-0 z-20 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                            className="bg-[#312E81] hover:bg-[#252269] text-white text-xs font-semibold px-5 shadow-xs cursor-pointer"
                        >
                            {isSubmitting
                                ? "Saving Room..."
                                : isEditMode
                                ? "Update Room Specifications"
                                : "Publish Room Type"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

