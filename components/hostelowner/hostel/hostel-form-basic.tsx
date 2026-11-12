"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitableForDropdown } from "./hostel-form-components";
import type { HostelListItem } from "@/types/hostel.types";

interface HostelFormBasicProps {
    idPrefix: string;
    initialData?: HostelListItem | null;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function HostelFormBasic({
    idPrefix,
    initialData,
    errors,
    setErrors,
}: HostelFormBasicProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Building2 size={13} className="text-primary" />
                <span>Basic Property Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                    <label htmlFor={`${idPrefix}-name`} className="block text-xs font-semibold text-foreground">
                        Hostel Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        id={`${idPrefix}-name`}
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Sri Balaji Luxury PG"
                        defaultValue={initialData?.name}
                        onChange={() => { if (errors.name) setErrors((prev) => ({ ...prev, name: "" })); }}
                        className={cn(
                            "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none transition-colors",
                            errors.name ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
                        )}
                    />
                    {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor={`${idPrefix}-hostel_type`} className="block text-xs font-semibold text-foreground">
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

                <SuitableForDropdown idPrefix={idPrefix} initialSelected={initialData?.suitable_for || []} />
            </div>

            {!initialData && (
                <div className="space-y-1.5 pt-1">
                    <label htmlFor={`${idPrefix}-slug`} className="block text-xs font-semibold text-foreground">
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
    );
}

