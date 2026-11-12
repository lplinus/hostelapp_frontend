"use client";

import React, { useState } from "react";
import { User, MapPin, Shield, Calendar, Phone, Mail, FileText, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { maskEmail, maskPhone } from "../mask-utils";
import GuestProfileForm from "./guest-profile-form";
import GuestAadhaarCard from "./guest-aadhaar-card";
import type { GuestProfile } from "../guest-profile-types";

interface GuestProfileDetailsSectionProps {
    profile: GuestProfile;
    formData: GuestProfile;
    setFormData: React.Dispatch<React.SetStateAction<GuestProfile>>;
    onSave: (e: React.FormEvent) => void;
    isSaving: boolean;
    onAadhaarUpdate: (updated: Partial<GuestProfile>) => void;
}

export default function GuestProfileDetailsSection({
    profile,
    formData,
    setFormData,
    onSave,
    isSaving,
    onAadhaarUpdate,
}: GuestProfileDetailsSectionProps) {
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [revealEmail, setRevealEmail] = useState(false);
    const [revealPhone, setRevealPhone] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header Description */}
            <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">
                            Profile Details & Documents
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Manage your personal credentials, contact info, emergency contacts, and KYC Aadhaar documents.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                        className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#312E81] text-white hover:bg-[#252269] transition-colors cursor-pointer self-start sm:self-auto"
                    >
                        {isEditingPersonal ? "Close Editor" : "Edit Details"}
                    </button>
                </div>

                {/* Read-Only Details Grid */}
                {!isEditingPersonal && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                Full Legal Name
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {profile.fullName || "Not provided"}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    Email Address
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setRevealEmail(!revealEmail)}
                                    className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                                    title={revealEmail ? "Mask email" : "Show email"}
                                >
                                    {revealEmail ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-foreground truncate">
                                {revealEmail ? (profile.email || "Not provided") : maskEmail(profile.email)}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    Phone Number
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setRevealPhone(!revealPhone)}
                                    className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                                    title={revealPhone ? "Mask phone" : "Show phone"}
                                >
                                    {revealPhone ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                {revealPhone ? (profile.phone || "Not provided") : maskPhone(profile.phone)}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                Gender & Nationality
                            </span>
                            <p className="text-sm font-semibold text-foreground capitalize">
                                {[profile.gender?.replace(/_/g, " "), profile.country || "India"].filter(Boolean).join(", ")}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                Location / City
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {[profile.city, profile.state, profile.postalCode].filter(Boolean).join(", ") || "Not specified"}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                Emergency Contact
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {profile.emergencyContactName ? (
                                    <>
                                        {profile.emergencyContactName} ({profile.emergencyContactRelation || "Contact"}) - {profile.emergencyContactPhone}
                                    </>
                                ) : (
                                    "None registered"
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form if editing */}
                {isEditingPersonal && (
                    <div className="pt-2 animate-in fade-in duration-200">
                        <GuestProfileForm
                            formData={formData}
                            setFormData={setFormData}
                            onSave={(e) => {
                                onSave(e);
                                setIsEditingPersonal(false);
                            }}
                            onCancel={() => setIsEditingPersonal(false)}
                            isSaving={isSaving}
                        />
                    </div>
                )}
            </div>

            {/* Document Verification & Upload Card */}
            <div>
                <GuestAadhaarCard
                    profile={profile}
                    onUploadSuccess={onAadhaarUpdate}
                />
            </div>
        </div>
    );
}

