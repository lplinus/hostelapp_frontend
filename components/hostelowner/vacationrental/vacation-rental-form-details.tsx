"use client";

import Image from "next/image";
import type { VacationRental } from "@/types/vacationrental.types";
import type { VacationRentalFormData } from "./vacation-rental-hooks";
import type { AmenityItem } from "@/services/hostelservices/amenity.service";
import type { UseMutationResult } from "@tanstack/react-query";
import { toLocalMediaPath } from "@/lib/utils";
import { Sparkles, Layers, Image as ImageIcon, Upload, X, Trash2, Check, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VacationRentalFormDetailsProps {
    formData: VacationRentalFormData;
    setFormData: React.Dispatch<React.SetStateAction<VacationRentalFormData>>;
    amenitiesList: AmenityItem[];
    editingRental: VacationRental | null;
    formImagePreviews: string[];
    handleFormImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFormImage: (index: number) => void;
    handleDeletePhoto: (photoId: number) => Promise<void>;
    setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingRental: React.Dispatch<React.SetStateAction<VacationRental | null>>;
    resetForm: () => void;
    rentalMutation: UseMutationResult<VacationRental, unknown, unknown>;
    formImageFiles: File[];
}

export default function VacationRentalFormDetails({
    formData, setFormData, amenitiesList, editingRental,
    formImagePreviews, handleFormImageSelect, removeFormImage,
    handleDeletePhoto, setIsCreating, setEditingRental, resetForm,
    rentalMutation, formImageFiles,
}: VacationRentalFormDetailsProps) {
    return (
        <>
            {/* Section 7: Amenities */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Sparkles size={16} className="text-[#312E81]" />
                            <span>7. Verified Property Amenities</span>
                        </h3>
                        <span className="text-xs text-muted-foreground">{formData.amenities.length} Selected</span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-slate-50/50 max-h-48 overflow-y-auto">
                        {amenitiesList.map((amenity) => {
                            const isSelected = formData.amenities.includes(amenity.id);
                            return (
                                <button type="button" key={amenity.id} onClick={() => { setFormData({ ...formData, amenities: isSelected ? formData.amenities.filter((id) => id !== amenity.id) : [...formData.amenities, amenity.id] }); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${isSelected ? "bg-[#312E81] text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80"}`}>
                                    {isSelected && <Check size={13} />}
                                    <span>{amenity.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Section 8: Descriptions */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Layers size={16} className="text-[#312E81]" />
                            <span>8. Description &amp; Narrative</span>
                        </h3>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Short Summary</Label>
                        <Input placeholder="Brief overview in 1-2 lines..." value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Full Detailed Description</Label>
                        <textarea rows={4} placeholder="Describe the villa, rooms, architecture, surroundings, host story, and unique experience..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#312E81] font-sans" />
                    </div>
                </CardContent>
            </Card>

            {/* Section 9: Property Photos */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-5">
                    <div className="border-b pb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <ImageIcon size={16} className="text-[#312E81]" />
                            <span>9. Property Photos</span>
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            {editingRental ? `${editingRental.images?.length || 0} Present • ${formImageFiles.length} New` : `${formImageFiles.length} photos selected`}
                        </span>
                    </div>

                    {/* Present / Existing Photos (Edit mode) */}
                    {editingRental && (
                        <div className="space-y-3 pb-4 border-b border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <span>Present Property Photos</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold border-indigo-200 text-[#312E81]">{editingRental.images?.length || 0} active</Badge>
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">Photos currently published and displayed to guests for this vacation rental.</p>
                                </div>
                            </div>
                            {editingRental.images && editingRental.images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {editingRental.images.map((img, index) => {
                                        const imgUrl = toLocalMediaPath(img.image);
                                        return (
                                            <div key={img.id || index} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 shadow-2xs group bg-slate-100">
                                                {imgUrl ? (<Image src={imgUrl} alt={img.caption || `Property photo ${index + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />) : null}
                                                {img.is_primary && (<span className="absolute bottom-1.5 left-1.5 bg-[#312E81] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">Cover</span>)}
                                                <button type="button" onClick={async () => { if (confirm("Remove this photo from the property?")) { await handleDeletePhoto(img.id); } }} title="Delete photo" className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-rose-600 text-white rounded-md p-1 transition-colors shadow-xs cursor-pointer opacity-90 group-hover:opacity-100">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center">
                                    <p className="text-xs text-muted-foreground">No photos currently uploaded yet. Select files below to add property photos.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload New / Additional Photos */}
                    <div className="space-y-3">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800">{editingRental ? "Upload Additional Photos" : "Add Property Photos"}</h4>
                            <p className="text-[11px] text-muted-foreground">Upload exterior, living room, bedrooms, bathrooms, and terrace views. Supports JPG, PNG, WEBP.</p>
                        </div>
                        <label className="border-2 border-dashed border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#312E81] hover:bg-indigo-50/20 transition-all">
                            <Upload size={22} className="text-[#312E81] mb-1.5" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">Click to select {editingRental ? "more photos" : "property photos"}</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">High-resolution landscape photos look best</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFormImageSelect} />
                        </label>
                        {formImagePreviews.length > 0 && (
                            <div className="space-y-2 pt-1">
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">New Photos to Upload ({formImagePreviews.length})</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {formImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative h-24 rounded-lg overflow-hidden border shadow-xs group bg-slate-100">
                                            <Image src={preview} alt={`Upload preview ${index + 1}`} fill className="object-cover" />
                                            <button type="button" onClick={() => removeFormImage(index)} className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-md p-1 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Action Row */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 p-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg sm:rounded-xl shadow-lg">
                <Button type="button" variant="outline" onClick={() => { setIsCreating(false); setEditingRental(null); resetForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={rentalMutation.isPending} className="text-xs font-semibold rounded-lg">Cancel</Button>
                <Button type="submit" disabled={rentalMutation.isPending} className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-lg px-6 h-10 shadow-sm cursor-pointer">
                    <Save size={15} />
                    <span>{rentalMutation.isPending ? "Saving Property..." : editingRental ? "Save Changes" : "Publish Vacation Rental"}</span>
                </Button>
            </div>
        </>
    );
}

