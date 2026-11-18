"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyDocuments } from "@/services/document-verification.service";
import { DocumentUploadDropzone } from "./document-upload-dropzone";
import { DocumentList } from "./document-list";
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyDocumentsClient() {
    const queryClient = useQueryClient();

    const {
        data: verification,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["myDocuments"],
        queryFn: getMyDocuments,
        refetchOnWindowFocus: true,
    });

    const isVerified = verification?.status === "verified";
    const isPending = verification?.status === "pending";
    const isRejected = verification?.status === "rejected";
    const isUnverified = !verification || verification.status === "unverified";

    const remainingSlots = verification ? verification.remaining_slots : 5;
    const uploadedCount = verification ? verification.uploaded_count : 0;
    const documents = verification?.documents || [];

    return (
        <div className="space-y-5 w-full pb-12">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-slate-800 h-8 px-2 gap-1.5 transition-colors rounded-sm"
                    >
                        <Link href="/dashboard">
                            <ArrowLeft size={14} />
                            <span>Dashboard</span>
                        </Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-xs font-bold text-foreground">My Documents</span>
                </div>

                {/* Status Indicator Pill */}
                <div>
                    {isVerified && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 text-xs font-bold shadow-xs">
                            <ShieldCheck size={14} />
                            <span>Verified Owner</span>
                        </div>
                    )}
                    {isPending && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 text-xs font-bold shadow-xs">
                            <Clock size={14} />
                            <span>Under Review</span>
                        </div>
                    )}
                    {(isUnverified || isRejected) && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-muted text-foreground border border-border dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs">
                            <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
                            <span>Unverified</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Status Hero Banner - Rectangular with Minimal Soft Corners */}
            <div
                className={`rounded-md p-4 sm:p-5 border transition-all ${
                    isVerified
                        ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 shadow-xs"
                        : isPending
                        ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50/40 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-slate-900 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-100 shadow-xs"
                        : isRejected
                        ? "bg-gradient-to-r from-red-50 via-orange-50 to-red-50/40 dark:from-red-950/40 dark:via-orange-950/20 dark:to-slate-900 border-red-200 dark:border-red-800/60 text-red-950 dark:text-red-100 shadow-xs"
                        : "bg-card border-border dark:bg-slate-900/80 dark:border-slate-800 text-card-foreground dark:text-slate-100 shadow-xs"
                }`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {isVerified ? (
                                <ShieldCheck size={22} className="text-emerald-600 dark:text-emerald-400" />
                            ) : isPending ? (
                                <Clock size={22} className="text-amber-600 dark:text-amber-400" />
                            ) : (
                                <ShieldAlert size={22} className="text-amber-600 dark:text-amber-400" />
                            )}
                            <h2 className="text-sm sm:text-base font-bold">
                                {isVerified
                                    ? "Official Property Owner Verification: Verified"
                                    : isPending
                                    ? "Documents Under Review by Super Admin"
                                    : isRejected
                                    ? "Verification Incomplete - Review Notes"
                                    : "Owner Verification Pending"}
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 max-w-3xl leading-relaxed">
                            {isVerified
                                ? "All submitted property and identity documents have been approved by the Super Admin team. Your listings carry a verified badge."
                                : isPending
                                ? "Your documents have been submitted and are currently in the Super Admin verification queue. Verification usually takes less than 24 hours."
                                : isRejected
                                ? "One or more documents require your attention. Please check the reviewer notes below and upload replacement documents."
                                : "Upload up to 5 verified ownership or identity documents (max 5MB each). Once approved by Super Admin, your account status will show Verified."}
                        </p>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="flex items-center gap-3 shrink-0 bg-muted/60 dark:bg-slate-800/80 border border-border dark:border-slate-700 rounded-sm px-3.5 py-2 shadow-xs">
                        <div className="text-center">
                            <span className="block text-xs font-bold text-foreground dark:text-slate-100">{uploadedCount} / 5</span>
                            <span className="block text-[10px] text-muted-foreground dark:text-slate-400">Uploaded</span>
                        </div>
                        <div className="w-px h-6 bg-border dark:bg-slate-700" />
                        <div className="text-center">
                            <span className="block text-xs font-bold text-foreground dark:text-slate-100">{remainingSlots}</span>
                            <span className="block text-[10px] text-muted-foreground dark:text-slate-400">Slots Left</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-16 text-center space-y-3">
                    <Loader2 size={28} className="animate-spin text-primary dark:text-indigo-400 mx-auto" />
                    <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Loading document verification profile...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-6 text-center text-red-900 dark:text-red-200 space-y-2">
                    <AlertCircle size={24} className="mx-auto text-red-600 dark:text-red-400" />
                    <p className="text-xs font-bold">Unable to load document verification</p>
                    <p className="text-[11px] text-red-700 dark:text-red-300 max-w-md mx-auto">
                        {(error as any)?.message || "Please check your network connection or sign in again."}
                    </p>
                    <Button
                        size="sm"
                        onClick={() => refetch()}
                        className="h-8 text-xs bg-primary text-primary-foreground dark:bg-slate-800 dark:text-slate-100 rounded-sm"
                    >
                        Try Again
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Document Upload Zone */}
                    <DocumentUploadDropzone
                        remainingSlots={remainingSlots}
                        allowedTypes={verification?.allowed_document_types}
                        onSuccess={() => {
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                        }}
                    />

                    {/* Uploaded Documents List */}
                    <DocumentList
                        documents={documents}
                        onRefresh={() => {
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
