"use client";

import React, { useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShieldCheck,
    FileText,
    ArrowRight,
    Edit3,
    Eye,
    EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { maskEmail, maskPhone } from "../mask-utils";
import type { GuestProfile } from "../guest-profile-types";

interface GuestProfileOverviewCardProps {
    profile: GuestProfile;
    onGoToProfile: () => void;
}

export default function GuestProfileOverviewCard({
    profile,
    onGoToProfile,
}: GuestProfileOverviewCardProps) {
    const [revealEmail, setRevealEmail] = useState(false);
    const [revealPhone, setRevealPhone] = useState(false);

    return (
        <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <User size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-foreground">
                            Profile & Identity Summary
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Quick snapshot of your verified details and documents.
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onGoToProfile}
                    className="text-xs font-semibold h-8 rounded-md gap-1.5 cursor-pointer hover:bg-muted"
                >
                    <Edit3 size={12} />
                    <span>Manage Full Profile</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <div className="p-3 rounded-md bg-muted/30 border border-border/50 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <User size={12} className="text-primary" /> Full Name
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {profile.fullName || "—"}
                    </p>
                </div>

                <div className="p-3 rounded-md bg-muted/30 border border-border/50 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                            <Mail size={12} className="text-primary" /> Email
                        </span>
                        <button
                            type="button"
                            onClick={() => setRevealEmail(!revealEmail)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                            title={revealEmail ? "Mask email" : "Show email"}
                        >
                            {revealEmail ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {revealEmail ? (profile.email || "—") : maskEmail(profile.email)}
                    </p>
                </div>

                <div className="p-3 rounded-md bg-muted/30 border border-border/50 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                            <Phone size={12} className="text-primary" /> Mobile
                        </span>
                        <button
                            type="button"
                            onClick={() => setRevealPhone(!revealPhone)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                            title={revealPhone ? "Mask phone" : "Show phone"}
                        >
                            {revealPhone ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {revealPhone ? (profile.phone || "—") : maskPhone(profile.phone)}
                    </p>
                </div>

                <div className="p-3 rounded-md bg-muted/30 border border-border/50 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={12} className="text-primary" /> KYC Status
                    </p>
                    <div>
                        {profile.idVerificationStatus === "verified" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 text-[10px] font-semibold gap-1">
                                <ShieldCheck size={11} /> Verified
                            </Badge>
                        ) : profile.idVerificationStatus === "pending" ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold">
                                Under Review
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Not Verified
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <FileText size={13} className="text-muted-foreground" />
                    Identity Document: <strong className="text-foreground">{profile.aadhaarFileName ? "Aadhaar Card uploaded" : "No document uploaded"}</strong>
                </span>
                <button
                    onClick={onGoToProfile}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                    View & update documents <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}

