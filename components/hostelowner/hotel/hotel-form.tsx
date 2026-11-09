"use client";

import type { Hotel } from "@/types/hotel.types";
import type { CityItem, AreaItem } from "@/services/location.service";
import type { AmenityItem } from "@/services/hostelservices/amenity.service";
import type { HotelFormData } from "./hotel-management-types";
import type { UseMutationResult } from "@tanstack/react-query";
import { toLocalMediaPath } from "@/lib/utils";
import {
    Hotel as HotelIcon,
    X,
    MapPin,
    Map as MapIcon,
    CheckCircle2,
    Image as ImageIcon,
    Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import UseCurrentLocation from "@/components/hostelowner/location/use-current-location";

interface HotelFormProps {
    formData: HotelFormData;
    setFormData: React.Dispatch<React.SetStateAction<HotelFormData>>;
    editingHotel: Hotel | null;
    setEditingHotel: React.Dispatch<React.SetStateAction<Hotel | null>>;
    setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
    handleFormSubmit: (e: React.FormEvent) => void;
    hotelMutation: UseMutationResult<Hotel, unknown, unknown>;
    cities: CityItem[];
    filteredAreas: AreaItem[];
    amenitiesList: AmenityItem[];
    formImagePreviews: string[];
    handleFormImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFormImage: (index: number) => void;
    photoDeleteMutation: UseMutationResult<unknown, unknown, number>;
    handleLocationChange: (lat: number, lng: number, address: string) => void;
    setIsMapOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HotelForm({
    formData, setFormData, editingHotel, setEditingHotel, setIsCreating,
    handleFormSubmit, hotelMutation, cities, filteredAreas, amenitiesList,
    formImagePreviews, handleFormImageChange, removeFormImage,
    photoDeleteMutation, handleLocationChange, setIsMapOpen,
}: HotelFormProps) {
    return (
        <Card className="border-blue-500/30 bg-card shadow-sm">
            <CardContent className="p-6">
                <div className="border-b pb-3 mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <HotelIcon size={18} className="text-blue-600" />
                            {editingHotel ? `Edit Hotel: ${editingHotel.name}` : "Add New Hotel Property"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Fill in the hotel specifications, location, photos, amenities, and policies.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingHotel(null); }}>
                        <X size={14} />
                    </Button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs font-semibold">Hotel Name <span className="text-destructive">*</span></Label>
                            <Input placeholder="e.g. Royal Orchid Grand Palace" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-9 text-xs" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Tagline</Label>
                            <Input placeholder="e.g. 5-Star Waterfront Luxury" value={formData.tagline || ""} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className="h-9 text-xs" />
                        </div>
                    </div>

                    {/* Hotel Type & Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Hotel Classification</Label>
                            <Select value={formData.hotel_type} onValueChange={(val) => setFormData({ ...formData, hotel_type: val })}>
                                <SelectTrigger className="w-full h-9 text-xs bg-background"><SelectValue placeholder="Select Classification" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="luxury">Luxury Hotel</SelectItem>
                                    <SelectItem value="boutique">Boutique Hotel</SelectItem>
                                    <SelectItem value="business">Business Hotel</SelectItem>
                                    <SelectItem value="resort">Resort & Spa</SelectItem>
                                    <SelectItem value="heritage">Heritage Hotel</SelectItem>
                                    <SelectItem value="budget">Budget Hotel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Star Rating</Label>
                            <Select value={String(formData.star_rating)} onValueChange={(val) => setFormData({ ...formData, star_rating: parseInt(val) })}>
                                <SelectTrigger className="w-full h-9 text-xs bg-background"><SelectValue placeholder="Select Star Rating" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Star ★★★★★</SelectItem>
                                    <SelectItem value="4">4 Star ★★★★</SelectItem>
                                    <SelectItem value="3">3 Star ★★★</SelectItem>
                                    <SelectItem value="2">2 Star ★★</SelectItem>
                                    <SelectItem value="1">1 Star ★</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Cancellation Policy</Label>
                            <Select value={formData.cancellation_policy} onValueChange={(val) => setFormData({ ...formData, cancellation_policy: val })}>
                                <SelectTrigger className="w-full h-9 text-xs bg-background"><SelectValue placeholder="Select Cancellation Policy" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free_cancellation">Free Cancellation (24h before)</SelectItem>
                                    <SelectItem value="moderate">Moderate (Up to 3 days before)</SelectItem>
                                    <SelectItem value="non_refundable">Non-Refundable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Location & Address */}
                    <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">City <span className="text-destructive">*</span></Label>
                                <Select value={formData.city ? String(formData.city) : undefined} onValueChange={(val) => setFormData({ ...formData, city: val, area: "" })}>
                                    <SelectTrigger className="w-full h-9 text-xs bg-background"><SelectValue placeholder="Select City..." /></SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                        {cities.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Area / Neighborhood</Label>
                                <Select value={formData.area ? String(formData.area) : "none"} onValueChange={(val) => setFormData({ ...formData, area: val === "none" ? "" : val })}>
                                    <SelectTrigger className="w-full h-9 text-xs bg-background"><SelectValue placeholder="Select Area (Optional)..." /></SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                        <SelectItem value="none">Select Area (Optional)...</SelectItem>
                                        {filteredAreas.map((a) => (<SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Postal / PIN Code</Label>
                                <Input placeholder="e.g. 500081" value={formData.postal_code || ""} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} className="h-9 text-xs" />
                            </div>
                        </div>

                        {/* Detailed Street Address with Location Detection & Map Picker */}
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <Label className="text-xs font-semibold">Detailed Address <span className="text-destructive">*</span></Label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <UseCurrentLocation onLocationDetected={handleLocationChange} />
                                    <button type="button" onClick={() => setIsMapOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#312E81] text-white hover:bg-[#252269] rounded-md transition-all text-xs font-semibold shadow-xs cursor-pointer border border-[#312E81]">
                                        <MapIcon className="w-3.5 h-3.5 text-white" />
                                        <span>Select on Map</span>
                                    </button>
                                </div>
                            </div>
                            <textarea rows={2} placeholder="Enter detailed street address, landmark, building name, or use location buttons above..." value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:ring-1 focus:ring-primary outline-none" required />
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                                    <span>Latitude</span>
                                    <span className="text-[10px] text-muted-foreground/75 font-normal">Auto-filled from GPS / Map</span>
                                </label>
                                <Input type="number" step="0.000001" placeholder="e.g. 17.385044" value={formData.latitude ?? ""} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="h-8 text-xs font-mono bg-background" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                                    <span>Longitude</span>
                                    <span className="text-[10px] text-muted-foreground/75 font-normal">Auto-filled from GPS / Map</span>
                                </label>
                                <Input type="number" step="0.000001" placeholder="e.g. 78.486671" value={formData.longitude ?? ""} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="h-8 text-xs font-mono bg-background" />
                            </div>
                        </div>
                    </div>

                    {/* Check-in Times & Pet policy */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Check-In Time</Label>
                            <Input type="time" value={formData.check_in_time || "14:00"} onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Check-Out Time</Label>
                            <Input type="time" value={formData.check_out_time || "11:00"} onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="allows_pets" checked={formData.allows_pets} onChange={(e) => setFormData({ ...formData, allows_pets: e.target.checked })} className="rounded border-input text-blue-600 focus:ring-blue-500" />
                            <Label htmlFor="allows_pets" className="text-xs font-medium cursor-pointer">Pet Friendly Property 🐾</Label>
                        </div>
                    </div>

                    {/* Photos & Media Upload Section */}
                    <div className="space-y-2.5 p-4 rounded-xl border border-dashed border-[#312E81]/30 bg-[#312E81]/5 dark:bg-indigo-950/10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                    <ImageIcon size={14} className="text-[#312E81]" />
                                    Hotel Photos & Gallery
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Upload and manage photos (Exterior, Lobby, Deluxe Rooms, Dining) for this hotel.
                                </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-[#312E81]/30 text-[#312E81] bg-[#312E81]/10 font-semibold">
                                {((editingHotel?.images?.length || 0) + formImagePreviews.length)} Photos
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            {/* Existing Saved Hotel Photos */}
                            {editingHotel?.images?.map((img) => (
                                <div key={`existing-${img.id}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shadow-xs group bg-muted">
                                    <img src={toLocalMediaPath(img.image) || img.image} alt={img.caption || "Hotel Photo"} className="w-full h-full object-cover" />
                                    <button type="button" disabled={photoDeleteMutation.isPending} onClick={() => { photoDeleteMutation.mutate(img.id); setEditingHotel((prev) => prev ? { ...prev, images: (prev.images || []).filter((i) => i.id !== img.id) } : null); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" title="Delete this photo">
                                        <X size={11} />
                                    </button>
                                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate px-1">
                                        {img.is_primary ? "Primary" : "Saved"}
                                    </span>
                                </div>
                            ))}

                            {/* Newly Picked Photos */}
                            {formImagePreviews.map((preview, idx) => (
                                <div key={`new-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#312E81]/50 shadow-xs group">
                                    <img src={preview} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeFormImage(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                        <X size={11} />
                                    </button>
                                    <span className="absolute bottom-0 inset-x-0 bg-[#312E81] text-white text-[9px] text-center py-0.5 font-medium">New {idx + 1}</span>
                                </div>
                            ))}

                            {/* Add Photo Button */}
                            {((editingHotel?.images?.length || 0) + formImagePreviews.length) < 10 && (
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#312E81]/40 hover:border-[#312E81] bg-muted/40 hover:bg-[#312E81]/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-muted-foreground hover:text-[#312E81]">
                                    <Upload size={16} />
                                    <span className="text-[10px] font-medium">Add Photo</span>
                                    <input type="file" accept="image/*" multiple onChange={handleFormImageChange} className="sr-only" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Amenities Checklist */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Hotel Amenities</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 rounded-lg border bg-muted/20">
                            {amenitiesList.map((a) => {
                                const isChecked = formData.amenities.includes(a.id);
                                return (
                                    <label key={a.id} className={`flex items-center gap-2 p-2 rounded-md text-xs cursor-pointer border transition-colors ${isChecked ? "bg-[#312E81] border-[#312E81] text-white font-semibold shadow-2xs hover:bg-[#252269]" : "border-border/60 bg-background hover:bg-slate-100 text-foreground"}`}>
                                        <input type="checkbox" checked={isChecked} onChange={() => { const updated = isChecked ? formData.amenities.filter((id) => id !== a.id) : [...formData.amenities, a.id]; setFormData({ ...formData, amenities: updated }); }} className="sr-only" />
                                        <CheckCircle2 size={13} className={isChecked ? "text-white" : "text-muted-foreground/40"} />
                                        <span className="truncate">{a.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Hotel Description</Label>
                        <textarea rows={3} placeholder="Highlight luxury suites, culinary dining, spa amenities, and prime location..." value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:ring-1 focus:ring-primary" />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setIsCreating(false); setEditingHotel(null); }} className="text-xs">Cancel</Button>
                        <Button type="submit" size="sm" disabled={hotelMutation.isPending} className="text-xs bg-[#312E81] text-white font-medium shadow-sm cursor-pointer rounded-[3px] border border-[#312E81]">
                            {hotelMutation.isPending ? "Saving Hotel & Media..." : editingHotel ? "Update Hotel" : "Publish Hotel"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

