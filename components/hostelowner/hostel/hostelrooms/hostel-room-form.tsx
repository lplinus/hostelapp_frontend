"use client";

import React from "react";
import { Plus, Pencil, Building2, Hotel, BedDouble, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoomType } from "@/services/hostelservices/room.service";
import type { HostelListItem } from "@/types/hostel.types";

interface HostelRoomFormProps {
    isEditing: boolean;
    formData: Partial<RoomType>;
    hostels?: HostelListItem[];
    isPending: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<Partial<RoomType>>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
}

export default function HostelRoomForm({
    isEditing,
    formData,
    hostels,
    isPending,
    handleChange,
    setFormData,
    handleSubmit,
    handleCancel,
}: HostelRoomFormProps) {
    return (
        <div className="w-full bg-card rounded-2xl border border-border/70 shadow-lg p-5 sm:p-7 mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border/50 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                        {isEditing ? <Pencil size={18} /> : <Plus size={18} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                <BedDouble size={11} /> Room Configuration
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {isEditing ? "Modify Room Configuration" : "Define New Room Variant"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isEditing ? "Update rates, sharing type, and amenities for this room" : "Set up pricing, sharing type, and occupancy for student bookings"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Assign to Hostel */}
                    <div className="space-y-1.5">
                        <label htmlFor="hostel-select" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Building2 size={13} className="text-primary" />
                            Assign to Hostel <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="hostel-select"
                            name="hostel"
                            onChange={handleChange}
                            required
                            value={formData.hostel || ""}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium shadow-xs"
                        >
                            <option value="" disabled>Select a hostel...</option>
                            {hostels?.map((h) => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Room Environment */}
                    <div className="space-y-1.5">
                        <label htmlFor="category-select" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Hotel size={13} className="text-primary" />
                            Room Environment <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="category-select"
                            name="room_category"
                            value={formData.room_category}
                            onChange={handleChange}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium shadow-xs"
                            required
                        >
                            <option value="NON_AC">Non-AC</option>
                            <option value="AC">AC</option>
                        </select>
                    </div>

                    {/* Sharing Configuration */}
                    <div className="space-y-1.5">
                        <label htmlFor="sharing-select" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <BedDouble size={13} className="text-primary" />
                            Sharing Configuration <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="sharing-select"
                            name="sharing_type"
                            value={formData.sharing_type}
                            onChange={handleChange}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium shadow-xs"
                            required
                        >
                            <option value="0">Private Room</option>
                            <option value="1">Single Occupancy (1 Sharing)</option>
                            <option value="2">Double Occupancy (2 Sharing)</option>
                            <option value="3">Triple Occupancy (3 Sharing)</option>
                            <option value="4">Four-Person Shared (4 Sharing)</option>
                        </select>
                    </div>

                    {/* Monthly Price */}
                    <div className="space-y-1.5">
                        <label htmlFor="price-input" className="text-xs font-semibold text-foreground">
                            Monthly Tariff (₹) <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                            <input
                                id="price-input"
                                type="number"
                                name="price"
                                value={formData.price || ""}
                                onChange={handleChange}
                                placeholder="e.g. 7500"
                                className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium shadow-xs"
                                required
                            />
                        </div>
                    </div>

                    {/* Daily Tariff */}
                    <div className="space-y-1.5">
                        <label htmlFor="price-day-input" className="text-xs font-semibold text-foreground">
                            Daily Tariff (₹) <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                            <input
                                id="price-day-input"
                                type="number"
                                name="price_per_day"
                                value={formData.price_per_day || ""}
                                onChange={handleChange}
                                placeholder="e.g. 500"
                                className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Total Beds */}
                    <div className="space-y-1.5">
                        <label htmlFor="beds-input" className="text-xs font-semibold text-foreground">
                            Inventory Capacity (Beds) <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <input
                            id="beds-input"
                            type="number"
                            name="total_beds"
                            value={formData.total_beds || ""}
                            onChange={handleChange}
                            placeholder="e.g. 6"
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium shadow-xs"
                        />
                    </div>
                </div>

                {/* Show on card toggle */}
                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="show_this_price"
                        name="show_this_price"
                        checked={formData.show_this_price || false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="show_this_price" className="text-xs font-semibold text-foreground cursor-pointer">
                        Display this room variant&apos;s starting price on the main hostel card
                    </label>
                </div>

                {/* Room Features */}
                <div className="space-y-1.5 pt-3 border-t border-border/40">
                    <label htmlFor="features-input" className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <span>Room Features & Highlights</span>
                        <span className="text-muted-foreground font-normal text-[11px]">(comma separated)</span>
                    </label>
                    <textarea
                        id="features-input"
                        name="features"
                        value={formData.features || ""}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        placeholder="e.g. Air conditioning, Attached bathroom, Personal wooden wardrobe, High-speed Wi-Fi"
                        rows={2}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none shadow-xs"
                    />
                    {formData.features && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {formData.features.split(",").filter((f) => f.trim()).map((feature, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
                                    {feature.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-xs font-semibold border border-input rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={13} />
                        {isPending ? "Saving..." : isEditing ? "Update Room Configuration" : "Commission Room Variant"}
                    </button>
                </div>
            </form>
        </div>
    );
}

