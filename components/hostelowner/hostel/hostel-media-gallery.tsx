"use client";

import React from "react";
import { X, UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import { IMAGE_SLOTS } from "./hostel-types";
import { toLocalMediaPath } from "@/lib/utils";
import type { HostelListItem } from "@/types/hostel.types";
import type { StorageSettings } from "@/services/cms.service";
import type { UseMutationResult } from "@tanstack/react-query";

interface HostelMediaGalleryProps {
    uploadingFor: number;
    hostels?: HostelListItem[];
    storageSettings: StorageSettings;
    imagePreviews: Record<string, string | null>;
    uploadFormRef: React.RefObject<HTMLFormElement | null>;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUpload: (e: React.FormEvent<HTMLFormElement>) => void;
    imageUploadMutation: UseMutationResult<any, any, FormData>;
    imageUpdateMutation: UseMutationResult<any, any, { id: number; data: FormData }>;
    imageDeleteMutation: UseMutationResult<any, any, number>;
    onClose: () => void;
}

export default function HostelMediaGallery({
    uploadingFor,
    hostels,
    storageSettings,
    imagePreviews,
    uploadFormRef,
    handleImageChange,
    handleImageUpload,
    imageUploadMutation,
    imageUpdateMutation,
    imageDeleteMutation,
    onClose,
}: HostelMediaGalleryProps) {
    const hostel = hostels?.find((h) => h.id === uploadingFor);
    const imgs = hostel?.images ?? [];
    const existingSet = imgs.length > 0 ? imgs[0] : null;

    return (
        <div className="w-full rounded-2xl border border-border/70 bg-card shadow-lg p-5 sm:p-7 mb-6 animate-in fade-in slide-in-from-top-3 duration-300 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/60">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            <ImageIcon className="w-3.5 h-3.5" /> Media Gallery
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">Hostel #{uploadingFor}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                        Manage Photos: {hostel?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Upload up to 10 photos of rooms, amenities, and facade. High-quality photos increase student bookings.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Close gallery"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Existing Images — Current Sets */}
            {imgs.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Current Gallery Photo Sets ({imgs.length})
                        </h4>
                    </div>
                    {imgs.map((img) => {
                        const photos = [
                            { label: "Cover", url: img.image },
                            { label: "Slot 2", url: img.image2 },
                            { label: "Slot 3", url: img.image3 },
                            { label: "Slot 4", url: img.image4 },
                            { label: "Slot 5", url: img.image5 },
                            { label: "Slot 6", url: img.image6 },
                            { label: "Slot 7", url: img.image7 },
                            { label: "Slot 8", url: img.image8 },
                            { label: "Slot 9", url: img.image9 },
                            { label: "Slot 10", url: img.image10 },
                        ].filter((p) => Boolean(p.url));

                        return (
                            <div key={img.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-semibold text-foreground">Set #{img.id}</span>
                                        {img.is_primary && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                                Primary Gallery
                                            </span>
                                        )}
                                        {img.alt_text && (
                                            <span className="text-xs text-muted-foreground italic truncate max-w-xs">&ldquo;{img.alt_text}&rdquo;</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => imageDeleteMutation.mutate(img.id)}
                                        disabled={imageDeleteMutation.isPending}
                                        className="text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors text-xs flex items-center gap-1 font-semibold disabled:opacity-50"
                                        title="Delete set"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete Set</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                                    {photos.map((photo, i) => (
                                        <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted/40">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={toLocalMediaPath(photo.url) || ""} alt={photo.label} className="w-full h-full object-cover" />
                                            <span className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold bg-black/60 text-white px-1 rounded truncate text-center">
                                                {photo.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Form */}
            <form ref={uploadFormRef} onSubmit={handleImageUpload} className="space-y-4">
                <input type="hidden" name="hostel" value={uploadingFor} />
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upload / Update Photo Slots</h4>
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">
                            Max {storageSettings.max_image_size_mb}MB per file
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {IMAGE_SLOTS.map((slot) => {
                            const currentPreview = imagePreviews[slot.name as keyof typeof imagePreviews];
                            const existingImgUrl = existingSet ? (existingSet as any)[slot.name] : null;
                            const displayUrl = currentPreview || (existingImgUrl ? toLocalMediaPath(existingImgUrl) : null);
                            const isNew = Boolean(currentPreview);
                            const isSlotRequired = slot.slotNum === 1 && !existingSet?.image;

                            return (
                                <div
                                    key={slot.name}
                                    className="group relative flex flex-col justify-between p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-2xs transition-all"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                                                {slot.slotNum}
                                            </span>
                                            <span className="text-xs font-semibold text-foreground truncate">{slot.label}</span>
                                            {isSlotRequired && <span className="text-[10px] font-bold text-destructive shrink-0">*Req</span>}
                                        </div>
                                        {displayUrl && (
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isNew ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" : "bg-muted text-muted-foreground"}`}>
                                                {isNew ? "New file" : "Saved"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div className="relative w-12 h-12 rounded-lg bg-muted/50 border border-border/70 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                                            {displayUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={displayUrl} alt={`Preview slot ${slot.slotNum}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-muted-foreground/35" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <input
                                                id={slot.id}
                                                type="file"
                                                name={slot.name}
                                                accept="image/*"
                                                required={isSlotRequired}
                                                onChange={handleImageChange}
                                                className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer focus:outline-hidden"
                                            />
                                            <p className="text-[10px] text-muted-foreground/75 mt-0.5 truncate">
                                                {displayUrl ? (isNew ? "Ready to upload" : existingImgUrl?.split("/").pop()) : "Choose file..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1.5">
                            <label htmlFor="img-alt" className="text-xs font-semibold text-foreground flex items-center justify-between">
                                <span>Alt Text / Gallery Caption <span className="text-destructive">*</span></span>
                            </label>
                            <input
                                id="img-alt"
                                type="text"
                                name="alt_text"
                                required
                                defaultValue={existingSet?.alt_text || ""}
                                placeholder="e.g. Spacious triple sharing room with balcony"
                                className="w-full h-9 px-3 rounded-lg border border-border/80 text-xs bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_primary"
                                    defaultChecked={existingSet ? existingSet.is_primary : true}
                                    value="true"
                                    className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                                />
                                <span>Set as Primary Gallery for this hostel</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-border/80 text-foreground text-xs font-semibold hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={imageUploadMutation.isPending || imageUpdateMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            <UploadCloud className="w-4 h-4" />
                            {imageUploadMutation.isPending || imageUpdateMutation.isPending
                                ? "Saving Gallery..."
                                : existingSet
                                    ? "Update Gallery Photos"
                                    : "Save Gallery Photos"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

