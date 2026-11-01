"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { HostelListItem } from "@/types/hostel.types";
import HostelLocationSection from "../location/hostel-location-section";
import { cn } from "@/lib/utils";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createCity, createArea } from "@/services/location.service";
import { createAmenity } from "@/services/hostelservices/amenity.service";
import {
    Building2,
    MapPin,
    CreditCard,
    Clock,
    FileText,
    Sparkles,
    Check,
    X,
    Plus,
    Percent,
    CheckCircle2,
    Tag,
    ChevronDown,
    Layers,
    Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HostelFormProps {
    initialData?: HostelListItem | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    isPending: boolean;
    cities: any[] | undefined;
    areas: any[] | undefined;
    states: any[] | undefined;
    amenities: any[] | undefined;
}

export type ExtraChargeForm = {
    id?: number;
    charge_type: "electricity" | "water" | "maintenance" | "wifi" | "laundry" | "other";
    amount: string;
    description: string;
};

const SUITABLE_OPTIONS = [
    { id: "student", name: "Student" },
    { id: "job_holder", name: "Job Holder" },
    { id: "working_professional", name: "Working Professional" },
    { id: "both", name: "Both" },
    { id: "anyone", name: "Anyone" },
];

const SuitableForDropdown = ({
    idPrefix,
    initialSelected,
}: {
    idPrefix: string;
    initialSelected: string[];
}) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(initialSelected);

    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    const toggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );
    };

    const label =
        selected.length === 0
            ? "Select..."
            : selected
                .map((s) => SUITABLE_OPTIONS.find((o) => o.id === s)?.name)
                .filter(Boolean)
                .join(", ");

    return (
        <div className="space-y-1.5 relative">
            <label
                htmlFor={`${idPrefix}-suitable_for`}
                className="block text-xs font-semibold text-foreground"
            >
                Suitable For
            </label>
            {selected.map((id) => (
                <input key={id} type="hidden" name="suitable_for" value={id} />
            ))}
            <div
                onClick={() => setOpen(!open)}
                className="w-full border border-input h-9 px-3 rounded-md bg-background cursor-pointer flex items-center justify-between text-xs transition-colors hover:border-primary/50 shadow-xs"
            >
                <span
                    className={`truncate ${selected.length === 0 ? "text-muted-foreground" : "text-foreground font-medium"
                        }`}
                >
                    {label}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
            </div>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto">
                        {SUITABLE_OPTIONS.map((opt) => (
                            <div
                                key={opt.id}
                                onClick={() => toggle(opt.id)}
                                className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-muted/70 transition-colors text-xs"
                            >
                                <div
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white text-[9px] transition-all ${selected.includes(opt.id)
                                        ? "bg-primary border-primary text-primary-foreground font-bold"
                                        : "border-muted-foreground/40 bg-background"
                                        }`}
                                >
                                    {selected.includes(opt.id) && "✓"}
                                </div>
                                <span className="font-medium text-foreground">{opt.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const AmenityItem = ({
    am,
    isInitiallySelected,
}: {
    am: any;
    isInitiallySelected: boolean;
}) => {
    const [checked, setChecked] = useState(isInitiallySelected);

    useEffect(() => {
        setChecked(isInitiallySelected);
    }, [isInitiallySelected]);

    return (
        <label
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer text-xs transition-all ${checked
                ? "bg-primary/10 border-primary/40 text-primary font-semibold shadow-2xs"
                : "bg-card border-border/60 hover:bg-muted/40 text-muted-foreground"
                }`}
        >
            <input
                type="checkbox"
                name="amenities"
                value={am.id}
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
            />
            <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 transition-colors ${checked
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/40 bg-background"
                    }`}
            >
                {checked && "✓"}
            </div>
            <span className="truncate pr-1">{am.name}</span>
        </label>
    );
};

const HostelForm: React.FC<HostelFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isPending,
    cities,
    areas,
    states,
    amenities,
}) => {
    const queryClient = useQueryClient();
    const [selectedCity, setSelectedCity] = useState<string>(
        initialData?.city?.id?.toString() || ""
    );
    const [selectedArea, setSelectedArea] = useState<string>(
        initialData?.area?.id?.toString() || ""
    );

    // New Location States
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState("");
    const [newCityState, setNewCityState] = useState("");

    const [isAddingArea, setIsAddingArea] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");

    const [isAddingAmenity, setIsAddingAmenity] = useState(false);
    const [newAmenityName, setNewAmenityName] = useState("");

    const createCityMutation = useMutation({
        mutationFn: createCity,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["cities"] });
            setSelectedCity(data.id.toString());
            setIsAddingCity(false);
            setNewCityName("");
            setNewCityState("");
            toast.success("New city added!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to add city"),
    });

    const createAreaMutation = useMutation({
        mutationFn: createArea,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
            setSelectedArea(data.id.toString());
            setIsAddingArea(false);
            setNewAreaName("");
            toast.success("New area added!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to add area"),
    });

    const createAmenityMutation = useMutation({
        mutationFn: createAmenity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["amenities"] });
            setIsAddingAmenity(false);
            setNewAmenityName("");
            toast.success("New amenity added!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to add amenity"),
    });

    const [lat, setLat] = useState(initialData?.latitude?.toString() || "");
    const [lng, setLng] = useState(initialData?.longitude?.toString() || "");
    const [address, setAddress] = useState(initialData?.address || "");

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [extraCharges, setExtraCharges] = useState<ExtraChargeForm[]>(() => {
        if (!initialData?.extra_charges) return [];
        return initialData.extra_charges.map((ec) => ({
            id: ec.id,
            charge_type: ec.charge_type as any,
            amount: ec.amount.toString(),
            description: ec.description || "",
        }));
    });

    const handleAddExtraCharge = () => {
        setExtraCharges([
            ...extraCharges,
            { charge_type: "electricity", amount: "", description: "" },
        ]);
    };

    const handleRemoveExtraCharge = (index: number) => {
        setExtraCharges(extraCharges.filter((_, i) => i !== index));
    };

    const handleUpdateExtraCharge = (
        index: number,
        field: keyof ExtraChargeForm,
        value: any
    ) => {
        const updated = [...extraCharges];
        updated[index] = { ...updated[index], [field]: value };
        setExtraCharges(updated);
    };

    useEffect(() => {
        if (initialData) {
            setSelectedCity(initialData.city?.id?.toString() || "");
            setLat(initialData.latitude?.toString() || "");
            setLng(initialData.longitude?.toString() || "");
            setAddress(initialData.address || "");
        } else {
            setSelectedCity("");
            setSelectedArea("");
            setLat("");
            setLng("");
            setAddress("");
            setExtraCharges([]);
        }
    }, [initialData]);

    const filteredAreas = areas?.filter((a) => a.city === Number(selectedCity)) ?? [];
    const idPrefix = initialData ? "edit" : "create";

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newErrors: Record<string, string> = {};

        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const short_desc = formData.get("short_description") as string;
        const city = formData.get("city") as string;
        const postalCode = formData.get("postal_code") as string;

        if (!name || name.trim().length < 3) {
            newErrors.name = "Hostel name must be at least 3 characters long.";
        }

        if (!city) {
            newErrors.city = "Please select a city.";
        }

        if (!price || Number(price) <= 0) {
            newErrors.price = "Price must be a positive number.";
        }

        if (!short_desc || short_desc.trim().length < 10) {
            newErrors.short_description = "Short description should be at least 10 characters.";
        }

        if (!postalCode || !/^\d{5,6}$/.test(postalCode)) {
            newErrors.postal_code = "Please enter a valid 5 or 6 digit postal code.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in the required fields correctly.");
            return;
        }

        setErrors({});
        onSubmit(e);
    };

    return (
        <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border/70 shadow-lg p-5 sm:p-7 mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border/50 mb-5">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            <Building2 size={11} />
                            Hostel Management
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {initialData ? `Edit Hostel: ${initialData.name}` : "Add New Hostel Property"}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Configure property classification, monthly tariff, location, and amenities.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* ── 1. Basic Information ──────────────────────────── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                        <Building2 size={13} className="text-primary" />
                        <span>Basic Property Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-name`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Hostel Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                id={`${idPrefix}-name`}
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Sri Balaji Luxury PG"
                                defaultValue={initialData?.name}
                                onChange={() => {
                                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                                }}
                                className={cn(
                                    "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none transition-colors",
                                    errors.name
                                        ? "border-destructive focus:ring-1 focus:ring-destructive"
                                        : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
                                )}
                            />
                            {errors.name && (
                                <p className="text-[10px] text-destructive font-medium">{errors.name}</p>
                            )}
                        </div>

                        {/* Hostel Type */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-hostel_type`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Hostel Type <span className="text-destructive">*</span>
                            </label>
                            <select
                                id={`${idPrefix}-hostel_type`}
                                name="hostel_type"
                                defaultValue={initialData?.hostel_type}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                                required
                            >
                                <option value="boys">Boys</option>
                                <option value="girls">Girls</option>
                                <option value="co_living">Co-Living</option>
                                <option value="working_professional">Working Professional</option>
                                <option value="student">Student</option>
                                <option value="luxury">Luxury</option>
                                <option value="budget">Budget</option>
                                <option value="pg">PG</option>
                            </select>
                        </div>

                        {/* Suitable For */}
                        <SuitableForDropdown
                            idPrefix={idPrefix}
                            initialSelected={initialData?.suitable_for || []}
                        />
                    </div>

                    {/* Registration Slug if creating */}
                    {!initialData && (
                        <div className="space-y-1.5 pt-1">
                            <label
                                htmlFor={`${idPrefix}-slug`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Unique Slug / Identifier <span className="text-destructive">*</span>
                            </label>
                            <input
                                id={`${idPrefix}-slug`}
                                type="text"
                                name="slug"
                                required
                                placeholder="e.g. sri-balaji-pg-madhapur"
                                className="w-full h-9 px-3 rounded-md border border-input text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Used to generate your property page URL: /hostel/sri-balaji-pg-madhapur
                            </p>
                        </div>
                    )}
                </div>

                {/* ── 2. City & Neighborhood ───────────────────────── */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                        <MapPin size={13} className="text-primary" />
                        <span>Location & Area</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* City */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor={`${idPrefix}-city`}
                                    className="block text-xs font-semibold text-foreground"
                                >
                                    City <span className="text-destructive">*</span>
                                </label>
                                {!isAddingCity && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCity(true)}
                                        className="text-[10px] font-semibold text-primary hover:underline"
                                    >
                                        + New City
                                    </button>
                                )}
                            </div>

                            {isAddingCity ? (
                                <div className="space-y-2 p-2 rounded-lg bg-muted/40 border border-border/70">
                                    <input
                                        type="text"
                                        placeholder="City Name"
                                        value={newCityName}
                                        onChange={(e) => setNewCityName(e.target.value)}
                                        className="w-full h-8 px-2.5 rounded border border-input text-xs bg-background"
                                    />
                                    <select
                                        value={newCityState}
                                        onChange={(e) => setNewCityState(e.target.value)}
                                        className="w-full h-8 px-2 rounded border border-input text-xs bg-background"
                                    >
                                        <option value="" disabled>Select State</option>
                                        {states?.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-1.5 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCity(false)}
                                            className="px-2 py-1 text-[11px] rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                createCityMutation.mutate({
                                                    name: newCityName,
                                                    state: Number(newCityState),
                                                })
                                            }
                                            disabled={!newCityName || !newCityState || createCityMutation.isPending}
                                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-primary text-primary-foreground disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <select
                                    id={`${idPrefix}-city`}
                                    name="city"
                                    required
                                    className={cn(
                                        "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium",
                                        errors.city ? "border-destructive" : "border-input"
                                    )}
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.target.value);
                                        if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                                    }}
                                >
                                    <option value="" disabled>Select City</option>
                                    {cities?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            )}
                            {errors.city && (
                                <p className="text-[10px] text-destructive font-medium">{errors.city}</p>
                            )}
                        </div>

                        {/* Area */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor={`${idPrefix}-area`}
                                    className="block text-xs font-semibold text-foreground"
                                >
                                    Area / Colony
                                </label>
                                {!isAddingArea && selectedCity && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingArea(true)}
                                        className="text-[10px] font-semibold text-primary hover:underline"
                                    >
                                        + New Area
                                    </button>
                                )}
                            </div>

                            {isAddingArea ? (
                                <div className="space-y-2 p-2 rounded-lg bg-muted/40 border border-border/70">
                                    <input
                                        type="text"
                                        placeholder="Area Name"
                                        value={newAreaName}
                                        onChange={(e) => setNewAreaName(e.target.value)}
                                        className="w-full h-8 px-2.5 rounded border border-input text-xs bg-background"
                                    />
                                    <div className="flex gap-1.5 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingArea(false)}
                                            className="px-2 py-1 text-[11px] rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                createAreaMutation.mutate({
                                                    name: newAreaName,
                                                    city: Number(selectedCity),
                                                })
                                            }
                                            disabled={!newAreaName || createAreaMutation.isPending}
                                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-primary text-primary-foreground disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <select
                                    id={`${idPrefix}-area`}
                                    name="area"
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                                >
                                    <option value="">Select Area (Optional)</option>
                                    {filteredAreas.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Postal Code */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-postal`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Postal Code <span className="text-destructive">*</span>
                            </label>
                            <input
                                id={`${idPrefix}-postal`}
                                type="text"
                                name="postal_code"
                                required
                                placeholder="e.g. 500081"
                                defaultValue={initialData?.postal_code ?? ""}
                                onChange={() => {
                                    if (errors.postal_code)
                                        setErrors((prev) => ({ ...prev, postal_code: "" }));
                                }}
                                className={cn(
                                    "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                                    errors.postal_code ? "border-destructive" : "border-input"
                                )}
                            />
                            {errors.postal_code && (
                                <p className="text-[10px] text-destructive font-medium">
                                    {errors.postal_code}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Coordinates & Detailed Address */}
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                        <HostelLocationSection
                            lat={lat}
                            lng={lng}
                            address={address}
                            setLat={setLat}
                            setLng={setLng}
                            setAddress={setAddress}
                            idPrefix={idPrefix}
                        />
                    </div>
                </div>

                {/* ── 3. Tariff & Pricing ──────────────────────────── */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                        <CreditCard size={13} className="text-primary" />
                        <span>Pricing & Tariff Schedule</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Price Monthly */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-price`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Monthly Rent (₹) <span className="text-destructive">*</span>
                            </label>
                            <input
                                id={`${idPrefix}-price`}
                                type="number"
                                step="0.01"
                                name="price"
                                required
                                placeholder="e.g. 6500"
                                defaultValue={initialData?.price}
                                onChange={() => {
                                    if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                                }}
                                className={cn(
                                    "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium",
                                    errors.price ? "border-destructive" : "border-input"
                                )}
                            />
                            {errors.price && (
                                <p className="text-[10px] text-destructive font-medium">{errors.price}</p>
                            )}
                        </div>

                        {/* Price Daily */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-price_day`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Daily Rate (₹) (Optional)
                            </label>
                            <input
                                id={`${idPrefix}-price_day`}
                                type="number"
                                step="0.01"
                                name="price_per_day"
                                placeholder="e.g. 400"
                                defaultValue={initialData?.price_per_day ?? ""}
                                className="w-full h-9 px-3 rounded-md border border-input text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>

                        {/* Discount */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-discount`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Discount %
                            </label>
                            <input
                                id={`${idPrefix}-discount`}
                                type="number"
                                step="0.01"
                                name="discount_percentage"
                                placeholder="0"
                                defaultValue={initialData?.discount_percentage ?? 0}
                                className="w-full h-9 px-3 rounded-md border border-input text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                    </div>

                    {/* Checkbox Toggles */}
                    <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                            <input
                                id={`${idPrefix}-is_discounted`}
                                type="checkbox"
                                name="is_discounted"
                                defaultChecked={initialData?.is_discounted ?? false}
                                value="true"
                                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                            />
                            <span>Apply Discount Rate</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                            <input
                                id={`${idPrefix}-is_active`}
                                type="checkbox"
                                name="is_active"
                                defaultChecked={initialData?.is_active ?? true}
                                value="true"
                                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                            />
                            <span>Active / Visible on Platform</span>
                        </label>
                    </div>
                </div>

                {/* ── 4. Operating Hours & Check-in ────────────────── */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                        <Clock size={13} className="text-primary" />
                        <span>Timings & Schedule</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-checkin`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Check-in Time
                            </label>
                            <input
                                id={`${idPrefix}-checkin`}
                                type="time"
                                name="check_in_time"
                                required
                                defaultValue={initialData?.check_in_time || "12:00"}
                                className="w-full h-9 px-3 rounded-md border border-input text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-checkout`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Check-out Time
                            </label>
                            <input
                                id={`${idPrefix}-checkout`}
                                type="time"
                                name="check_out_time"
                                required
                                defaultValue={initialData?.check_out_time || "11:00"}
                                className="w-full h-9 px-3 rounded-md border border-input text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* ── 5. Descriptions ──────────────────────────────── */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                        <FileText size={13} className="text-primary" />
                        <span>Descriptions & Highlights</span>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-short_desc`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Short Summary (At least 10 characters) <span className="text-destructive">*</span>
                            </label>
                            <input
                                id={`${idPrefix}-short_desc`}
                                type="text"
                                name="short_description"
                                required
                                placeholder="e.g. Premium AC PG with homestyle meals near Cyber Towers"
                                defaultValue={initialData?.short_description}
                                onChange={() => {
                                    if (errors.short_description)
                                        setErrors((prev) => ({ ...prev, short_description: "" }));
                                }}
                                className={cn(
                                    "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium",
                                    errors.short_description ? "border-destructive" : "border-input"
                                )}
                            />
                            {errors.short_description && (
                                <p className="text-[10px] text-destructive font-medium">
                                    {errors.short_description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor={`${idPrefix}-desc`}
                                className="block text-xs font-semibold text-foreground"
                            >
                                Full Description <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                id={`${idPrefix}-desc`}
                                name="description"
                                required
                                rows={3}
                                placeholder="Detail room amenities, food menu, security, housekeeping, and nearby connectivity..."
                                defaultValue={initialData?.description}
                                className="w-full p-2.5 rounded-md border border-input text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* ── 6. Amenities Checklist ───────────────────────── */}
                <div className="space-y-2.5 pt-3 border-t border-border/40">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                            <Sparkles size={13} className="text-primary" />
                            <span>Hostel Amenities</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddingAmenity(!isAddingAmenity)}
                            className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                            <Plus size={12} /> Add New Amenity
                        </button>
                    </div>

                    {isAddingAmenity && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                            <input
                                type="text"
                                placeholder="New amenity name (e.g. Geyser, Study Table)..."
                                value={newAmenityName}
                                onChange={(e) => setNewAmenityName(e.target.value)}
                                className="flex-1 h-8 px-2.5 rounded border border-input text-xs bg-background"
                            />
                            <button
                                type="button"
                                onClick={() => createAmenityMutation.mutate(newAmenityName)}
                                disabled={!newAmenityName || createAmenityMutation.isPending}
                                className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                            >
                                {createAmenityMutation.isPending ? "Adding..." : "Add"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingAmenity(false)}
                                className="h-8 px-2.5 rounded bg-muted text-muted-foreground text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 rounded-xl border border-border/60 bg-muted/20 max-h-48 overflow-y-auto">
                        {amenities
                            ?.slice()
                            .sort((a, b) => {
                                const aSelected = initialData?.amenities?.some((item) => item.id === a.id);
                                const bSelected = initialData?.amenities?.some((item) => item.id === b.id);
                                if (aSelected && !bSelected) return -1;
                                if (!aSelected && bSelected) return 1;
                                return 0;
                            })
                            .map((am) => (
                                <AmenityItem
                                    key={am.id}
                                    am={am}
                                    isInitiallySelected={
                                        !!initialData?.amenities?.some((a) => a.id === am.id)
                                    }
                                />
                            ))}
                        {!amenities?.length && (
                            <p className="text-muted-foreground text-xs col-span-full py-3 text-center italic">
                                No amenities available.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── 7. Extra Charges (Optional) ───────────────────── */}
                <div className="space-y-2.5 pt-3 border-t border-border/40">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                            <Tag size={13} className="text-primary" />
                            <span>Extra Charges & Utilities (Optional)</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddExtraCharge}
                            className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                            <Plus size={12} /> Add Charge
                        </button>
                    </div>

                    <input
                        type="hidden"
                        name="extra_charges_json"
                        value={JSON.stringify(extraCharges)}
                    />

                    {extraCharges.length > 0 ? (
                        <div className="space-y-2">
                            {extraCharges.map((charge, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/20 items-center text-xs"
                                >
                                    <div className="sm:col-span-3">
                                        <select
                                            required
                                            value={charge.charge_type}
                                            onChange={(e) =>
                                                handleUpdateExtraCharge(idx, "charge_type", e.target.value)
                                            }
                                            className="w-full h-8 px-2 rounded border border-input bg-background text-xs font-medium"
                                        >
                                            <option value="electricity">Electricity</option>
                                            <option value="water">Water</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="wifi">WiFi</option>
                                            <option value="laundry">Laundry</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={charge.amount}
                                            onChange={(e) =>
                                                handleUpdateExtraCharge(idx, "amount", e.target.value)
                                            }
                                            placeholder="Amount (₹)"
                                            className="w-full h-8 px-2.5 rounded border border-input bg-background text-xs font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            value={charge.description}
                                            onChange={(e) =>
                                                handleUpdateExtraCharge(idx, "description", e.target.value)
                                            }
                                            placeholder="Description (e.g. As per meter)"
                                            className="w-full h-8 px-2.5 rounded border border-input bg-background text-xs"
                                        />
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExtraCharge(idx)}
                                            className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"
                                            title="Remove"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-[11px] italic py-1">
                            No extra charges specified (rent is all-inclusive).
                        </p>
                    )}
                </div>

                {/* ── Form Actions ─────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-semibold border border-input rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isPending
                            ? initialData
                                ? "Updating..."
                                : "Creating..."
                            : initialData
                                ? "Update Hostel"
                                : "Publish Hostel"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HostelForm;
