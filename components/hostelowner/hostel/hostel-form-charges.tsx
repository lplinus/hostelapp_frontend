"use client";

import React from "react";
import { Tag, Plus, X } from "lucide-react";
import type { ExtraChargeForm } from "./hostel-types";

interface HostelFormChargesProps {
    extraCharges: ExtraChargeForm[];
    handleAddExtraCharge: () => void;
    handleRemoveExtraCharge: (index: number) => void;
    handleUpdateExtraCharge: (
        index: number,
        field: keyof ExtraChargeForm,
        value: any
    ) => void;
}

export default function HostelFormCharges({
    extraCharges,
    handleAddExtraCharge,
    handleRemoveExtraCharge,
    handleUpdateExtraCharge,
}: HostelFormChargesProps) {
    return (
        <div className="space-y-2.5 pt-3 border-t border-border/40">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
    );
}

