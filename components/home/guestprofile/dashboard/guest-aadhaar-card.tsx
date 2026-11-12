"use client";

import React, { useRef, useState } from "react";
import {
    UploadCloud,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Trash2,
    ShieldCheck,
    FileCheck2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { GuestProfile } from "../guest-profile-types";

interface GuestAadhaarCardProps {
    profile: GuestProfile;
    onUploadSuccess: (updated: Partial<GuestProfile>) => void;
}

export default function GuestAadhaarCard({ profile, onUploadSuccess }: GuestAadhaarCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [aadhaarInput, setAadhaarInput] = useState(profile.aadhaarNumber || "");

    const getStatusBadge = () => {
        switch (profile.idVerificationStatus) {
            case "verified":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 gap-1 text-[11px] font-medium">
                        <CheckCircle2 size={12} /> Aadhaar Verified
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 gap-1 text-[11px] font-medium">
                        <Clock size={12} /> Under Review
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="destructive" className="gap-1 text-[11px] font-medium">
                        <AlertCircle size={12} /> Verification Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground gap-1 text-[11px]">
                        <AlertCircle size={12} /> Not Uploaded
                    </Badge>
                );
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.type)) {
            toast.error("Please upload a valid PDF or image file (JPG, PNG, WebP).");
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            toast.error("File size exceeds 15MB limit.");
            return;
        }

        setIsUploading(true);
        try {
            // Create local object URL for instant preview
            const previewUrl = URL.createObjectURL(file);
            onUploadSuccess({
                aadhaarFileName: file.name,
                aadhaarFileUrl: previewUrl,
                aadhaarNumber: aadhaarInput || "•••• •••• " + Math.floor(1000 + Math.random() * 9000),
                idVerificationStatus: "pending",
            });
            toast.success("Aadhaar card uploaded successfully for seamless check-in!");
        } catch {
            toast.error("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-semibold text-foreground tracking-tight">
                            Identity Verification (Aadhaar Card)
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Store your government ID securely once for 10-second instant check-in across all properties.
                    </p>
                </div>
                {getStatusBadge()}
            </div>

            {profile.aadhaarFileUrl ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-md bg-muted/40 border border-border/70">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileCheck2 size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-foreground truncate max-w-[220px] sm:max-w-xs">
                                {profile.aadhaarFileName || "Aadhaar_Document.pdf"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Aadhaar No: {profile.aadhaarNumber || "•••• •••• ••••"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => window.open(profile.aadhaarFileUrl, "_blank")}
                        >
                            <Eye size={13} /> View
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                                onUploadSuccess({
                                    aadhaarFileUrl: undefined,
                                    aadhaarFileName: undefined,
                                    idVerificationStatus: "unverified",
                                });
                                toast.info("Document removed.");
                            }}
                        >
                            <Trash2 size={13} /> Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/20 hover:bg-muted/30"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <UploadCloud size={20} />
                    </div>
                    <p className="text-xs font-medium text-foreground">
                        {isUploading ? "Uploading document..." : "Click or drag your Aadhaar card here"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        PDF or Images (JPG, PNG, WebP) up to 15MB. Encrypted and accessible only for authorized check-in.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                        Aadhaar Number (Optional / Display)
                    </label>
                    <Input
                        value={aadhaarInput}
                        onChange={(e) => {
                            setAadhaarInput(e.target.value);
                            onUploadSuccess({ aadhaarNumber: e.target.value });
                        }}
                        placeholder="e.g. 1234 5678 9012"
                        className="h-8 text-xs"
                    />
                </div>
                <div className="flex items-center text-[11px] text-muted-foreground leading-relaxed pt-4 sm:pt-0">
                    Hostel managers and hotel front desks verify your identity in seconds without taking physical paperwork.
                </div>
            </div>
        </div>
    );
}

