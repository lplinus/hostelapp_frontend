"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    Eye,
    Trash2,
    ShieldCheck,
    FileCheck2,
    Loader2,
    Lock,
    X,
    User,
    UserPlus,
    Users,
    Download,
    FileText,
    CalendarCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { GuestProfile, GuestDocumentItem, GuestTripSummary } from "../../guest-profile-types";
import {
    getGuestDocuments,
    uploadGuestDocument,
    deleteGuestDocument,
    updateGuestProfile,
} from "@/services/guestservices/guestprofile.service";

interface GuestAadhaarCardProps {
    profile: GuestProfile;
    onUploadSuccess: (updated: Partial<GuestProfile>) => void;
    bookings?: GuestTripSummary[];
}

const DOCUMENT_CATEGORIES = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "voter_id", label: "Voter ID" },
    { value: "national_id", label: "National ID" },
    { value: "other", label: "Other Government ID" },
] as const;

export default function GuestAadhaarCard({
    profile,
    onUploadSuccess,
    bookings = [],
}: GuestAadhaarCardProps) {
    const primaryFileInputRef = useRef<HTMLInputElement>(null);
    const memberFileInputRef = useRef<HTMLInputElement>(null);

    // Document state
    const [documents, setDocuments] = useState<GuestDocumentItem[]>(profile.documents || []);
    const [selectedBookingRef, setSelectedBookingRef] = useState<string>("");
    const [maxAllowed, setMaxAllowed] = useState<number>(profile.maxDocumentUploads || 6);

    // Form inputs for Primary Document
    const [primaryCategory, setPrimaryCategory] = useState<string>("aadhaar");
    const [primaryDocNumber, setPrimaryDocNumber] = useState<string>(profile.aadhaarNumber || "");

    // Form inputs for Member Document
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [memberName, setMemberName] = useState("");
    const [memberCategory, setMemberCategory] = useState<string>("aadhaar");
    const [memberDocNumber, setMemberDocNumber] = useState("");
    const [memberSelectedFile, setMemberSelectedFile] = useState<File | null>(null);

    // In-flight loading states
    const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);
    const [isUploadingMember, setIsUploadingMember] = useState(false);
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [isTogglingShare, setIsTogglingShare] = useState(false);

    // Modals
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedDocForView, setSelectedDocForView] = useState<GuestDocumentItem | null>(null);

    // Fetch documents on mount or when selected booking changes
    useEffect(() => {
        let isMounted = true;
        const fetchDocs = async () => {
            try {
                const res = await getGuestDocuments(selectedBookingRef || undefined);
                if (!isMounted) return;

                const mappedDocs: GuestDocumentItem[] = (res.documents || []).map((d) => ({
                    id: d.id,
                    isPrimaryGuest: d.is_primary_guest,
                    memberName: d.member_name,
                    documentType: d.document_type,
                    documentTypeName: d.document_type_name,
                    documentNumber: d.document_number || undefined,
                    fileUrl: d.file_url,
                    fileName: d.file_name,
                    fileSize: d.file_size,
                    bookingReference: d.booking_reference || undefined,
                    verificationStatus: d.verification_status,
                    createdAt: d.created_at,
                    updatedAt: d.updated_at,
                }));

                setDocuments(mappedDocs);
                if (res.max_allowed) {
                    setMaxAllowed(res.max_allowed);
                }
            } catch (err) {
                console.error("[GuestDocuments] Fetch error:", err);
            }
        };

        fetchDocs();
        return () => {
            isMounted = false;
        };
    }, [selectedBookingRef]);

    // Keep maxAllowed in sync if profile prop updates with a new superadmin limit
    useEffect(() => {
        if (typeof profile.maxDocumentUploads === "number" && !selectedBookingRef) {
            setMaxAllowed(profile.maxDocumentUploads);
        }
    }, [profile.maxDocumentUploads, selectedBookingRef]);

    // Separate Primary Document from Additional Member Documents
    const primaryDocument = useMemo(() => {
        const found = documents.find((d) => d.isPrimaryGuest);
        if (found) return found;

        // Fallback to legacy profile document if present
        if (profile.aadhaarFileUrl) {
            return {
                id: String(profile.id || "primary"),
                isPrimaryGuest: true,
                memberName: profile.fullName || "Primary Guest",
                documentType: (profile.idType || "aadhaar") as any,
                documentTypeName: "Aadhaar Card",
                documentNumber: profile.aadhaarNumber,
                fileUrl: profile.aadhaarFileUrl,
                fileName: profile.aadhaarFileName || "Aadhaar_Document.pdf",
                verificationStatus: profile.idVerificationStatus || "verified",
            } as GuestDocumentItem;
        }
        return null;
    }, [documents, profile]);

    const memberDocuments = useMemo(() => {
        return documents.filter((d) => !d.isPrimaryGuest);
    }, [documents]);

    const totalUploadedCount = useMemo(() => {
        return (primaryDocument ? 1 : 0) + memberDocuments.length;
    }, [primaryDocument, memberDocuments]);

    const remainingSlots = useMemo(() => {
        return Math.max(0, maxAllowed - totalUploadedCount);
    }, [maxAllowed, totalUploadedCount]);

    const isLimitReached = remainingSlots <= 0;

    // ── Primary Document Upload Handler ──────────────────────────────────────
    const handlePrimaryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setIsUploadingPrimary(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("is_primary_guest", "true");
            formData.append("member_name", profile.fullName || "Primary Guest");
            formData.append("document_type", primaryCategory);
            if (primaryDocNumber.trim()) {
                formData.append("document_number", primaryDocNumber.trim());
            }
            if (selectedBookingRef) {
                formData.append("booking_reference", selectedBookingRef);
            }

            const uploaded = await uploadGuestDocument(formData);

            const newDoc: GuestDocumentItem = {
                id: uploaded.id,
                isPrimaryGuest: true,
                memberName: uploaded.member_name,
                documentType: uploaded.document_type,
                documentTypeName: uploaded.document_type_name,
                documentNumber: uploaded.document_number || undefined,
                fileUrl: uploaded.file_url,
                fileName: uploaded.file_name,
                fileSize: uploaded.file_size,
                bookingReference: uploaded.booking_reference || undefined,
                verificationStatus: uploaded.verification_status,
                createdAt: uploaded.created_at,
            };

            // Update local state immediately
            setDocuments((prev) => {
                const filtered = prev.filter((d) => !d.isPrimaryGuest);
                return [newDoc, ...filtered];
            });

            onUploadSuccess({
                aadhaarFileName: uploaded.file_name,
                aadhaarFileUrl: uploaded.file_url,
                aadhaarNumber: uploaded.document_number || primaryDocNumber,
                idVerificationStatus: "verified",
            });

            toast.success(`My Document (${file.name}) uploaded to Bunny Storage successfully!`);
        } catch (err: any) {
            console.error("[PrimaryUpload] Error:", err);
            const msg = err.response?.data?.detail || "Failed to upload document. Please try again.";
            toast.error(msg);
        } finally {
            setIsUploadingPrimary(false);
            if (primaryFileInputRef.current) {
                primaryFileInputRef.current.value = "";
            }
        }
    };

    // ── Member Document Upload Handler ───────────────────────────────────────
    const handleMemberUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLimitReached) {
            toast.error(`Maximum document upload limit of ${maxAllowed} reached.`);
            return;
        }

        if (!memberName.trim()) {
            toast.error("Please enter the full legal name of the member.");
            return;
        }

        if (!memberSelectedFile) {
            toast.error("Please choose a document file to upload.");
            return;
        }

        setIsUploadingMember(true);
        try {
            const formData = new FormData();
            formData.append("file", memberSelectedFile);
            formData.append("is_primary_guest", "false");
            formData.append("member_name", memberName.trim());
            formData.append("document_type", memberCategory);
            if (memberDocNumber.trim()) {
                formData.append("document_number", memberDocNumber.trim());
            }
            if (selectedBookingRef) {
                formData.append("booking_reference", selectedBookingRef);
            }

            const uploaded = await uploadGuestDocument(formData);

            const newDoc: GuestDocumentItem = {
                id: uploaded.id,
                isPrimaryGuest: false,
                memberName: uploaded.member_name,
                documentType: uploaded.document_type,
                documentTypeName: uploaded.document_type_name,
                documentNumber: uploaded.document_number || undefined,
                fileUrl: uploaded.file_url,
                fileName: uploaded.file_name,
                fileSize: uploaded.file_size,
                bookingReference: uploaded.booking_reference || undefined,
                verificationStatus: uploaded.verification_status,
                createdAt: uploaded.created_at,
            };

            // Update UI immediately without reload
            setDocuments((prev) => [...prev, newDoc]);
            setMemberName("");
            setMemberDocNumber("");
            setMemberSelectedFile(null);
            setIsAddingMember(false);

            toast.success(`Member document (${uploaded.file_name}) uploaded for ${uploaded.member_name}!`);
        } catch (err: any) {
            console.error("[MemberUpload] Error:", err);
            const msg = err.response?.data?.detail || "Failed to upload member document.";
            toast.error(msg);
        } finally {
            setIsUploadingMember(false);
            if (memberFileInputRef.current) {
                memberFileInputRef.current.value = "";
            }
        }
    };

    // ── Document Deletion Handler ────────────────────────────────────────────
    const handleDeleteDocument = async (doc: GuestDocumentItem) => {
        setDeletingDocId(doc.id);
        try {
            await deleteGuestDocument(doc.id);

            // Update state immediately
            setDocuments((prev) => prev.filter((d) => d.id !== doc.id));

            if (doc.isPrimaryGuest) {
                onUploadSuccess({
                    aadhaarFileUrl: undefined,
                    aadhaarFileName: undefined,
                    idVerificationStatus: "unverified",
                });
            }

            toast.success(`Document (${doc.fileName}) deleted and removed from Bunny Storage.`);
        } catch (err: any) {
            console.error("[DocDelete] Error:", err);
            toast.error("Failed to delete document. Please try again.");
        } finally {
            setDeletingDocId(null);
        }
    };

    // ── Document Sharing Authorization ───────────────────────────────────────
    const handleToggleSharePermission = async (checked: boolean) => {
        setIsTogglingShare(true);
        try {
            const res = await updateGuestProfile({ share_id_with_host: checked });
            onUploadSuccess({ shareIdWithHost: res.share_id_with_host ?? checked });
            toast.success(
                checked
                    ? "Authorization granted! Verified hosts of your confirmed bookings can verify your ID for fast check-in."
                    : "Sharing authorization revoked. Property owners will not see your documents."
            );
        } catch (err: any) {
            console.error("[ShareToggle] Error:", err);
            toast.error("Failed to update sharing preference.");
        } finally {
            setIsTogglingShare(false);
        }
    };

    const getCategoryDisplay = (type: string) => {
        const found = DOCUMENT_CATEGORIES.find((c) => c.value === type);
        return found ? found.label : "Government ID";
    };

    return (
        <div className="bg-card border border-border/70 rounded-lg p-5 sm:p-6 shadow-xs space-y-6">
            {/* Header & Limits Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold text-foreground tracking-tight">
                            Identity Verification & Guest Documents
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Upload identity proofs for yourself and travel members stored securely on Bunny CDN for fast, contactless check-in.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                        variant="outline"
                        className="text-xs font-semibold py-1 px-2.5 rounded-md border-border/80 bg-muted/30 gap-1.5"
                    >
                        <Users size={13} className="text-primary" />
                        <span>{totalUploadedCount} of {maxAllowed} slots used</span>
                        <span className="text-[11px] text-muted-foreground">({remainingSlots} remaining)</span>
                    </Badge>
                </div>
            </div>

            {/* Booking Association Selector (Optional filter) */}
            {bookings.length > 0 && (
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <CalendarCheck size={16} className="text-primary shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-foreground">Associate with Booking (Optional)</p>
                            <p className="text-[11px] text-muted-foreground">
                                Upload documents for a specific stay to automatically align occupancy document limits.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto">
                        <Select
                            value={selectedBookingRef}
                            onValueChange={(val) => setSelectedBookingRef(val === "all" ? "" : val)}
                        >
                            <SelectTrigger className="w-full sm:w-[230px] h-8 text-xs font-medium rounded-md bg-card border-border cursor-pointer">
                                <SelectValue placeholder="All Stays / General Profile" />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border-border bg-card shadow-lg z-50">
                                <SelectItem value="all" className="text-xs cursor-pointer">
                                    All Stays / General Profile
                                </SelectItem>
                                {bookings.map((b) => (
                                    <SelectItem key={b.id} value={b.bookingRef} className="text-xs cursor-pointer">
                                        <span className="font-medium truncate">{b.propertyName}</span>
                                        <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">({b.bookingRef})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SECTION A: MY DOCUMENT (PRIMARY GUEST)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                            <User size={14} />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">
                            My Document <span className="text-xs font-normal text-muted-foreground">(Primary Guest)</span>
                        </h3>
                    </div>
                    {primaryDocument && (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 text-[11px] font-semibold gap-1 rounded-md">
                            <CheckCircle2 size={12} /> Verified & Ready
                        </Badge>
                    )}
                </div>

                {primaryDocument ? (
                    <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:border-border">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <FileCheck2 size={20} />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs" title={primaryDocument.fileName}>
                                        {primaryDocument.fileName}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 rounded-sm bg-background border-border/80">
                                        {getCategoryDisplay(primaryDocument.documentType)}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    Holder: <strong className="text-foreground font-medium">{primaryDocument.memberName}</strong>
                                    {primaryDocument.documentNumber && (
                                        <span className="ml-1.5 font-mono text-[10px]">({primaryDocument.documentNumber})</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 rounded-md cursor-pointer hover:bg-muted font-medium"
                                onClick={() => setSelectedDocForView(primaryDocument)}
                            >
                                <Eye size={13} /> View
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={deletingDocId === primaryDocument.id || isUploadingPrimary}
                                className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive rounded-md cursor-pointer"
                                onClick={() => handleDeleteDocument(primaryDocument)}
                            >
                                {deletingDocId === primaryDocument.id ? (
                                    <Loader2 size={13} className="animate-spin text-destructive" />
                                ) : (
                                    <Trash2 size={13} />
                                )}
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="border border-border/70 rounded-lg p-4 bg-muted/10 space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="w-full sm:w-[180px]">
                                <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                    Document Category
                                </Label>
                                <Select value={primaryCategory} onValueChange={setPrimaryCategory}>
                                    <SelectTrigger className="h-9 text-xs rounded-md bg-card border-border cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-border bg-card z-50">
                                        {DOCUMENT_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value} className="text-xs cursor-pointer">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                    ID / Document Number (Optional)
                                </Label>
                                <Input
                                    value={primaryDocNumber}
                                    onChange={(e) => setPrimaryDocNumber(e.target.value)}
                                    placeholder="e.g. 1234 5678 9012 or Passport number"
                                    className="h-9 text-xs rounded-md border-muted-foreground/20 bg-card"
                                />
                            </div>
                        </div>

                        <div
                            onClick={() => !isUploadingPrimary && primaryFileInputRef.current?.click()}
                            className={`border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/20 hover:bg-muted/30 ${
                                isUploadingPrimary ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        >
                            <input
                                ref={primaryFileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                className="hidden"
                                onChange={handlePrimaryFileSelect}
                                disabled={isUploadingPrimary}
                            />
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                {isUploadingPrimary ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                            </div>
                            <p className="text-xs font-semibold text-foreground">
                                {isUploadingPrimary ? "Uploading document to Bunny Storage..." : "Click to upload My Document (Primary Guest)"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Original filename and extension will be preserved in Bunny CDN. PDF or Images up to 15MB.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION B: FRIEND / MEMBER DOCUMENTS
            ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Users size={14} />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">
                            Friend / Member Documents
                        </h3>
                    </div>

                    {!isAddingMember && (
                        <Button
                            type="button"
                            size="sm"
                            disabled={isLimitReached}
                            onClick={() => setIsAddingMember(true)}
                            className="h-8 text-xs font-semibold rounded-md gap-1.5 bg-[#312E81] hover:bg-[#252269] text-white cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            <UserPlus size={13} />
                            Add Friend / Member Document
                        </Button>
                    )}
                </div>

                {/* Uploaded Member Documents List */}
                {memberDocuments.length > 0 ? (
                    <div className="space-y-2.5">
                        {memberDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="p-3.5 rounded-lg bg-muted/30 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-border transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-xs" title={doc.fileName}>
                                                {doc.fileName}
                                            </p>
                                            <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 rounded-sm bg-background border-border/80">
                                                {getCategoryDisplay(doc.documentType)}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            Member: <strong className="text-foreground font-medium">{doc.memberName}</strong>
                                            {doc.documentNumber && (
                                                <span className="ml-1.5 font-mono text-[10px]">({doc.documentNumber})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 rounded-md cursor-pointer hover:bg-muted font-medium"
                                        onClick={() => setSelectedDocForView(doc)}
                                    >
                                        <Eye size={13} /> View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={deletingDocId === doc.id}
                                        className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive rounded-md cursor-pointer"
                                        onClick={() => handleDeleteDocument(doc)}
                                    >
                                        {deletingDocId === doc.id ? (
                                            <Loader2 size={13} className="animate-spin text-destructive" />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 rounded-lg border border-dashed border-border/70 text-center bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            No additional member documents uploaded yet.
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                            Traveling with family or friends? Use "Add Friend / Member Document" to upload their ID proofs for the stay.
                        </p>
                    </div>
                )}

                {/* Inline Add Member Document Form */}
                {isAddingMember && (
                    <form
                        onSubmit={handleMemberUploadSubmit}
                        className="p-4 rounded-lg border border-border/80 bg-card shadow-xs space-y-4 animate-in fade-in duration-200"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <UserPlus size={14} className="text-primary" />
                                Upload Friend / Member Document
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddingMember(false);
                                    setMemberSelectedFile(null);
                                }}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="member_name" className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                    Member Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="member_name"
                                    required
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="h-9 text-xs rounded-md bg-muted/20 border-border"
                                />
                            </div>

                            <div>
                                <Label htmlFor="member_category" className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                    Document Category
                                </Label>
                                <Select value={memberCategory} onValueChange={setMemberCategory}>
                                    <SelectTrigger id="member_category" className="h-9 text-xs rounded-md bg-muted/20 border-border cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-border bg-card z-50">
                                        {DOCUMENT_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value} className="text-xs cursor-pointer">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="member_doc_number" className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                    ID / Document Number
                                </Label>
                                <Input
                                    id="member_doc_number"
                                    value={memberDocNumber}
                                    onChange={(e) => setMemberDocNumber(e.target.value)}
                                    placeholder="Optional document number"
                                    className="h-9 text-xs rounded-md bg-muted/20 border-border"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                Member Document File (PDF, JPG, PNG, WebP up to 15MB) <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => memberFileInputRef.current?.click()}
                                    className="h-9 text-xs rounded-md cursor-pointer border-border shrink-0"
                                >
                                    <UploadCloud size={14} className="mr-1.5 text-primary" />
                                    Choose Document File
                                </Button>
                                <span className="text-xs text-muted-foreground truncate">
                                    {memberSelectedFile ? (
                                        <strong className="text-foreground">{memberSelectedFile.name}</strong>
                                    ) : (
                                        "No file chosen yet"
                                    )}
                                </span>
                                <input
                                    ref={memberFileInputRef}
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                                    className="hidden"
                                    onChange={(e) => setMemberSelectedFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsAddingMember(false);
                                    setMemberSelectedFile(null);
                                }}
                                className="h-8 text-xs rounded-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isUploadingMember || !memberSelectedFile || !memberName.trim()}
                                className="h-8 text-xs font-semibold rounded-md bg-[#312E81] hover:bg-[#252269] text-white cursor-pointer shadow-xs"
                            >
                                {isUploadingMember ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin mr-1.5" />
                                        Uploading to Bunny CDN...
                                    </>
                                ) : (
                                    "Save Member Document"
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {isLimitReached && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 pt-1">
                        <AlertCircle size={13} />
                        Maximum document limit reached ({maxAllowed} documents). To upload another, remove an existing document first.
                    </p>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION C: AUTHORIZATION & PERMISSIONS TOGGLE
            ══════════════════════════════════════════════════════════════════ */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-primary" />
                            <h4 className="text-xs font-bold text-foreground">
                                Self-Authorized Check-in Sharing
                            </h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Authorizes property owners of your confirmed bookings to verify these uploaded documents for instant check-in.
                            You can revoke access anytime.
                        </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                        <Button
                            type="button"
                            variant={profile.shareIdWithHost ? "default" : "outline"}
                            size="sm"
                            disabled={isTogglingShare || !primaryDocument}
                            onClick={() => {
                                if (!primaryDocument) {
                                    toast.error("Please upload your document first before authorizing sharing.");
                                    return;
                                }
                                if (!profile.shareIdWithHost) {
                                    setIsConfirmModalOpen(true);
                                } else {
                                    handleToggleSharePermission(false);
                                }
                            }}
                            className={`h-8 text-xs font-semibold rounded-md px-3 cursor-pointer transition-colors ${
                                profile.shareIdWithHost ? "bg-[#312E81] hover:bg-[#252269] text-white" : ""
                            }`}
                        >
                            {isTogglingShare ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : profile.shareIdWithHost ? (
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} /> Authorized
                                </span>
                            ) : (
                                "Disabled"
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                CONFIRMATION DIALOG FOR SHARING
            ══════════════════════════════════════════════════════════════════ */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-[430px] rounded-lg p-6 border border-border/80 shadow-2xl bg-card">
                    <DialogHeader className="space-y-2">
                        <div className="w-9 h-9 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                            Authorize Document Sharing?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            By confirming, you authorize Hostel In to securely share your uploaded identity documents with the verified hosts/managers of your bookings for contactless check-in.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:justify-end pt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isTogglingShare}
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="text-xs font-semibold h-8 rounded-md"
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
                            className="text-xs font-semibold h-8 rounded-md bg-[#312E81] hover:bg-[#252269] text-white gap-1.5"
                        >
                            {isTogglingShare ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Authorize & Share
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════════════════════════════
                DOCUMENT VIEWER DIALOG (PRESERVES ACTUAL FILENAME & DOWNLOAD)
            ══════════════════════════════════════════════════════════════════ */}
            <Dialog open={!!selectedDocForView} onOpenChange={(open) => !open && setSelectedDocForView(null)}>
                <DialogContent className="max-w-3xl w-full max-h-[90vh] rounded-lg p-0 overflow-hidden border border-border bg-background shadow-2xl flex flex-col">
                    <DialogHeader className="p-3.5 px-5 border-b border-border bg-muted/30 flex flex-row items-center justify-between gap-3 space-y-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileCheck2 className="w-4 h-4 text-primary shrink-0" />
                            <div className="min-w-0">
                                <DialogTitle className="text-sm font-bold text-foreground truncate" title={selectedDocForView?.fileName}>
                                    {selectedDocForView?.fileName || "Uploaded Document"}
                                </DialogTitle>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {selectedDocForView?.memberName} • {selectedDocForView ? getCategoryDisplay(selectedDocForView.documentType) : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedDocForView?.fileUrl && (
                                <a
                                    href={selectedDocForView.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={selectedDocForView.fileName}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 rounded-md bg-primary/10"
                                >
                                    <Download size={12} />
                                    <span>Download</span>
                                </a>
                            )}
                            <Badge variant="outline" className="text-[10px] font-medium border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 gap-1 rounded-md py-0.5 px-2 select-none">
                                <Lock size={10} /> Encrypted
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDocForView(null)}
                                className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 p-4 bg-muted/10 overflow-auto flex items-center justify-center min-h-[450px]">
                        {selectedDocForView?.fileUrl ? (
                            selectedDocForView.fileName.toLowerCase().endsWith(".pdf") || selectedDocForView.fileUrl.toLowerCase().includes(".pdf") ? (
                                <iframe
                                    src={`${selectedDocForView.fileUrl}#toolbar=0`}
                                    title={selectedDocForView.fileName}
                                    className="w-full h-[65vh] rounded-md border border-border/60 bg-white"
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={selectedDocForView.fileUrl}
                                    alt={selectedDocForView.fileName}
                                    className="max-h-[65vh] max-w-full object-contain rounded-md border border-border/60 shadow-sm"
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
