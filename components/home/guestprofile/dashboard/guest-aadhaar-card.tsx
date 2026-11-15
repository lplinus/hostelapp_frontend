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
    Loader2,
    Lock,
    X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { GuestProfile } from "../guest-profile-types";
import { updateGuestProfile } from "@/services/guestservices/guestprofile.service";

interface GuestAadhaarCardProps {
    profile: GuestProfile;
    onUploadSuccess: (updated: Partial<GuestProfile>) => void;
}

export default function GuestAadhaarCard({ profile, onUploadSuccess }: GuestAadhaarCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isTogglingShare, setIsTogglingShare] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [aadhaarInput, setAadhaarInput] = useState(profile.aadhaarNumber || "");

    const getStatusBadge = () => {
        if (profile.aadhaarFileUrl) {
            return (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 gap-1 text-[11px] font-medium">
                    <CheckCircle2 size={12} /> Aadhaar Verified & Ready
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-muted-foreground gap-1 text-[11px]">
                <AlertCircle size={12} /> Not Uploaded
            </Badge>
        );
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
            const formData = new FormData();
            formData.append("aadhaar_card_file", file);
            if (aadhaarInput.trim()) {
                formData.append("aadhaar_number", aadhaarInput.trim());
            }

            const updatedProfile = await updateGuestProfile(formData);

            onUploadSuccess({
                aadhaarFileName: updatedProfile.aadhaar_file_name || file.name,
                aadhaarFileUrl: updatedProfile.aadhaar_file_url || URL.createObjectURL(file),
                aadhaarNumber: updatedProfile.aadhaar_number || aadhaarInput,
                idVerificationStatus: updatedProfile.id_verification_status || "pending",
                shareIdWithHost: updatedProfile.share_id_with_host ?? profile.shareIdWithHost,
            });
            toast.success("Aadhaar card uploaded and securely saved for seamless check-in!");
        } catch (err: any) {
            console.error("[AadhaarUpload] Error:", err);
            toast.error("Failed to upload document to server. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveFile = async () => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("aadhaar_card_file", "");
            await updateGuestProfile(formData);

            onUploadSuccess({
                aadhaarFileUrl: undefined,
                aadhaarFileName: undefined,
                idVerificationStatus: "unverified",
                shareIdWithHost: false,
            });
            toast.info("Aadhaar document removed successfully.");
        } catch (err: any) {
            console.error("[AadhaarRemove] Error:", err);
            toast.error("Failed to remove document.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAadhaarBlur = async () => {
        if (!aadhaarInput.trim() || aadhaarInput.trim() === profile.aadhaarNumber) return;
        try {
            const res = await updateGuestProfile({ aadhaar_number: aadhaarInput.trim() });
            onUploadSuccess({ aadhaarNumber: res.aadhaar_number || aadhaarInput.trim() });
            toast.success("Aadhaar number saved.");
        } catch (err: any) {
            console.error("[AadhaarSave] Error:", err);
        }
    };

    const handleSwitchClick = (nextChecked: boolean) => {
        if (!profile.aadhaarFileUrl) {
            toast.error("Please upload your Aadhaar document first before authorizing access.");
            return;
        }

        if (nextChecked) {
            setIsConfirmModalOpen(true);
        } else {
            handleToggleSharePermission(false);
        }
    };

    const handleToggleSharePermission = async (checked: boolean) => {
        setIsTogglingShare(true);
        try {
            const res = await updateGuestProfile({ share_id_with_host: checked });
            onUploadSuccess({ shareIdWithHost: res.share_id_with_host ?? checked });
            toast.success(
                checked
                    ? "Authorization granted! Property owners of your confirmed bookings can now verify your ID for fast check-in."
                    : "Sharing authorization revoked. Property owners will not see your ID document."
            );
        } catch (err: any) {
            console.error("[AadhaarPermission] Error:", err);
            toast.error("Failed to update sharing preference.");
        } finally {
            setIsTogglingShare(false);
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
                            className="h-8 text-xs gap-1.5 rounded-sm"
                            onClick={() => setIsViewModalOpen(true)}
                        >
                            <Eye size={13} /> View
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive rounded-sm"
                            onClick={handleRemoveFile}
                        >
                            {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/20 hover:bg-muted/30 ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                    </div>
                    <p className="text-xs font-medium text-foreground">
                        {isUploading ? "Uploading document to secure server..." : "Click or drag your Aadhaar card here"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        PDF or Images (JPG, PNG, WebP) up to 15MB. Encrypted and accessible only upon your authorization.
                    </p>
                </div>
            )}

            {/* Authorization & Permission Toggle */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-4 h-4 ${profile.shareIdWithHost ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                            <span className="text-xs font-semibold text-foreground">
                                Share ID with Property Owners for Fast Check-in
                            </span>
                            {profile.shareIdWithHost ? (
                                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] font-medium">
                                    Authorized
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                    Not Shared
                                </Badge>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
                            Grant permission to share your verified ID document directly with the property host/owner for your bookings. This allows contactless check-in upon arrival without manual paperwork.
                        </p>
                    </div>
                    <div className="flex items-center pt-1 shrink-0">
                        <Switch
                            checked={!!profile.shareIdWithHost}
                            disabled={!profile.aadhaarFileUrl || isUploading || isTogglingShare}
                            onCheckedChange={handleSwitchClick}
                        />
                    </div>
                </div>
                {!profile.aadhaarFileUrl && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                        * Please upload your Aadhaar document above to enable sharing with property owners.
                    </p>
                )}
            </div>

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
                        onBlur={handleAadhaarBlur}
                        placeholder="e.g. 1234 5678 9012"
                        className="h-8 text-xs"
                    />
                </div>
                <div className="flex items-center text-[11px] text-muted-foreground leading-relaxed pt-4 sm:pt-0">
                    Hotel managers and vacation rental hosts verify your identity directly from the reservation details popup when authorized.
                </div>
            </div>

            {/* Confirmation Dialog before Authorizing (Rectangular with minimal soft corners) */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-[430px] rounded-sm p-6 border border-border/80 shadow-2xl bg-card">
                    <DialogHeader className="space-y-2">
                        <div className="w-9 h-9 rounded-sm bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                            Authorize Aadhaar Document Sharing?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            By confirming, you authorize Hostel In to securely share your uploaded Aadhaar document and number with the verified hosts/managers of your bookings. This ensures fast, contactless check-in upon your arrival.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:justify-end pt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isTogglingShare}
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="text-xs font-semibold h-8 rounded-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={isTogglingShare}
                            onClick={async () => {
                                await handleToggleSharePermission(true);
                                setIsConfirmModalOpen(false);
                            }}
                            className="text-xs font-semibold h-8 rounded-sm bg-[#1F1E1B] hover:bg-[#2C2A26] text-[#EDE8DF] gap-1.5"
                        >
                            {isTogglingShare ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Authorize & Share
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* In-App Document Viewer Dialog (Opens inside application instead of new tab) */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl w-full max-h-[90vh] rounded-sm p-0 overflow-hidden border border-border bg-background shadow-2xl flex flex-col">
                    <DialogHeader className="p-3.5 px-5 border-b border-border bg-muted/30 flex flex-row items-center justify-between gap-3 space-y-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileCheck2 className="w-4 h-4 text-primary shrink-0" />
                            <DialogTitle className="text-sm font-bold text-foreground truncate">
                                {profile.aadhaarFileName || "Aadhaar Card Document"}
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-medium border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 gap-1 rounded-sm py-0.5 px-2 select-none">
                                <Lock size={10} /> View-Only • Encrypted
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsViewModalOpen(false)}
                                className="h-7 w-7 p-0 rounded-sm text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 p-4 bg-muted/10 overflow-auto flex items-center justify-center min-h-[450px]">
                        {profile.aadhaarFileUrl ? (
                            profile.aadhaarFileName?.toLowerCase().endsWith(".pdf") || profile.aadhaarFileUrl.toLowerCase().includes(".pdf") ? (
                                <iframe
                                    src={`${profile.aadhaarFileUrl}#toolbar=0`}
                                    title="Aadhaar Document Preview"
                                    className="w-full h-[65vh] rounded-sm border border-border/60 bg-white"
                                />
                            ) : (
                                <img
                                    src={profile.aadhaarFileUrl}
                                    alt="Aadhaar Document Preview"
                                    className="max-h-[65vh] max-w-full object-contain rounded-sm border border-border/60 shadow-sm"
                                />
                            )
                        ) : (
                            <p className="text-xs text-muted-foreground">Document preview unavailable.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

