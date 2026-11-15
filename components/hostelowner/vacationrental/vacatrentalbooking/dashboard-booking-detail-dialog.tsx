"use client";

import { useState } from "react";
import type { VacationRentalBooking } from "@/types/vacationrental.types";
import {
    Palmtree,
    User,
    Receipt,
    AlertCircle,
    X,
    Check,
    Ban,
    ShieldCheck,
    FileCheck2,
    ExternalLink,
    Lock,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getStatusVariant, formatDate, formatCurrency } from "./dashboard-types";
import type { UseMutationResult } from "@tanstack/react-query";

interface DashboardBookingDetailDialogProps {
    selectedBooking: VacationRentalBooking | null;
    setSelectedBooking: (b: VacationRentalBooking | null) => void;
    perspective: "guest" | "host";
    setIsCancelModalOpen: (open: boolean) => void;
    setIsDeclineModalOpen: (open: boolean) => void;
    approveMutation: UseMutationResult<VacationRentalBooking, any, string, unknown>;
}

export function DashboardBookingDetailDialog({
    selectedBooking,
    setSelectedBooking,
    perspective,
    setIsCancelModalOpen,
    setIsDeclineModalOpen,
    approveMutation,
}: DashboardBookingDetailDialogProps) {
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

    return (
        <>
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg sm:rounded-lg border border-border/80 shadow-2xl p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]">
                {selectedBooking && (
                    <>
                        <DialogHeader className="border-b pb-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="text-lg font-bold tracking-tight">
                                            Reservation Details #{selectedBooking.booking_reference}
                                        </DialogTitle>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusVariant(selectedBooking.status).textClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusVariant(selectedBooking.status).dotClass}`} />
                                            {getStatusVariant(selectedBooking.status).label}
                                        </span>
                                    </div>
                                    <DialogDescription className="text-xs">
                                        Reserved on {formatDate(selectedBooking.created_at)}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-5 py-2">
                            {/* Property & Schedule Info */}
                            <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Palmtree size={16} className="text-rose-500" />
                                            {selectedBooking.rental_title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">Entire Vacation Home / Villa</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs rounded-md">
                                        {selectedBooking.number_of_nights} Night Stay
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">Check-In</span>
                                        <span className="font-semibold text-foreground">{formatDate(selectedBooking.check_in_date)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">Check-Out</span>
                                        <span className="font-semibold text-foreground">{formatDate(selectedBooking.check_out_date)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">Headcount</span>
                                        <span className="font-semibold text-foreground">{selectedBooking.guest_details?.total_guests || 1} Total Guest(s)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Information */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <User size={13} /> Guest Breakdown
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg border border-border/50 bg-card text-xs">
                                    <div>
                                        <span className="text-muted-foreground text-[10px] block">Primary Guest</span>
                                        <span className="font-medium text-foreground">{selectedBooking.guest_details?.guest_name || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-[10px] block">Contact Mobile</span>
                                        <span className="font-medium text-foreground">{selectedBooking.guest_details?.mobile_number || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-[10px] block">Email Address</span>
                                        <span className="font-medium text-foreground truncate block">{selectedBooking.guest_details?.guest_email || "N/A"}</span>
                                    </div>
                                    <div className="col-span-full pt-2 border-t border-border/40 flex items-center gap-4 text-muted-foreground text-[11px]">
                                        <span>Adults: {selectedBooking.guest_details?.adults || 1}</span>
                                        <span>Children: {selectedBooking.guest_details?.children || 0}</span>
                                        <span>Infants: {selectedBooking.guest_details?.infants || 0}</span>
                                        <span>Pets: {selectedBooking.guest_details?.pets || 0}</span>
                                    </div>
                                    {selectedBooking.guest_details?.special_requests && (
                                        <div className="col-span-full pt-2 border-t border-border/40">
                                            <span className="text-muted-foreground text-[10px] block">Special Guest Note</span>
                                            <p className="text-xs text-foreground italic mt-0.5">
                                                &quot;{selectedBooking.guest_details.special_requests}&quot;
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Guest Identity Verification / Aadhaar Card */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" /> Identity Verification (Aadhaar Card)
                                    </h4>
                                    {selectedBooking.guest_id_document?.is_shared ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 gap-1 text-[10px] font-medium">
                                            <Check size={11} /> Authorized by Guest
                                        </Badge>
                                    ) : selectedBooking.guest_id_document?.has_document ? (
                                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 gap-1 text-[10px] font-medium">
                                            <Lock size={10} /> Consent Not Granted
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px]">
                                            Not Uploaded
                                        </Badge>
                                    )}
                                </div>

                                <div className="p-3.5 rounded-lg border border-border/50 bg-card text-xs space-y-2.5">
                                    {selectedBooking.guest_id_document?.is_shared ? (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-md border border-emerald-200/60 dark:border-emerald-900/50">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                                    <FileCheck2 size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                                                        <span>Aadhaar Document:</span>
                                                        <span className="font-mono text-emerald-800 dark:text-emerald-200">
                                                            {selectedBooking.guest_id_document.aadhaar_number || "Verified on file"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        {selectedBooking.guest_id_document.file_name || "Guest_Aadhaar_Proof"} &bull; Instant Check-in Verified
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedBooking.guest_id_document.file_url && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs gap-1.5 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 shrink-0 cursor-pointer"
                                                    onClick={() => setPreviewDoc({
                                                        url: selectedBooking.guest_id_document!.file_url!,
                                                        name: selectedBooking.guest_id_document!.file_name || "Guest_Aadhaar_Document"
                                                    })}
                                                >
                                                    <Eye size={13} /> View Aadhaar <ExternalLink size={11} />
                                                </Button>
                                            )}
                                        </div>
                                    ) : selectedBooking.guest_id_document?.has_document ? (
                                        <div className="flex items-center gap-2 text-muted-foreground text-[11px] py-1">
                                            <Lock size={13} className="text-amber-500 shrink-0" />
                                            <span>The guest has uploaded their government ID, but has not granted authorization to share the document copy.</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground text-[11px] py-1">
                                            <AlertCircle size={13} className="text-muted-foreground shrink-0" />
                                            <span>No government ID uploaded by guest yet. Physical ID verification may be requested at check-in.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Receipt size={13} /> Pricing Breakdown
                                </h4>
                                <div className="p-4 rounded-lg border border-border/50 bg-card space-y-2.5 text-xs">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Nightly Base Rate × {selectedBooking.number_of_nights} Night(s)</span>
                                        <span className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(selectedBooking.pricing_details?.stay_subtotal || selectedBooking.total_price)}
                                        </span>
                                    </div>
                                    {selectedBooking.pricing_details?.cleaning_fee && parseFloat(selectedBooking.pricing_details.cleaning_fee) > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Cleaning Fee</span>
                                            <span className="font-medium text-foreground tabular-nums">{formatCurrency(selectedBooking.pricing_details.cleaning_fee)}</span>
                                        </div>
                                    )}
                                    {selectedBooking.pricing_details?.service_fee && parseFloat(selectedBooking.pricing_details.service_fee) > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Platform & Host Service Fee</span>
                                            <span className="font-medium text-foreground tabular-nums">{formatCurrency(selectedBooking.pricing_details.service_fee)}</span>
                                        </div>
                                    )}
                                    {selectedBooking.pricing_details?.discount_amount && parseFloat(selectedBooking.pricing_details.discount_amount) > 0 && (
                                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                            <span>Weekly/Monthly Stay Discount</span>
                                            <span className="font-medium tabular-nums">-{formatCurrency(selectedBooking.pricing_details.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="pt-2.5 border-t border-border/50 flex justify-between items-center text-sm font-bold">
                                        <span>Total Reservation Price</span>
                                        <span className="text-base text-foreground tabular-nums">{formatCurrency(selectedBooking.total_price)}</span>
                                    </div>
                                    <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>Method: {selectedBooking.pricing_details?.payment_method_display || "Online"}</span>
                                        <span className="capitalize">Payment Status: {selectedBooking.pricing_details?.payment_status_display || "Pending"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Record */}
                            {selectedBooking.cancellation_details && (
                                <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5 text-xs text-rose-800 dark:text-rose-200">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <AlertCircle size={14} />
                                        <span>Stay Cancelled or Declined</span>
                                    </div>
                                    <p className="text-[11px]">Reason: {selectedBooking.cancellation_details.reason}</p>
                                    <p className="text-[10px] opacity-80">
                                        Cancelled at: {formatDate(selectedBooking.cancellation_details.cancelled_at)} • Refund:{" "}
                                        {formatCurrency(selectedBooking.cancellation_details.refund_amount)} ({selectedBooking.cancellation_details.refund_status_display})
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="border-t pt-3 flex items-center justify-between">
                            {perspective === "host" && selectedBooking.status === "pending_approval" ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                        disabled={approveMutation.isPending}
                                        onClick={() => approveMutation.mutate(selectedBooking.id)}
                                    >
                                        <Check size={13} />
                                        {approveMutation.isPending ? "Approving..." : "Approve Reservation"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="text-xs gap-1"
                                        onClick={() => setIsDeclineModalOpen(true)}
                                    >
                                        <X size={13} /> Decline
                                    </Button>
                                </div>
                            ) : selectedBooking.status !== "cancelled" &&
                                selectedBooking.status !== "declined" &&
                                selectedBooking.status !== "completed" ? (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs gap-1.5"
                                    onClick={() => setIsCancelModalOpen(true)}
                                >
                                    <Ban size={13} /> Cancel Reservation
                                </Button>
                            ) : (
                                <div />
                            )}
                            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)} className="text-xs">
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>

        {/* In-App Document Viewer Dialog */}
        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
            <DialogContent className="max-w-4xl w-[94vw] h-[88vh] flex flex-col p-0 rounded-sm border border-border/80 shadow-2xl bg-card overflow-hidden">
                <DialogHeader className="px-5 py-3.5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <FileCheck2 size={16} />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-semibold text-foreground tracking-tight">
                                {previewDoc?.name || "Guest Identity Document"}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] text-muted-foreground">
                                In-App Document Viewer • Authorized Guest Aadhaar
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-medium border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 gap-1 rounded-sm py-0.5 px-2 select-none">
                            <Lock size={10} /> View-Only • Privacy Protected
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewDoc(null)}
                            className="h-8 w-8 p-0 rounded-sm text-muted-foreground hover:text-foreground"
                        >
                            <X size={15} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-zinc-950/5 relative overflow-hidden flex items-center justify-center p-3">
                    {previewDoc && (
                        previewDoc.url.toLowerCase().endsWith(".pdf") ? (
                            <iframe
                                src={`${previewDoc.url}#toolbar=0`}
                                className="w-full h-full rounded-sm border border-border/50 bg-white"
                                title="Guest Document Preview"
                            />
                        ) : (
                            <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewDoc.url}
                                    alt="Aadhaar Document"
                                    className="max-w-full max-h-[75vh] object-contain rounded-sm border border-border/50 shadow-md bg-white"
                                />
                            </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}

