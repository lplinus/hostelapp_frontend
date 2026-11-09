"use client";

import type { VacationRentalFormData } from "./vacation-rental-hooks";
import type { CityItem, AreaItem } from "@/services/location.service";
import { CATEGORIES, RENTAL_TYPES } from "./vacation-rental-types";
import { Home, User, Phone, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VacationRentalFormBasicProps {
    formData: VacationRentalFormData;
    setFormData: React.Dispatch<React.SetStateAction<VacationRentalFormData>>;
}

export default function VacationRentalFormBasic({ formData, setFormData }: VacationRentalFormBasicProps) {
    return (
        <>
            {/* Section 1: Basic Information */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Home size={16} className="text-[#312E81]" />
                            <span>1. Basic Property Information</span>
                        </h3>
                        <span className="text-[11px] text-muted-foreground font-medium">* Required</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs font-semibold">Property Title <span className="text-rose-500">*</span></Label>
                            <Input placeholder="e.g. Udaivilas Heritage Lakeside Haveli" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="h-10 text-xs sm:text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs font-semibold">Catchy Tagline</Label>
                            <Input placeholder="e.g. Restored 18th-century royal villa overlooking Lake Pichola" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Category</Label>
                            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Rental Type</Label>
                            <Select value={formData.rental_type} onValueChange={(val) => setFormData({ ...formData, rental_type: val })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{RENTAL_TYPES.map((rt) => (<SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Caretaker Contact & Wi-Fi Credentials */}
            <Card className="border border-indigo-100 bg-indigo-50/20 shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b border-indigo-100 pb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <User size={16} className="text-[#312E81]" />
                            <span>2. Caretaker Contact &amp; Wi-Fi Credentials</span>
                        </h3>
                        <Badge className="bg-[#312E81] text-white text-[10px]">Guest Amenities</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Caretaker Contact Subcard */}
                        <div className="p-4 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <Phone size={14} className="text-[#312E81]" />
                                <span>On-Site Caretaker / Property Manager</span>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700">Caretaker Full Name</Label>
                                <Input placeholder="e.g. Rameshwar Singh (Property Caretaker)" value={formData.caretaker_name} onChange={(e) => setFormData({ ...formData, caretaker_name: e.target.value })} className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700">Caretaker Contact / Mobile Number</Label>
                                <Input type="tel" placeholder="e.g. +91 98765 43210" value={formData.caretaker_number} onChange={(e) => setFormData({ ...formData, caretaker_number: e.target.value })} className="h-9 text-xs font-mono" />
                                <p className="text-[10px] text-muted-foreground">Shared with guests on confirmed reservations for check-in coordination.</p>
                            </div>
                        </div>
                        {/* Wi-Fi Credentials Subcard */}
                        <div className="p-4 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <Wifi size={14} className="text-[#312E81]" />
                                <span>Guest Wi-Fi Connection Details</span>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700">Wi-Fi Network Name (SSID)</Label>
                                <Input placeholder="e.g. Udaivilas_Guest_5G" value={formData.wifi_name} onChange={(e) => setFormData({ ...formData, wifi_name: e.target.value })} className="h-9 text-xs font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700">Wi-Fi Password</Label>
                                <Input type="text" placeholder="e.g. HaveliGuest@2026" value={formData.wifi_password} onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })} className="h-9 text-xs font-mono" />
                                <p className="text-[10px] text-muted-foreground">Made available inside the guest trip folio upon confirmed reservation.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

