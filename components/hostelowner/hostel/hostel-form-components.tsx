"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SUITABLE_OPTIONS } from "./hostel-types";

export const SuitableForDropdown = ({
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

export const AmenityItem = ({
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

