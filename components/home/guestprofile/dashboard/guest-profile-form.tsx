"use client";

import React from "react";
import { User, MapPin, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { GuestProfile } from "../guest-profile-types";

interface GuestProfileFormProps {
    formData: GuestProfile;
    setFormData: React.Dispatch<React.SetStateAction<GuestProfile>>;
    onSave: (e: React.FormEvent) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export default function GuestProfileForm({
    formData,
    setFormData,
    onSave,
    onCancel,
    isSaving = false,
}: GuestProfileFormProps) {
    return (
        <form onSubmit={onSave} className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="space-y-0.5">
                    <h2 className="text-sm sm:text-base font-bold text-foreground">Personal & Travel Details</h2>
                    <p className="text-xs text-muted-foreground">Update your contact information, ID verification, and stay preferences.</p>
                </div>
            </div>

            {/* 1. Basic Info */}
            <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User size={13} className="text-primary" /> Basic Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Full Name *</Label>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="h-8.5 text-xs"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Phone Number *</Label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-8.5 text-xs"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Email Address *</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-8.5 text-xs"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* 2. Location */}
            <div className="space-y-3 pt-2 border-t border-border/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary" /> Address & Location
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">City</Label>
                        <Input
                            value={formData.city || ""}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="e.g. Hyderabad"
                            className="h-8.5 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">State / Region</Label>
                        <Input
                            value={formData.state || ""}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="e.g. Telangana"
                            className="h-8.5 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Postal Code</Label>
                        <Input
                            value={formData.postalCode || ""}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            placeholder="e.g. 500081"
                            className="h-8.5 text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Emergency Contact & Verification */}
            <div className="space-y-3 pt-2 border-t border-border/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Shield size={13} className="text-primary" /> Safety & Verification
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Emergency Contact Person</Label>
                        <Input
                            value={formData.emergencyContactName || ""}
                            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            placeholder="Full name"
                            className="h-8.5 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Emergency Phone</Label>
                        <Input
                            value={formData.emergencyContactPhone || ""}
                            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            placeholder="+91 ..."
                            className="h-8.5 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">ID Type</Label>
                        <Select
                            value={formData.idType || "aadhaar"}
                            onValueChange={(val: string) => setFormData({ ...formData, idType: val as GuestProfile["idType"] })}
                        >
                            <SelectTrigger className="h-8.5 text-xs">
                                <SelectValue placeholder="Select ID" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                <SelectItem value="passport">Passport</SelectItem>
                                <SelectItem value="driving_license">Driving License</SelectItem>
                                <SelectItem value="voter_id">Voter ID</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    className="text-xs font-semibold h-8 rounded-md"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    className="bg-[#312E81] hover:bg-[#252269] text-white text-xs font-semibold h-8 px-4 rounded-md gap-1.5 cursor-pointer"
                >
                    <Save size={13} />
                    <span>{isSaving ? "Saving..." : "Save Profile"}</span>
                </Button>
            </div>
        </form>
    );
}

