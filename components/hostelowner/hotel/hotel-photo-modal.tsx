"use client";

import type { Hotel } from "@/types/hotel.types";
import type { PhotoPreviews } from "./hotel-management-types";
import type { UseMutationResult } from "@tanstack/react-query";
import { toLocalMediaPath } from "@/lib/utils";
import {
    Trash2,
    Image as ImageIcon,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface HotelPhotoModalProps {
    photoModalHotel: Hotel | null;
    setPhotoModalHotel: React.Dispatch<React.SetStateAction<Hotel | null>>;
    photoFormRef: React.RefObject<HTMLFormElement | null>;
    photoPreviews: PhotoPreviews;
    handleGalleryImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGalleryUploadSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    photoUploadMutation: UseMutationResult<unknown, unknown, FormData>;
    photoDeleteMutation: UseMutationResult<unknown, unknown, number>;
}

export default function HotelPhotoModal({
    photoModalHotel, setPhotoModalHotel, photoFormRef, photoPreviews,
    handleGalleryImageChange, handleGalleryUploadSubmit,
    photoUploadMutation, photoDeleteMutation,
}: HotelPhotoModalProps) {
    return (
        <Dialog open={!!photoModalHotel} onOpenChange={(open) => !open && setPhotoModalHotel(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {photoModalHotel && (
                    <div>
                        <DialogHeader className="border-b pb-3 mb-4">
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <ImageIcon size={18} className="text-[#312E81]" />
                                Manage Photos: {photoModalHotel.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Upload and organize high-resolution photos for this hotel listing.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            {/* Existing Photos Grid */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Current Photos ({photoModalHotel.images?.length || 0})
                                </h4>

                                {photoModalHotel.images && photoModalHotel.images.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {photoModalHotel.images.map((img) => (
                                            <div key={img.id} className="relative rounded-lg overflow-hidden border border-border group bg-muted aspect-4/3">
                                                <img
                                                    src={toLocalMediaPath(img.image) || img.image}
                                                    alt={img.caption || photoModalHotel.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        if (target.src.includes("ik.imagekit.io") && !target.src.includes("tr=")) {
                                                            target.src = `${target.src}${target.src.includes("?") ? "&" : "?"}tr=w-800,f-auto`;
                                                        }
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="destructive" className="w-7 h-7 rounded-full" disabled={photoDeleteMutation.isPending} onClick={() => photoDeleteMutation.mutate(img.id)}>
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                                {img.is_primary && (
                                                    <Badge className="absolute top-1.5 left-1.5 text-[9px] bg-[#312E81] text-white shadow-xs font-semibold">Primary</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200">
                                        ℹ️ No uploaded photos found for this hotel. Please upload gallery images below.
                                    </div>
                                )}
                            </div>

                            {/* Upload New Images Form */}
                            <div className="space-y-3 pt-3 border-t">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Upload size={13} /> Upload New Photos
                                </h4>

                                <form ref={photoFormRef} onSubmit={handleGalleryUploadSubmit} className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {["image", "image2", "image3", "image4", "image5"].map((fieldName, i) => (
                                            <div key={fieldName} className="space-y-1">
                                                <label className="text-[11px] font-medium text-foreground block">
                                                    Photo {i + 1} {i === 0 ? "(Facade / Cover)" : ""}
                                                </label>
                                                <div className="flex items-center gap-2.5 p-2 rounded-lg border border-dashed hover:border-blue-500 bg-muted/20 transition-colors">
                                                    <input type="file" name={fieldName} accept="image/*" onChange={handleGalleryImageChange} className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-[#312E81]/10 file:text-[#312E81] hover:file:bg-[#312E81]/20 cursor-pointer flex-1" />
                                                    <div className="w-10 h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-background/80 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                                                        {photoPreviews[fieldName] ? (
                                                            <img src={photoPreviews[fieldName]!} alt="preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-muted-foreground/35">
                                                                <ImageIcon size={15} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => setPhotoModalHotel(null)} className="text-xs">Done</Button>
                                        <Button type="submit" size="sm" disabled={photoUploadMutation.isPending} className="text-xs bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B] text-white gap-1.5 font-medium shadow-xs transition-all">
                                            <Upload size={13} />
                                            {photoUploadMutation.isPending ? "Uploading..." : "Upload Photos"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

