"use client";

import type { VacationRentalFormData } from "./vacation-rental-hooks";
import { CANCELLATION_POLICIES } from "./vacation-rental-types";
import { DollarSign, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VacationRentalFormPricingProps {
    formData: VacationRentalFormData;
    setFormData: React.Dispatch<React.SetStateAction<VacationRentalFormData>>;
}

export default function VacationRentalFormPricing({ formData, setFormData }: VacationRentalFormPricingProps) {
    return (
        <>
            {/* Section 5: Pricing & Tariffs */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <DollarSign size={16} className="text-[#312E81]" />
                            <span>5. Pricing, Tariffs &amp; Discounts</span>
                        </h3>
                        <span className="text-[11px] text-muted-foreground font-medium">* Base price required</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Nightly Base Price (₹) <span className="text-rose-500">*</span></Label>
                            <Input type="number" placeholder="e.g. 14000" value={formData.price_per_night} onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })} required className="h-10 text-sm font-bold text-slate-900" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Weekend Nightly Price (₹)</Label>
                            <Input type="number" placeholder="Optional (Fri/Sat)" value={formData.weekend_price_per_night} onChange={(e) => setFormData({ ...formData, weekend_price_per_night: e.target.value })} className="h-10 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Cleaning Fee (₹)</Label>
                            <Input type="number" value={formData.cleaning_fee} onChange={(e) => setFormData({ ...formData, cleaning_fee: e.target.value })} className="h-10 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Security Deposit (₹)</Label>
                            <Input type="number" value={formData.security_deposit} onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })} className="h-10 text-xs" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-semibold">Weekly Stay Discount (%)</Label>
                            <Input type="number" min="0" max="100" placeholder="Applied for 7+ nights stays" value={formData.weekly_discount_percentage} onChange={(e) => setFormData({ ...formData, weekly_discount_percentage: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-semibold">Monthly Stay Discount (%)</Label>
                            <Input type="number" min="0" max="100" placeholder="Applied for 28+ nights stays" value={formData.monthly_discount_percentage} onChange={(e) => setFormData({ ...formData, monthly_discount_percentage: e.target.value })} className="h-9 text-xs" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 6: House Rules & Check-in Policies */}
            <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="border-b pb-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Clock size={16} className="text-[#312E81]" />
                            <span>6. Rules &amp; Check-In Policies</span>
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Check-in Time</Label>
                            <Input type="time" value={formData.check_in_time} onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Check-out Time</Label>
                            <Input type="time" value={formData.check_out_time} onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Min Nights</Label>
                            <Input type="number" min="1" value={formData.min_nights} onChange={(e) => setFormData({ ...formData, min_nights: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Max Nights</Label>
                            <Input type="number" min="1" value={formData.max_nights} onChange={(e) => setFormData({ ...formData, max_nights: e.target.value })} className="h-9 text-xs" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Cancellation Policy</Label>
                        <Select value={formData.cancellation_policy} onValueChange={(val) => setFormData({ ...formData, cancellation_policy: val })}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{CANCELLATION_POLICIES.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={formData.instant_book} onChange={(e) => setFormData({ ...formData, instant_book: e.target.checked })} className="rounded text-[#312E81] focus:ring-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">Instant Book</span>
                                <span className="text-[10px] text-muted-foreground">No host pre-approval</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={formData.allows_pets} onChange={(e) => setFormData({ ...formData, allows_pets: e.target.checked })} className="rounded text-[#312E81] focus:ring-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">Pets Allowed</span>
                                <span className="text-[10px] text-muted-foreground">Pet-friendly stay</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={formData.allows_smoking} onChange={(e) => setFormData({ ...formData, allows_smoking: e.target.checked })} className="rounded text-[#312E81] focus:ring-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">Smoking Permitted</span>
                                <span className="text-[10px] text-muted-foreground">Designated areas</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={formData.allows_parties} onChange={(e) => setFormData({ ...formData, allows_parties: e.target.checked })} className="rounded text-[#312E81] focus:ring-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">Parties / Events OK</span>
                                <span className="text-[10px] text-muted-foreground">Gatherings allowed</span>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-semibold">Custom House Rules</Label>
                        <Input placeholder="e.g. Quiet hours after 10 PM, swimming pool usage rules, footwear policy..." value={formData.custom_rules} onChange={(e) => setFormData({ ...formData, custom_rules: e.target.value })} className="h-9 text-xs" />
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

