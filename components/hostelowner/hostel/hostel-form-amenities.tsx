"use client";

import React, { useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import { AmenityItem } from "./hostel-form-components";
import type { UseMutationResult } from "@tanstack/react-query";

interface HostelFormAmenitiesProps {
    amenities: any[] | undefined;
    initialAmenities?: any[];
    createAmenityMutation: UseMutationResult<any, any, string>;
}

export default function HostelFormAmenities({
    amenities,
    initialAmenities,
    createAmenityMutation,
}: HostelFormAmenitiesProps) {
    const [isAddingAmenity, setIsAddingAmenity] = useState(false);
    const [newAmenityName, setNewAmenityName] = useState("");

    return (
        <div className="space-y-2.5 pt-3 border-t border-border/40">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                        onClick={() => {
                            createAmenityMutation.mutate(newAmenityName, {
                                onSuccess: () => {
                                    setIsAddingAmenity(false);
                                    setNewAmenityName("");
                                },
                            });
                        }}
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
                        const aSelected = initialAmenities?.some((item) => item.id === a.id);
                        const bSelected = initialAmenities?.some((item) => item.id === b.id);
                        if (aSelected && !bSelected) return -1;
                        if (!aSelected && bSelected) return 1;
                        return 0;
                    })
                    .map((am) => (
                        <AmenityItem
                            key={am.id}
                            am={am}
                            isInitiallySelected={
                                !!initialAmenities?.some((a) => a.id === am.id)
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
    );
}

