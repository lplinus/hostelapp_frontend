"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ExternalLink,
    Loader2,
    Lock,
    Eye,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteVerificationDocument } from "@/services/document-verification.service";
import type { VerificationDocumentItem } from "@/types/document-verification.types";

interface DocumentListProps {
    documents: VerificationDocumentItem[];
    onRefresh: () => void;
}

function formatRemainingSeconds(seconds: number): string {
    if (seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
        return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    }
    return `${secs}s`;
}

export function DocumentList({ documents, onRefresh }: DocumentListProps) {
    const [now, setNow] = useState<number>(() => Date.now());

    // In-application Preview Modal State
    const [previewDoc, setPreviewDoc] = useState<VerificationDocumentItem | null>(null);

    // In-application Remove Confirmation Modal State
    const [docToDelete, setDocToDelete] = useState<VerificationDocumentItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 1-second interval to update remaining cooldown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmDelete = async () => {
        if (!docToDelete) return;

        setIsDeleting(true);
        try {
            await deleteVerificationDocument(docToDelete.id);
            toast.success("Document removed and purged from Bunny CDN.");
            setDocToDelete(null);
            onRefresh();
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || "Failed to delete document.";
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const isPdfDocument = (doc: VerificationDocumentItem): boolean => {
        const fileUrl = doc.file_url || doc.file || "";
        return fileUrl.toLowerCase().includes(".pdf");
    };

    if (!documents || documents.length === 0) {
        return (
            <div className="bg-card dark:bg-slate-900/80 border border-border dark:border-slate-800 rounded-md p-8 text-center space-y-2 w-full">
                <div className="w-12 h-12 rounded-sm bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 flex items-center justify-center mx-auto text-muted-foreground dark:text-slate-400">
                    <FileText size={22} />
                </div>
                <h4 className="text-sm font-bold text-foreground">No Documents Uploaded Yet</h4>
                <p className="text-xs text-muted-foreground dark:text-slate-400 max-w-sm mx-auto">
                    Upload your property ownership documents, trade license, or government ID using the form above to initiate your verification.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                    Uploaded Documents ({documents.length} of 5)
                </h3>
                <span className="text-xs text-muted-foreground dark:text-slate-400">
                    {documents.filter((d) => d.status === "verified").length} Verified •{" "}
                    {documents.filter((d) => d.status === "pending").length} Under Review
                </span>
            </div>

            {/* Rectangular Cards with Minimal Soft Corners - Full Width Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 w-full">
                {documents.map((doc) => {
                    const isVerified = doc.status === "verified";
                    const isPending = doc.status === "pending";
                    const isRejected = doc.status === "rejected";

                    // Dynamic cooldown calculation based on created_at (10 minutes = 600 seconds)
                    const createdAtMs = new Date(doc.created_at).getTime();
                    const elapsedSeconds = Math.floor((now - createdAtMs) / 1000);
                    const remainingSeconds = Math.max(0, 600 - elapsedSeconds);
                    const isWithinCooldown = remainingSeconds > 0;
                    const canDelete = isRejected || (isPending && isWithinCooldown);

                    return (
                        <div
                            key={doc.id}
                            className={`p-4 rounded-md border transition-all ${
                                isVerified
                                    ? "bg-card dark:bg-slate-900/80 border-border dark:border-slate-800 shadow-xs"
                                    : isRejected
                                    ? "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                                    : "bg-card dark:bg-slate-900/80 border-border dark:border-slate-800 shadow-xs"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div
                                        className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${
                                            isVerified
                                                ? "bg-emerald-100/60 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                                                : isRejected
                                                ? "bg-red-100/60 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
                                                : "bg-muted dark:bg-slate-800 border-border dark:border-slate-700 text-foreground dark:text-slate-200"
                                        }`}
                                    >
                                        <FileText size={20} />
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                                                {doc.title}
                                            </h4>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 text-muted-foreground dark:text-slate-300">
                                                {doc.document_type_display}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-muted-foreground dark:text-slate-400 flex items-center gap-2">
                                            <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                                            <span>•</span>
                                            <span>
                                                {new Date(doc.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Status Chip */}
                                <div>
                                    {isVerified && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 size={11} /> Verified
                                        </span>
                                    )}
                                    {isPending && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                            <Clock size={11} /> Under Review
                                        </span>
                                    )}
                                    {isRejected && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                                            <AlertTriangle size={11} /> Rejected
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Note Alert */}
                            {isRejected && doc.rejection_reason && (
                                <div className="mt-3 p-2.5 rounded-sm bg-red-100/60 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200 space-y-0.5">
                                    <span className="font-bold text-[11px] block">Reviewer Feedback:</span>
                                    <p className="text-[11px] leading-relaxed">{doc.rejection_reason}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-3.5 pt-3 border-t border-border/70 dark:border-slate-800 flex items-center justify-between">
                                {/* In-App View Button */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewDoc(doc)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary dark:hover:text-indigo-400 hover:underline transition-colors cursor-pointer"
                                >
                                    <Eye size={13} className="text-primary dark:text-indigo-400" />
                                    <span>View Document</span>
                                </button>

                                {canDelete ? (
                                    <div className="flex items-center gap-2">
                                        {isPending && isWithinCooldown && (
                                            <span className="text-[10px] text-muted-foreground dark:text-slate-400 flex items-center gap-1 font-mono">
                                                <Clock size={10} />
                                                {formatRemainingSeconds(remainingSeconds)}
                                            </span>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDocToDelete(doc)}
                                            className="h-8 px-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-100/60 dark:hover:bg-red-950/40 rounded-sm gap-1 cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                            <span>Remove</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-muted-foreground dark:text-slate-400 flex items-center gap-1 font-medium bg-muted/40 dark:bg-slate-800/60 px-2.5 py-1 rounded-sm border border-border/60 dark:border-slate-700">
                                        <Lock size={11} className="text-muted-foreground" />
                                        {isVerified ? "Verified (Locked)" : "Locked (10m window ended)"}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 1. IN-APPLICATION DOCUMENT PREVIEW MODAL - Minimal Soft Corners */}
            <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent
                    className="sm:max-w-4xl max-w-[95vw] w-full max-h-[92vh] rounded-md p-4 sm:p-5 flex flex-col gap-3 shadow-2xl border border-border"
                    style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                >
                    <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/80 pr-8">
                        <div className="space-y-0.5 text-left min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <DialogTitle className="text-sm sm:text-base font-bold truncate max-w-md">
                                    {previewDoc?.title}
                                </DialogTitle>
                                {previewDoc?.document_type_display && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-muted dark:bg-slate-800 border border-border text-muted-foreground">
                                        {previewDoc.document_type_display}
                                    </span>
                                )}
                            </div>
                            <DialogDescription className="text-[11px] text-muted-foreground">
                                {previewDoc && `${(previewDoc.file_size / (1024 * 1024)).toFixed(2)} MB • Hosted securely on Bunny CDN`}
                            </DialogDescription>
                        </div>

                        {previewDoc && (
                            <a
                                href={previewDoc.file_url || previewDoc.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors shrink-0"
                                title="Open in new browser tab"
                            >
                                <ExternalLink size={13} />
                                <span className="hidden sm:inline">New Tab</span>
                            </a>
                        )}
                    </DialogHeader>

                    {/* Smooth Document Rendering Area - Less Soft Corners */}
                    <div className="flex-1 w-full min-h-[50vh] max-h-[70vh] rounded-sm overflow-hidden bg-muted/20 dark:bg-slate-950/80 border border-border flex items-center justify-center">
                        {previewDoc && isPdfDocument(previewDoc) ? (
                            <iframe
                                src={`${previewDoc.file_url || previewDoc.file}#toolbar=1`}
                                className="w-full h-[68vh] rounded-sm border-0"
                                title={previewDoc.title}
                            />
                        ) : previewDoc ? (
                            <div className="w-full h-[68vh] overflow-auto flex items-center justify-center p-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewDoc.file_url || previewDoc.file}
                                    alt={previewDoc.title}
                                    className="max-h-full max-w-full object-contain rounded-sm shadow-xs"
                                />
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter className="flex items-center justify-between pt-2 border-t border-border/80 sm:justify-between">
                        <span className="text-[11px] text-muted-foreground">
                            Status: <strong className="text-foreground capitalize">{previewDoc?.status}</strong>
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewDoc(null)}
                            className="h-8 px-4 text-xs font-semibold rounded-sm border-border"
                        >
                            Close Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. IN-APPLICATION DELETE CONFIRMATION MODAL - Minimal Soft Corners */}
            <Dialog open={Boolean(docToDelete)} onOpenChange={(open) => !open && !isDeleting && setDocToDelete(null)}>
                <DialogContent
                    className="sm:max-w-md max-w-[92vw] w-full rounded-md p-5 gap-4 shadow-2xl border border-border"
                    style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                >
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-sm bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="space-y-1 text-left min-w-0">
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Remove Document?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                Are you sure you want to remove <strong className="text-foreground">"{docToDelete?.title}"</strong>? The file will be permanently purged from Bunny CDN storage.
                            </DialogDescription>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-end pt-2 border-t border-border/80">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setDocToDelete(null)}
                            className="h-9 px-4 text-xs font-semibold rounded-sm border-border"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={handleConfirmDelete}
                            className="h-9 px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-sm gap-1.5"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={13} />
                                    Confirm Remove
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
