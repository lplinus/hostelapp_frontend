"use client";

import React, { useState } from "react";
import { ShieldCheck, Mail, Phone, MapPin, Camera, Menu, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { maskEmail, maskPhone } from "../mask-utils";
import type { GuestProfile } from "../guest-profile-types";

interface GuestProfileHeaderProps {
    profile: GuestProfile;
    isEditing: boolean;
    onToggleEdit: () => void;
}

export default function GuestProfileHeader({
    profile,
    isEditing,
    onToggleEdit,
}: GuestProfileHeaderProps) {
    const [revealEmail, setRevealEmail] = useState(false);
    const [revealPhone, setRevealPhone] = useState(false);
    return (
        <div className="space-y-3">
            {/* Mobile menu trigger */}
            <div className="md:hidden flex items-center justify-between bg-card border border-border/80 rounded-lg px-4 py-2.5 shadow-2xs">
                <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Toggle Navigation"
                >
                    <Menu size={20} />
                </button>
                <span className="text-xs font-bold text-foreground">Guest Portal</span>
            </div>

            <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-bold text-xl sm:text-2xl overflow-hidden shrink-0">
                            {profile.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{profile.fullName?.charAt(0)?.toUpperCase() || "G"}</span>
                            )}
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-xs hover:bg-primary/90 cursor-pointer"
                                title="Change avatar"
                            >
                                <Camera size={13} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {profile.fullName || "Guest Profile"}
                            </h1>
                            {profile.idVerificationStatus === "verified" ? (
                                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 gap-1 text-[11px] font-semibold">
                                    <ShieldCheck size={12} /> Verified Guest
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground text-[11px]">
                                    Unverified
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {profile.email && (
                                <span className="inline-flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                                    <Mail size={12} className="text-primary" />
                                    <span>{revealEmail ? profile.email : maskEmail(profile.email)}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRevealEmail(!revealEmail)}
                                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                                        title={revealEmail ? "Mask email" : "Show full email"}
                                        aria-label={revealEmail ? "Mask email" : "Show full email"}
                                    >
                                        {revealEmail ? <EyeOff size={11} /> : <Eye size={11} />}
                                    </button>
                                </span>
                            )}
                            {profile.phone && (
                                <span className="inline-flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                                    <Phone size={12} className="text-primary" />
                                    <span>{revealPhone ? profile.phone : maskPhone(profile.phone)}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRevealPhone(!revealPhone)}
                                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                                        title={revealPhone ? "Mask phone" : "Show full phone"}
                                        aria-label={revealPhone ? "Mask phone" : "Show full phone"}
                                    >
                                        {revealPhone ? <EyeOff size={11} /> : <Eye size={11} />}
                                    </button>
                                </span>
                            )}
                            {(profile.city || profile.country) && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {[profile.city, profile.country].filter(Boolean).join(", ")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <Button
                        size="sm"
                        onClick={onToggleEdit}
                        variant={isEditing ? "outline" : "default"}
                        className={`text-xs font-semibold rounded-md h-8 px-4 cursor-pointer transition-colors ${
                            !isEditing ? "bg-[#312E81] hover:bg-[#252269] text-white" : ""
                        }`}
                    >
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                </div>
            </div>

            {profile.bio && (
                <p className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground line-clamp-2">
                    {profile.bio}
                </p>
            )}
        </div>
        </div>
    );
}

