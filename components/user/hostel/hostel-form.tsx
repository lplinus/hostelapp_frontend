"use client";

import React, { useState, useEffect } from "react";
import type { HostelListItem } from "@/types/hostel.types";
import HostelLocationSection from "../location/hostel-location-section";

interface HostelFormProps {
    initialData?: HostelListItem | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    isPending: boolean;
    cities: any[] | undefined;
    areas: any[] | undefined;
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
    amenities,
}) => {
    const [selectedCity, setSelectedCity] = useState<string>(
        initialData?.city?.id?.toString() || ""
    );

    // Location States
    const [lat, setLat] = useState(initialData?.latitude?.toString() || "");
    const [lng, setLng] = useState(initialData?.longitude?.toString() || "");
    const [address, setAddress] = useState(initialData?.address || "");

    useEffect(() => {
        if (initialData) {
            setSelectedCity(initialData.city?.id?.toString() || "");
            setLat(initialData.latitude?.toString() || "");
            setLng(initialData.longitude?.toString() || "");
            setAddress(initialData.address || "");
        } else {
            setSelectedCity("");
            setLat("");
            setLng("");
            setAddress("");
        }
    }, [initialData]);

    const filteredAreas = areas?.filter((a) => a.city === Number(selectedCity)) ?? [];

    const idPrefix = initialData ? "edit" : "create";

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

            <form onSubmit={onSubmit} className="space-y-8">
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
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                        />
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
                        <select
                            id={`${idPrefix}-city`}
                            name="city"
                            required
                            className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="" disabled>Select City</option>
                            {cities?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3.5 transition-all">
                        <label htmlFor={`${idPrefix}-area`} className="block text-sm font-semibold text-gray-700">Area</label>
                        <select
                            id={`${idPrefix}-area`}
                            name="area"
                            defaultValue={initialData?.area?.id ?? ""}
                            className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium"
                        >
                            <option value="">Select Area (Optional)</option>
                            {filteredAreas.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
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
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                        />
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
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                            rows={2}
                        />
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
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white font-medium"
                                />
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
                        <p className="block text-sm font-semibold text-gray-700">Amenities</p>
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
