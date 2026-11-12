"use client";

import React from "react";
import { CreditCard, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HostelListItem } from "@/types/hostel.types";

interface HostelFormPricingScheduleProps {
    idPrefix: string;
    initialData?: HostelListItem | null;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function HostelFormPricingSchedule({
    idPrefix,
    initialData,
    errors,
    setErrors,
}: HostelFormPricingScheduleProps) {
    return (
        <>
            {/* 3. Tariff & Pricing */}
            <div className="space-y-3 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <CreditCard size={13} className="text-primary" />
                    <span>Pricing & Tariff Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                        <label htmlFor={`${idPrefix}-price`} className="block text-xs font-semibold text-foreground">
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
                            onChange={() => { if (errors.price) setErrors((prev) => ({ ...prev, price: "" })); }}
                            className={cn(
                                "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium",
                                errors.price ? "border-destructive" : "border-input"
                            )}
                        />
                        {errors.price && <p className="text-[10px] text-destructive font-medium">{errors.price}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor={`${idPrefix}-price_day`} className="block text-xs font-semibold text-foreground">
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

                    <div className="space-y-1.5">
                        <label htmlFor={`${idPrefix}-discount`} className="block text-xs font-semibold text-foreground">
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

            {/* 4. Operating Hours & Check-in */}
            <div className="space-y-3 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock size={13} className="text-primary" />
                    <span>Timings & Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                        <label htmlFor={`${idPrefix}-checkin`} className="block text-xs font-semibold text-foreground">
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
                        <label htmlFor={`${idPrefix}-checkout`} className="block text-xs font-semibold text-foreground">
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

            {/* 5. Descriptions */}
            <div className="space-y-3 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <FileText size={13} className="text-primary" />
                    <span>Descriptions & Highlights</span>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor={`${idPrefix}-short_desc`} className="block text-xs font-semibold text-foreground">
                            Short Summary (At least 10 characters) <span className="text-destructive">*</span>
                        </label>
                        <input
                            id={`${idPrefix}-short_desc`}
                            type="text"
                            name="short_description"
                            required
                            placeholder="e.g. Premium AC PG with homestyle meals near Cyber Towers"
                            defaultValue={initialData?.short_description}
                            onChange={() => { if (errors.short_description) setErrors((prev) => ({ ...prev, short_description: "" })); }}
                            className={cn(
                                "w-full h-9 px-3 rounded-md border text-xs bg-background shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium",
                                errors.short_description ? "border-destructive" : "border-input"
                            )}
                        />
                        {errors.short_description && <p className="text-[10px] text-destructive font-medium">{errors.short_description}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor={`${idPrefix}-desc`} className="block text-xs font-semibold text-foreground">
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
        </>
    );
}

