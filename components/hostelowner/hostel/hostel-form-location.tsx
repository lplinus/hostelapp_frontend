"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import HostelLocationSection from "../location/hostel-location-section";
import type { UseMutationResult } from "@tanstack/react-query";

interface HostelFormLocationProps {
    idPrefix: string;
    cities: any[] | undefined;
    areas: any[] | undefined;
    states: any[] | undefined;
    selectedCity: string;
    setSelectedCity: (cityId: string) => void;
    selectedArea: string;
    setSelectedArea: (areaId: string) => void;
    lat: string;
    setLat: (lat: string) => void;
    lng: string;
    setLng: (lng: string) => void;
    address: string;
    setAddress: (address: string) => void;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    initialPostalCode?: string;
    createCityMutation: UseMutationResult<any, any, any>;
    createAreaMutation: UseMutationResult<any, any, any>;
}

export default function HostelFormLocation({
    idPrefix,
    cities,
    areas,
    states,
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    lat,
    setLat,
    lng,
    setLng,
    address,
    setAddress,
    errors,
    setErrors,
    initialPostalCode,
    createCityMutation,
    createAreaMutation,
}: HostelFormLocationProps) {
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState("");
    const [newCityState, setNewCityState] = useState("");

    const [isAddingArea, setIsAddingArea] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");

    const filteredAreas = areas?.filter((a) => a.city === Number(selectedCity)) ?? [];

    return (
        <div className="space-y-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                        defaultValue={initialPostalCode ?? ""}
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
    );
}

