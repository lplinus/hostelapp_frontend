"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Building2,
    User,
    Phone,
    Receipt,
    Check,
    ShieldCheck,
    FileCheck2,
    ExternalLink,
    Lock,
    AlertCircle,
    Eye,
    X,
} from "lucide-react";
import { type Booking } from "@/services/booking.service";
import {
    formatDate,
    formatCurrency,
    formatRoomCategory,
    getDurationNights,
    getStatusMeta,
} from "./hostel-booking-utils";

interface HostelBookingDetailModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onCheckIn: (bookingId: string) => void;
    isCheckingIn: boolean;
}

export default function HostelBookingDetailModal({
    booking,
    isOpen,
    onClose,
    onCheckIn,
    isCheckingIn,
}: HostelBookingDetailModalProps) {
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

    if (!booking) return null;

    const statusMeta = getStatusMeta(booking.status);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg sm:rounded-lg border border-border/80 shadow-2xl p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-lg font-bold tracking-tight">
                                    Reservation Details #STN-{booking.id.substring(0, 8).toUpperCase()}
                                </DialogTitle>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.badgeClass}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                    {statusMeta.label}
                                </span>
                            </div>
                            <DialogDescription className="text-xs">
                                {booking.created_at
                                    ? `Booked on ${formatDate(booking.created_at)}`
                                    : "Hostel Reservation"}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Hostel & Stay Info */}
                    <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" />
                                    {booking.hostel_name || `Hostel Property #${booking.hostel}`}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Room Category: {formatRoomCategory(booking.room_category, booking.room_type)}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-xs rounded-md uppercase font-semibold"
                            >
                                {booking.booking_type}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs">
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                    Check-In Date
                                </span>
                                <span className="font-semibold text-foreground">
                                    {formatDate(booking.check_in)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                    Check-Out Date
                                </span>
                                <span className="font-semibold text-foreground">
                                    {formatDate(booking.check_out)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                    Stay Duration
                                </span>
                                <span className="font-semibold text-foreground">
                                    {getDurationNights(booking.check_in, booking.check_out) || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Guest Information */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <User size={13} />
                            Guest Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg border border-border/50 bg-card text-xs">
                            <div>
                                <span className="text-muted-foreground text-[10px] block">
                                    Primary Guest
                                </span>
                                <span className="font-medium text-foreground capitalize">
                                    {booking.guest_name || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] block">
                                    Contact Phone
                                </span>
                                <a
                                    href={`tel:${booking.mobile_number}`}
                                    className="font-medium text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                    <Phone size={11} />
                                    {booking.mobile_number || "N/A"}
                                </a>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] block">
                                    Email Address
                                </span>
                                <a
                                    href={`mailto:${booking.guest_email}`}
                                    className="font-medium text-foreground truncate block hover:text-primary"
                                >
                                    {booking.guest_email || "N/A"}
                                </a>
                            </div>

                            <div className="col-span-full pt-2 border-t border-border/40 flex items-center gap-4 text-muted-foreground text-[11px]">
                                <span>Age: {booking.guest_age || "N/A"} yrs</span>
                                <span>Adults: {booking.adults || 1}</span>
                                <span>Children: {booking.children || 0}</span>
                                <span>Total Headcount: {booking.guests_count || 1}</span>
                            </div>
                        </div>
                    </div>

                    {/* Guest Identity Verification / Aadhaar Card */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                                Identity Verification (Aadhaar Card)
                            </h4>
                            {booking.guest_id_document?.is_shared ? (
                                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 gap-1 text-[10px] font-medium">
                                    <Check size={11} /> Authorized by Guest
                                </Badge>
                            ) : booking.guest_id_document?.has_document ? (
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
                            {booking.guest_id_document?.is_shared ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-md border border-emerald-200/60 dark:border-emerald-900/50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                            <FileCheck2 size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                                                <span>Aadhaar Document:</span>
                                                <span className="font-mono text-emerald-800 dark:text-emerald-200">
                                                    {booking.guest_id_document.aadhaar_number || "Verified on file"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {booking.guest_id_document.file_name || "Guest_Aadhaar_Proof"} &bull; Instant Check-in Verified
                                            </p>
                                        </div>
                                    </div>
                                    {booking.guest_id_document.file_url && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs gap-1.5 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 shrink-0 cursor-pointer"
                                            onClick={() => setPreviewDoc({
                                                url: booking.guest_id_document!.file_url!,
                                                name: booking.guest_id_document!.file_name || "Guest_Aadhaar_Document"
                                            })}
                                        >
                                            <Eye size={13} /> View Aadhaar <ExternalLink size={11} />
                                        </Button>
                                    )}
                                </div>
                            ) : booking.guest_id_document?.has_document ? (
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
                            <Receipt size={13} />
                            Pricing Breakdown
                        </h4>
                        <div className="p-4 rounded-lg border border-border/50 bg-card space-y-2.5 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Room Accommodation Price</span>
                                <span className="font-medium text-foreground tabular-nums">
                                    {formatCurrency(booking.total_price)}
                                </span>
                            </div>

                            <div className="pt-2.5 border-t border-border/50 flex justify-between items-center text-sm font-bold">
                                <span>Total Amount</span>
                                <span className="text-base text-foreground tabular-nums">
                                    {formatCurrency(booking.total_price)}
                                </span>
                            </div>

                            <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="capitalize">
                                    Payment Method:{" "}
                                    {booking.payment_method === "on_arrival"
                                        ? "Pay at Hostel"
                                        : "Paid Online"}
                                </span>
                                <span className="capitalize">
                                    Payment Status:{" "}
                                    {booking.payment_status || "Pending"}
                                </span>
                            </div>

                            {booking.payment_id && (
                                <div className="text-[10px] text-muted-foreground font-mono pt-1">
                                    Transaction Ref: {booking.payment_id}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-3 flex items-center justify-between">
                    {booking.status !== "completed" && booking.status !== "cancelled" ? (
                        <Button
                            variant="default"
                            size="sm"
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            disabled={isCheckingIn}
                            onClick={() => {
                                onCheckIn(`STN-${booking.id.substring(0, 8).toUpperCase()}`);
                                onClose();
                            }}
                        >
                            <Check size={13} />
                            Check-In Guest
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="text-xs"
                    >
                        Close
                    </Button>
                </DialogFooter>
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

