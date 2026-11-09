"use client";

import Image from "next/image";
import type { VacationRental } from "@/types/vacationrental.types";
import { toLocalMediaPath } from "@/lib/utils";
import { Trash2, Image as ImageIcon, Upload } from "lucide-react";
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

interface VacationRentalPhotoModalProps {
    photoModalRental: VacationRental | null;
    setPhotoModalRental: React.Dispatch<React.SetStateAction<VacationRental | null>>;
    isUploadingPhotos: boolean;
    photoInputRef: React.RefObject<HTMLInputElement | null>;
    handleUploadPhotosToExisting: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleDeletePhoto: (photoId: number) => Promise<void>;
}

export default function VacationRentalPhotoModal({
    photoModalRental, setPhotoModalRental,
    isUploadingPhotos, photoInputRef,
    handleUploadPhotosToExisting, handleDeletePhoto,
}: VacationRentalPhotoModalProps) {
    return (
        <Dialog open={!!photoModalRental} onOpenChange={(open) => !open && setPhotoModalRental(null)}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-5 sm:p-6 rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto no-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <ImageIcon className="text-[#312E81]" size={20} />
                        <span>Photo Gallery — {photoModalRental?.title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Upload and manage high-resolution photos for this vacation stay.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Upload trigger */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-xs font-semibold text-slate-800">Add Photos to Gallery</p>
                            <p className="text-[11px] text-muted-foreground">Showcase bedrooms, pool, patio, living hall, kitchen, and scenic views.</p>
                        </div>
                        <label className="cursor-pointer">
                            <Button type="button" size="sm" disabled={isUploadingPhotos} asChild className="bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-semibold gap-1.5">
                                <span>
                                    <Upload size={14} />
                                    <span>{isUploadingPhotos ? "Uploading..." : "Upload Photos"}</span>
                                </span>
                            </Button>
                            <input ref={photoInputRef} type="file" multiple accept="image/*" className="hidden" disabled={isUploadingPhotos} onChange={handleUploadPhotosToExisting} />
                        </label>
                    </div>

                    {/* Gallery Grid */}
                    {photoModalRental?.images && photoModalRental.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photoModalRental.images.map((img) => {
                                const imgUrl = toLocalMediaPath(img.image);
                                return (
                                    <div key={img.id} className="relative h-32 rounded-xl overflow-hidden border shadow-xs group bg-slate-100">
                                        {imgUrl && (<Image src={imgUrl} alt={img.caption || "Vacation Rental Photo"} fill className="object-cover" />)}
                                        {img.is_primary && (<Badge className="absolute top-2 left-2 bg-[#312E81] text-white text-[9px] font-bold">Cover</Badge>)}
                                        <button type="button" onClick={() => handleDeletePhoto(img.id)} className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="Delete photo">
                                            <Trash2 size={12} />
                                        </button>
                                        {img.caption && (<div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 truncate">{img.caption}</div>)}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 border border-dashed rounded-xl space-y-2">
                            <ImageIcon size={32} className="mx-auto text-slate-300" />
                            <p className="text-xs text-slate-500 font-medium">No photos in gallery yet. Upload photos above.</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setPhotoModalRental(null)} className="text-xs font-semibold cursor-pointer">Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

