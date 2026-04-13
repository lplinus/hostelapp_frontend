"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { HostelListItem } from "@/types/hostel.types";
import HostelLocationSection from "../location/hostel-location-section";
import { cn } from "@/lib/utils";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createCity, createArea } from "@/services/location.service";
import { createAmenity } from "@/services/amenity.service";

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

const AmenityItem = ({ am, isInitiallySelected }: { am: any; isInitiallySelected: boolean }) => {
    const [checked, setChecked] = useState(isInitiallySelected);

    // Sync state if initialData changes
    useEffect(() => {
        setChecked(isInitiallySelected);
    }, [isInitiallySelected]);

    return (
        <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${checked ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200 hover:border-gray-300"
            }`}>
            <input
                type="checkbox"
                name="amenities"
                value={am.id}
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 bg-white cursor-pointer"
            />
            <span className={`text-sm select-none truncate pr-1 ${checked ? "text-blue-700 font-semibold" : "text-gray-600"}`}>
                {am.name}
            </span>
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

    // Location States
    const [lat, setLat] = useState(initialData?.latitude?.toString() || "");
    const [lng, setLng] = useState(initialData?.longitude?.toString() || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [errors, setErrors] = useState<Record<string, string>>({});

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
            return;
        }

        setErrors({});
        onSubmit(e);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                    {initialData ? `Edit Hostel: ${initialData.name}` : "Create New Hostel"}
                </h3>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                    {/* Basic Info */}
                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-name`} className="block text-sm font-semibold text-gray-700">Hostel Name</label>
                        <input
                            id={`${idPrefix}-name`}
                            type="text"
                            name="name"
                            required
                            defaultValue={initialData?.name}
                            onChange={() => {
                                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                            }}
                            className={cn(
                                "w-full border p-2.5 rounded-lg focus:ring-2 transition-all outline-none bg-white font-medium",
                                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            )}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-hostel_type`} className="block text-sm font-semibold text-gray-700">Hostel Type</label>
                        <select
                            id={`${idPrefix}-hostel_type`}
                            name="hostel_type"
                            defaultValue={initialData?.hostel_type}
                            className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium"
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

                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-city`} className="block text-sm font-semibold text-gray-700">City</label>
                        {isAddingCity ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="New City Name"
                                    value={newCityName}
                                    onChange={(e) => setNewCityName(e.target.value)}
                                    className="flex-1 border border-gray-300 p-2.5 rounded-lg text-sm outline-none font-medium text-gray-900"
                                />
                                <select
                                    value={newCityState}
                                    onChange={(e) => setNewCityState(e.target.value)}
                                    className="border border-gray-300 p-2.5 rounded-lg text-sm outline-none bg-white font-medium text-gray-900"
                                >
                                    <option value="" disabled>Select State</option>
                                    {states?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button type="button" onClick={() => createCityMutation.mutate({ name: newCityName, state: Number(newCityState) })} disabled={!newCityName || !newCityState || createCityMutation.isPending} className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors hover:bg-blue-700 whitespace-nowrap shadow-sm">Save</button>
                                <button type="button" onClick={() => setIsAddingCity(false)} className="bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-200 whitespace-nowrap">Cancel</button>
                            </div>
                        ) : (
                            <select
                                id={`${idPrefix}-city`}
                                name="city"
                                required
                                className={cn(
                                    "w-full border p-2.5 rounded-lg bg-white focus:ring-2 transition-all outline-none font-medium",
                                    errors.city ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                )}
                                value={selectedCity}
                                onChange={(e) => {
                                    if (e.target.value === "new") {
                                        setIsAddingCity(true);
                                    } else {
                                        setSelectedCity(e.target.value);
                                        if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                                    }
                                }}
                            >
                                <option value="" disabled>Select City</option>
                                {cities?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                                <option value="new" className="font-semibold text-blue-600 bg-blue-50">+ Add New City</option>
                            </select>
                        )}
                        {errors.city && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.city}</p>}
                    </div>

                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-area`} className="block text-sm font-semibold text-gray-700">Area</label>
                        {isAddingArea ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="New Area Name"
                                    value={newAreaName}
                                    onChange={(e) => setNewAreaName(e.target.value)}
                                    className="flex-1 border border-gray-300 p-2.5 rounded-lg text-sm outline-none font-medium text-gray-900"
                                />
                                <button type="button" onClick={() => createAreaMutation.mutate({ name: newAreaName, city: Number(selectedCity) })} disabled={!newAreaName || createAreaMutation.isPending} className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors hover:bg-blue-700 whitespace-nowrap shadow-sm">Save</button>
                                <button type="button" onClick={() => setIsAddingArea(false)} className="bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-200 whitespace-nowrap">Cancel</button>
                            </div>
                        ) : (
                            <select
                                id={`${idPrefix}-area`}
                                name="area"
                                value={selectedArea}
                                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium"
                                onChange={(e) => {
                                    if (e.target.value === "new") {
                                        if (!selectedCity) {
                                            toast.error("Please select a city first.");
                                        } else {
                                            setIsAddingArea(true);
                                        }
                                    } else {
                                        setSelectedArea(e.target.value);
                                    }
                                }}
                            >
                                <option value="">Select Area (Optional)</option>
                                {filteredAreas.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                                {selectedCity && <option value="new" className="font-semibold text-blue-600 bg-blue-50">+ Add New Area</option>}
                            </select>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-price`} className="block text-sm font-semibold text-gray-700">Price (Per Month)</label>
                        <input
                            id={`${idPrefix}-price`}
                            type="number"
                            step="0.01"
                            name="price"
                            required
                            defaultValue={initialData?.price}
                            onChange={() => {
                                if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                            }}
                            className={cn(
                                "w-full border p-2.5 rounded-lg focus:ring-2 transition-all outline-none bg-white font-medium",
                                errors.price ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            )}
                        />
                        {errors.price && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.price}</p>}
                    </div>

                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-price_day`} className="block text-sm font-semibold text-gray-700">Price (Per Day)</label>
                        <input
                            id={`${idPrefix}-price_day`}
                            type="number"
                            step="0.01"
                            name="price_per_day"
                            defaultValue={initialData?.price_per_day ?? ""}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                        />
                    </div>

                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-discount`} className="block text-sm font-semibold text-gray-700">Discount %</label>
                        <input
                            id={`${idPrefix}-discount`}
                            type="number"
                            step="0.01"
                            name="discount_percentage"
                            defaultValue={initialData?.discount_percentage ?? 0}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                        />
                    </div>

                    <div className="flex gap-8 mt-2 ml-1">
                        <div className="flex items-center gap-2.5 group cursor-pointer">
                            <input
                                id={`${idPrefix}-is_discounted`}
                                type="checkbox"
                                name="is_discounted"
                                defaultChecked={initialData?.is_discounted ?? false}
                                value="true"
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor={`${idPrefix}-is_discounted`} className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 cursor-pointer transition-colors">Apply Discount?</label>
                        </div>
                        <div className="flex items-center gap-2.5 group cursor-pointer">
                            <input
                                id={`${idPrefix}-is_active`}
                                type="checkbox"
                                name="is_active"
                                defaultChecked={initialData?.is_active ?? true}
                                value="true"
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor={`${idPrefix}-is_active`} className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 cursor-pointer transition-colors">Is Active / Visible</label>
                        </div>
                    </div>

                    {/* Registration Slug */}
                    {!initialData && (
                        <div className="space-y-3.5 transition-all col-span-1 md:col-span-2">
                            <label htmlFor={`${idPrefix}-slug`} className="block text-sm font-semibold text-gray-700">Registration Slug (Unique URL)</label>
                            <input
                                id={`${idPrefix}-slug`}
                                type="text"
                                name="slug"
                                required
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                            />
                        </div>
                    )}

                    {/* Descriptions */}
                    <div className="col-span-1 md:col-span-2 space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-short_desc`} className="block text-sm font-semibold text-gray-700">Short Description</label>
                        <textarea
                            id={`${idPrefix}-short_desc`}
                            name="short_description"
                            required
                            defaultValue={initialData?.short_description}
                            onChange={() => {
                                if (errors.short_description) setErrors(prev => ({ ...prev, short_description: "" }));
                            }}
                            className={cn(
                                "w-full border p-2.5 rounded-lg focus:ring-2 transition-all outline-none bg-white font-medium",
                                errors.short_description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            )}
                            rows={2}
                        />
                        {errors.short_description && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.short_description}</p>}
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-desc`} className="block text-sm font-semibold text-gray-700">Full Description</label>
                        <textarea
                            id={`${idPrefix}-desc`}
                            name="description"
                            required
                            defaultValue={initialData?.description}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                            rows={4}
                        />
                    </div>

                    {/* Location Section Container */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Location Details (Left Side) */}
                        <div className="md:col-span-8 flex flex-col gap-6">
                            <HostelLocationSection
                                lat={lat}
                                lng={lng}
                                address={address}
                                setLat={setLat}
                                setLng={setLng}
                                setAddress={setAddress}
                                idPrefix={idPrefix}
                            />

                            <div className="space-y-3.5 transition-all max-w-sm">
                                <label htmlFor={`${idPrefix}-postal`} className="block text-sm font-semibold text-gray-700">Postal Code</label>
                                <input
                                    id={`${idPrefix}-postal`}
                                    type="text"
                                    name="postal_code"
                                    required
                                    defaultValue={initialData?.postal_code ?? ""}
                                    onChange={() => {
                                        if (errors.postal_code) setErrors(prev => ({ ...prev, postal_code: "" }));
                                    }}
                                    className={cn(
                                        "w-full border p-2.5 rounded-lg focus:ring-2 transition-all outline-none bg-white font-medium",
                                        errors.postal_code ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    )}
                                />
                                {errors.postal_code && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.postal_code}</p>}
                            </div>
                        </div>

                        {/* Check-in/out (Right Side) */}
                        <div className="md:col-span-4 grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="space-y-3.5 transition-all">
                                <label htmlFor={`${idPrefix}-checkin`} className="block text-sm font-semibold text-gray-700">Check-in</label>
                                <input
                                    id={`${idPrefix}-checkin`}
                                    type="time"
                                    name="check_in_time"
                                    required
                                    defaultValue={initialData?.check_in_time}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                                />
                            </div>
                            <div className="space-y-3.5 transition-all">
                                <label htmlFor={`${idPrefix}-checkout`} className="block text-sm font-semibold text-gray-700">Check-out</label>
                                <input
                                    id={`${idPrefix}-checkout`}
                                    type="time"
                                    name="check_out_time"
                                    required
                                    defaultValue={initialData?.check_out_time}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="col-span-1 md:col-span-2 space-y-2 mt-4">
                        <div className="flex justify-between items-center">
                            <p className="block text-sm font-semibold text-gray-700">Amenities</p>
                            <button
                                type="button"
                                onClick={() => setIsAddingAmenity(!isAddingAmenity)}
                                className="text-sm text-blue-600 font-semibold hover:underline"
                            >
                                + Add amenities
                            </button>
                        </div>
                        {isAddingAmenity && (
                            <div className="flex flex-col sm:flex-row gap-2 mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <input
                                    type="text"
                                    placeholder="Enter new amenity name..."
                                    value={newAmenityName}
                                    onChange={(e) => setNewAmenityName(e.target.value)}
                                    className="flex-1 border border-gray-300 p-2.5 rounded-lg text-sm outline-none font-medium text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => createAmenityMutation.mutate(newAmenityName)}
                                    disabled={!newAmenityName || createAmenityMutation.isPending}
                                    className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors hover:bg-blue-700 shadow-sm whitespace-nowrap"
                                >
                                    {createAmenityMutation.isPending ? "Adding..." : "Add"}
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-56 overflow-y-auto">
                            {amenities
                                ?.slice()
                                .sort((a, b) => {
                                    const aSelected = initialData?.amenities?.some(item => item.id === a.id);
                                    const bSelected = initialData?.amenities?.some(item => item.id === b.id);
                                    if (aSelected && !bSelected) return -1;
                                    if (!aSelected && bSelected) return 1;
                                    return 0;
                                })
                                .map((am) => (
                                    <AmenityItem
                                        key={am.id}
                                        am={am}
                                        isInitiallySelected={!!initialData?.amenities?.some(a => a.id === am.id)}
                                    />
                                ))}
                            {!amenities?.length && <p className="text-gray-400 text-sm col-span-full py-4 text-center italic">No amenities available.</p>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isPending ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Hostel Info" : "Save New Hostel")}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-none px-6 py-3 bg-white text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HostelForm;
