"use client";

import type { VacationRentalFormData } from "./vacation-rental-hooks";
import type { CityItem, AreaItem } from "@/services/location.service";
import { MapPin, BedDouble } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VacationRentalFormLocationProps {
    formData: VacationRentalFormData;
    setFormData: React.Dispatch<React.SetStateAction<VacationRentalFormData>>;
    cities: CityItem[];
    filteredAreas: AreaItem[];
}

export default function VacationRentalFormLocation({ formData, setFormData, cities, filteredAreas }: VacationRentalFormLocationProps) {
    return (
        <>
            {/* Section 3: Location & Address */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <MapPin size={16} className="text-[#312E81]" />
                            <span>3. Location &amp; Address</span>
                        </h3>
                        <span className="text-[11px] text-muted-foreground font-medium">* Required</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">City <span className="text-rose-500">*</span></Label>
                            <Select value={formData.city} onValueChange={(val) => setFormData({ ...formData, city: val, area: "" })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select City" /></SelectTrigger>
                                <SelectContent>{cities.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Area / Neighborhood</Label>
                            <Select value={formData.area} onValueChange={(val) => setFormData({ ...formData, area: val })} disabled={!formData.city}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Area" /></SelectTrigger>
                                <SelectContent>{filteredAreas.map((a) => (<SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-semibold">Full Street Address</Label>
                            <Input placeholder="Street, landmark, sector..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Postal Code</Label>
                            <Input placeholder="313001" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} className="h-9 text-xs" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Space & Capacity */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <BedDouble size={16} className="text-[#312E81]" />
                            <span>4. Space &amp; Capacity (Airbnb Specifications)</span>
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Max Guests</Label>
                            <Input type="number" min="1" max="50" value={formData.max_guests} onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })} className="h-9 text-xs font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Bedrooms</Label>
                            <Input type="number" min="1" max="20" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="h-9 text-xs font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Beds</Label>
                            <Input type="number" min="1" max="30" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} className="h-9 text-xs font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Bathrooms</Label>
                            <Input type="number" step="0.5" min="0.5" max="20" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="h-9 text-xs font-semibold" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

