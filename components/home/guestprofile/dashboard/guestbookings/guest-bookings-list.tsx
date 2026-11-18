"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CustomStarIcon } from "@/components/ui/custom-icons";
import {
    CalendarDays,
    Building2,
    Hotel,
    Home,
    MapPin,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    ChevronRight,
    ExternalLink,
    Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authApiClient } from "@/lib/api/auth-client";
import type { GuestTripSummary } from "../../guest-profile-types";

interface GuestBookingsListProps {
    bookings: GuestTripSummary[];
}

export default function GuestBookingsList({ bookings: initialBookings }: GuestBookingsListProps) {
    const [bookings, setBookings] = useState<GuestTripSummary[]>(initialBookings);
    const [filter, setFilter] = useState<"all" | "upcoming" | "active" | "completed">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "hostel" | "hotel" | "vacation_rental">("all");

    // Details Modal State
    const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<GuestTripSummary | null>(null);

    // Review Modal State
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<GuestTripSummary | null>(null);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewComment, setReviewComment] = useState("");

    // Dynamic ratings dictionary
    const [hotelRatings, setHotelRatings] = useState({
        cleanliness: 5,
        comfort: 5,
        service: 5,
        location: 5,
    });

    const [rentalRatings, setRentalRatings] = useState({
        cleanliness: 5,
        accuracy: 5,
        checkin: 5,
        communication: 5,
        location: 5,
        value: 5,
    });

    const [hostelRatings, setHostelRatings] = useState({
        food: 5,
        room: 5,
    });

    // Synchronize if prop changes
    React.useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);

    const filteredBookings = bookings.filter((b) => {
        if (filter === "upcoming" && b.status !== "upcoming" && b.status !== "confirmed") return false;
        if (filter === "active" && b.status !== "active") return false;
        if (filter === "completed" && b.status !== "completed") return false;
        if (typeFilter !== "all" && b.propertyType !== typeFilter) return false;
        return true;
    });

    const formatDisplayDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const getPropertyTypeBadge = (type: GuestTripSummary["propertyType"]) => {
        switch (type) {
            case "hotel":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        <Hotel size={11} /> Hotel Stay
                    </span>
                );
            case "vacation_rental":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                        <Home size={11} /> Vacation Rental
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <Building2 size={11} /> Hostel Stay
                    </span>
                );
        }
    };

    const getPropertyIcon = (type: GuestTripSummary["propertyType"]) => {
        switch (type) {
            case "hotel":
                return <Hotel className="w-3.5 h-3.5 text-blue-600" />;
            case "vacation_rental":
                return <Home className="w-3.5 h-3.5 text-amber-600" />;
            default:
                return <Building2 className="w-3.5 h-3.5 text-emerald-600" />;
        }
    };

    const getStatusBadge = (status: GuestTripSummary["status"]) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 gap-1 text-[10px] font-medium">
                        <CheckCircle2 size={11} /> Checked In
                    </Badge>
                );
            case "upcoming":
            case "confirmed":
                return (
                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 gap-1 text-[10px] font-medium">
                        <Clock size={11} /> Confirmed
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px]">
                        Completed
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                        <XCircle size={11} /> Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                        {status}
                    </Badge>
                );
        }
    };

    const handleOpenReviewModal = (booking: GuestTripSummary) => {
        setSelectedBookingForReview(booking);
        setReviewComment("");
        setHotelRatings({ cleanliness: 5, comfort: 5, service: 5, location: 5 });
        setRentalRatings({ cleanliness: 5, accuracy: 5, checkin: 5, communication: 5, location: 5, value: 5 });
        setHostelRatings({ food: 5, room: 5 });
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingForReview) return;
        if (!reviewComment.trim()) {
            toast.error("Please add a short comment about your stay experience.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const b = selectedBookingForReview;
            let calculatedAverage = 5;

            if (b.propertyType === "hotel") {
                calculatedAverage = parseFloat(
                    ((hotelRatings.cleanliness + hotelRatings.comfort + hotelRatings.service + hotelRatings.location) / 4).toFixed(1)
                );
                await authApiClient.post("/api/reviews/hotels/", {
                    booking: b.id,
                    hotel: b.propertyId,
                    cleanliness_rating: hotelRatings.cleanliness,
                    comfort_rating: hotelRatings.comfort,
                    service_rating: hotelRatings.service,
                    location_rating: hotelRatings.location,
                    comment: reviewComment.trim(),
                });
            } else if (b.propertyType === "vacation_rental") {
                const total =
                    rentalRatings.cleanliness +
                    rentalRatings.accuracy +
                    rentalRatings.checkin +
                    rentalRatings.communication +
                    rentalRatings.location +
                    rentalRatings.value;
                calculatedAverage = parseFloat((total / 6).toFixed(1));
                await authApiClient.post("/api/reviews/vacation-rentals/", {
                    booking: b.id,
                    rental: b.propertyId,
                    cleanliness_rating: rentalRatings.cleanliness,
                    accuracy_rating: rentalRatings.accuracy,
                    checkin_rating: rentalRatings.checkin,
                    communication_rating: rentalRatings.communication,
                    location_rating: rentalRatings.location,
                    value_rating: rentalRatings.value,
                    comment: reviewComment.trim(),
                });
            } else {
                calculatedAverage = parseFloat(
                    ((hostelRatings.food + hostelRatings.room) / 2).toFixed(1)
                );
                await authApiClient.post("/api/reviews/", {
                    booking: b.id,
                    hostel: b.propertyId,
                    food_rating: hostelRatings.food,
                    room_rating: hostelRatings.room,
                    comment: reviewComment.trim(),
                });
            }

            // Update local state
            setBookings((prev) =>
                prev.map((item) =>
                    item.id === b.id
                        ? { ...item, hasReviewed: true, reviewRating: calculatedAverage, reviewComment: reviewComment.trim() }
                        : item
                )
            );

            toast.success("Thank you! Your stay review has been verified and posted.");
            setSelectedBookingForReview(null);
        } catch (err: any) {
            console.error("Failed to post verified stay review:", err);
            const msg = err?.response?.data?.detail || err?.response?.data?.booking?.[0] || "Could not post your review. Please try again.";
            toast.error(msg);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const hostelCount = bookings.filter((b) => b.propertyType === "hostel").length;
    const hotelCount = bookings.filter((b) => b.propertyType === "hotel").length;
    const vrCount = bookings.filter((b) => b.propertyType === "vacation_rental").length;

    return (
        <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            {/* Header & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <div>
                        <h2 className="text-sm font-semibold text-foreground tracking-tight">
                            My Stays & Bookings
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Organized record of all hotel reservations and vacation rental bookings.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Stay Type Filters */}
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md text-xs">
                        <button
                            type="button"
                            onClick={() => setTypeFilter("all")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                typeFilter === "all"
                                    ? "bg-background text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All ({bookings.length})
                        </button>
                        {/* <button
                            type="button"
                            onClick={() => setTypeFilter("hostel")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                typeFilter === "hostel"
                                    ? "bg-background text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Hostels ({hostelCount})
                        </button> */}
                        <button
                            type="button"
                            onClick={() => setTypeFilter("hotel")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                typeFilter === "hotel"
                                    ? "bg-background text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Hotels ({hotelCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeFilter("vacation_rental")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                typeFilter === "vacation_rental"
                                    ? "bg-background text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Rentals ({vrCount})
                        </button>
                    </div>

                    {/* Status Filters */}
                    <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-md text-xs">
                        {(["all", "upcoming", "active", "completed"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setFilter(tab)}
                                className={`px-2 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                                    filter === tab
                                        ? "bg-background text-foreground shadow-2xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground bg-muted/10 rounded-md border border-dashed border-border/70">
                    No bookings found matching the selected filter.
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-md border border-border/70 bg-card/40">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/70">
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 min-w-[200px]">
                                        Stay / Property
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 min-w-[120px]">
                                        Booking Ref
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 min-w-[160px]">
                                        Accommodation
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 min-w-[190px]">
                                        Stay Schedule
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 min-w-[110px]">
                                        Total Fare
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 min-w-[110px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider py-3 px-4 text-right min-w-[140px]">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.map((b) => (
                                    <TableRow
                                        key={b.id}
                                        className="group hover:bg-muted/30 transition-colors border-b border-border/50 cursor-pointer"
                                        onClick={() => setSelectedBookingForDetails(b)}
                                    >
                                        {/* Stay / Property */}
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                    {b.propertyName}
                                                </span>
                                                <div>
                                                    {getPropertyTypeBadge(b.propertyType)}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Booking Ref */}
                                        <TableCell className="py-3.5 px-4">
                                            <span className="font-mono text-xs font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-sm border border-border/60">
                                                #{b.bookingRef}
                                            </span>
                                        </TableCell>

                                        {/* Accommodation */}
                                        <TableCell className="py-3.5 px-4">
                                            <span className="text-xs text-foreground font-medium line-clamp-1">
                                                {b.roomTitle || "Standard Room"}
                                            </span>
                                        </TableCell>

                                        {/* Schedule */}
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col text-xs text-foreground whitespace-nowrap">
                                                <span className="font-medium">
                                                    {formatDisplayDate(b.checkIn)} → {formatDisplayDate(b.checkOut)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Fare */}
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-foreground tabular-nums">
                                                    ₹{b.totalAmount.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground capitalize">
                                                    {b.paymentStatus || "Paid Online"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="py-3.5 px-4 whitespace-nowrap">
                                            {getStatusBadge(b.status)}
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                {b.hasReviewed ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-sm">
                                                        <CustomStarIcon className="w-3 h-3 shrink-0" fill="#070707" />
                                                        {b.reviewRating ? `${b.reviewRating}★` : "Reviewed"}
                                                    </span>
                                                ) : (b.status === "completed" || b.status === "active") ? (
                                                    <Button
                                                        size="sm"
                                                        type="button"
                                                        onClick={() => handleOpenReviewModal(b)}
                                                        className="h-7 text-[11px] font-semibold bg-[#312E81] hover:bg-[#1E1B4B] text-white gap-1 px-2.5 rounded-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
                                                    >
                                                        <CustomStarIcon className="w-3 h-3 shrink-0" fill="#FFFFFF" />
                                                        Rate Stay
                                                    </Button>
                                                ) : null}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs gap-1 border border-border/80 text-foreground bg-card/60 hover:bg-[#1F1E1B] hover:text-[#EDE8DF] hover:border-[#1F1E1B] group-hover:bg-[#1F1E1B] group-hover:text-[#EDE8DF] group-hover:border-[#1F1E1B] dark:hover:bg-[#2A2926] dark:hover:text-[#EDE8DF] dark:hover:border-[#3D3A34] dark:group-hover:bg-[#2A2926] dark:group-hover:text-[#EDE8DF] dark:group-hover:border-[#3D3A34] transition-all cursor-pointer shadow-2xs rounded-sm"
                                                    onClick={() => setSelectedBookingForDetails(b)}
                                                >
                                                    Details
                                                    <ChevronRight size={12} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Cards View (Responsive like Owner Dashboard) */}
                    <div className="md:hidden space-y-2.5">
                        {filteredBookings.map((b) => (
                            <div
                                key={b.id}
                                className="p-3 sm:p-3.5 rounded-md border border-border/70 bg-card hover:bg-muted/30 transition-all space-y-2.5 cursor-pointer shadow-2xs"
                                onClick={() => setSelectedBookingForDetails(b)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {getPropertyTypeBadge(b.propertyType)}
                                            <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-sm border border-border/50">
                                                #{b.bookingRef}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xs sm:text-sm text-foreground truncate mt-1">
                                            {b.propertyName}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {b.roomTitle || "Standard Room"}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        {getStatusBadge(b.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50 bg-muted/20 p-2 rounded-md">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Stay Schedule</span>
                                        <span className="font-semibold text-foreground text-[11px]">
                                            {formatDisplayDate(b.checkIn)} → {formatDisplayDate(b.checkOut)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Fare</span>
                                        <span className="font-bold text-foreground text-xs tabular-nums">
                                            ₹{b.totalAmount.toLocaleString()}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground block capitalize leading-none mt-0.5">
                                            {b.paymentStatus || "Paid Online"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-0.5" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBookingForDetails(b)}
                                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <span>Stay Details</span>
                                        <ChevronRight size={13} />
                                    </button>

                                    {b.hasReviewed ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-900 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-sm">
                                            <CustomStarIcon className="w-3 h-3 shrink-0" fill="#070707" />
                                            {b.reviewRating ? `${b.reviewRating}★` : "Reviewed"}
                                        </span>
                                    ) : (b.status === "completed" || b.status === "active") ? (
                                        <Button
                                            size="sm"
                                            type="button"
                                            onClick={() => handleOpenReviewModal(b)}
                                            className="h-7 text-[11px] font-semibold bg-[#312E81] hover:bg-[#1E1B4B] text-white gap-1 px-2.5 rounded-sm transition-all active:scale-95 cursor-pointer shadow-2xs"
                                        >
                                            <CustomStarIcon className="w-3 h-3 shrink-0" fill="#FFFFFF" />
                                            Rate Stay
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* STAY DETAILS IN-APP MODAL */}
            <Dialog open={!!selectedBookingForDetails} onOpenChange={(open) => !open && setSelectedBookingForDetails(null)}>
                <DialogContent className="max-w-lg rounded-sm border border-border/80 shadow-2xl p-6 bg-card">
                    {selectedBookingForDetails && (
                        <>
                            <DialogHeader className="border-b pb-3.5 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="text-base font-bold text-foreground">
                                            Stay Details #{selectedBookingForDetails.bookingRef}
                                        </DialogTitle>
                                        {getStatusBadge(selectedBookingForDetails.status)}
                                    </div>
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {getPropertyTypeBadge(selectedBookingForDetails.propertyType)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-3 text-xs">
                                <div className="p-3.5 rounded-sm bg-muted/30 border border-border/60 space-y-2">
                                    <div className="font-semibold text-sm text-foreground">
                                        {selectedBookingForDetails.propertyName}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Accommodation</span>
                                            <span className="font-medium text-foreground">{selectedBookingForDetails.roomTitle || "Standard Room"}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Booking Reference</span>
                                            <span className="font-mono font-medium text-foreground">#{selectedBookingForDetails.bookingRef}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Check-In</span>
                                            <span className="font-medium text-foreground">{formatDisplayDate(selectedBookingForDetails.checkIn)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Check-Out</span>
                                            <span className="font-medium text-foreground">{formatDisplayDate(selectedBookingForDetails.checkOut)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-sm bg-muted/20 border border-border/60 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Total Amount</span>
                                        <span className="text-base font-bold text-foreground tabular-nums">
                                            ₹{selectedBookingForDetails.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Payment Status</span>
                                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 capitalize">
                                            {selectedBookingForDetails.paymentStatus || "Confirmed"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="flex items-center justify-between border-t pt-3">
                                {selectedBookingForDetails.propertySlug ? (
                                    <Link
                                        href={
                                            selectedBookingForDetails.propertyType === "hotel"
                                                ? `/home/hotels/${selectedBookingForDetails.propertySlug}`
                                                : selectedBookingForDetails.propertyType === "vacation_rental"
                                                ? `/home/vacanationalrental/${selectedBookingForDetails.propertySlug}`
                                                : `/home/hostels/${selectedBookingForDetails.propertySlug}`
                                        }
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                    >
                                        <ExternalLink size={12} /> View Property Page
                                    </Link>
                                ) : <div />}
                                <Button variant="outline" size="sm" onClick={() => setSelectedBookingForDetails(null)} className="text-xs rounded-sm">
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* VERIFIED GUEST STAY REVIEW MODAL */}
            <Dialog open={!!selectedBookingForReview} onOpenChange={(open) => !open && setSelectedBookingForReview(null)}>
                <DialogContent className="sm:max-w-[460px] rounded-2xl p-6 border-0 shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 w-fit px-2.5 py-0.5 rounded-full mb-1">
                            <CheckCircle2 size={12} />
                            Verified Guest Stay
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900">
                            Rate Your Stay at {selectedBookingForReview?.propertyName}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Booking Reference: <strong className="font-mono text-slate-700">{selectedBookingForReview?.bookingRef}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBookingForReview && (
                        <form onSubmit={handleSubmitReview} className="space-y-4 pt-3">
                            {/* HOTEL CRITERIA */}
                            {selectedBookingForReview.propertyType === "hotel" && (
                                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                                    {[
                                        { key: "cleanliness", label: "Cleanliness & Hygiene" },
                                        { key: "comfort", label: "Suite Comfort & Bed" },
                                        { key: "service", label: "Staff & Concierge Service" },
                                        { key: "location", label: "Location & Accessibility" },
                                    ].map((cat) => (
                                        <div key={cat.key} className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700">{cat.label}</span>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setHotelRatings((prev) => ({ ...prev, [cat.key]: star }))
                                                        }
                                                        className="hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                                                    >
                                                        <CustomStarIcon
                                                            className="w-4 h-4 shrink-0"
                                                            fill={star <= hotelRatings[cat.key as keyof typeof hotelRatings] ? "#070707" : "#CBD5E1"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* VACATION RENTAL CRITERIA */}
                            {selectedBookingForReview.propertyType === "vacation_rental" && (
                                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                                    {[
                                        { key: "cleanliness", label: "Cleanliness" },
                                        { key: "accuracy", label: "Listing Accuracy" },
                                        { key: "checkin", label: "Smooth Check-in" },
                                        { key: "communication", label: "Host Communication" },
                                        { key: "location", label: "Neighborhood & Location" },
                                        { key: "value", label: "Value for Price" },
                                    ].map((cat) => (
                                        <div key={cat.key} className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700">{cat.label}</span>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setRentalRatings((prev) => ({ ...prev, [cat.key]: star }))
                                                        }
                                                        className="hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                                                    >
                                                        <CustomStarIcon
                                                            className="w-4 h-4 shrink-0"
                                                            fill={star <= rentalRatings[cat.key as keyof typeof rentalRatings] ? "#070707" : "#CBD5E1"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* HOSTEL CRITERIA */}
                            {selectedBookingForReview.propertyType === "hostel" && (
                                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                                    {[
                                        { key: "food", label: "Food & Dining" },
                                        { key: "room", label: "Room Comfort & Hygiene" },
                                    ].map((cat) => (
                                        <div key={cat.key} className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700">{cat.label}</span>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setHostelRatings((prev) => ({ ...prev, [cat.key]: star }))
                                                        }
                                                        className="hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                                                    >
                                                        <CustomStarIcon
                                                            className="w-4 h-4 shrink-0"
                                                            fill={star <= hostelRatings[cat.key as keyof typeof hostelRatings] ? "#070707" : "#CBD5E1"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Comment */}
                            <div className="space-y-1.5">
                                <Label htmlFor="review-experience" className="text-xs font-semibold text-slate-700">
                                    Your Experience
                                </Label>
                                <Textarea
                                    id="review-experience"
                                    rows={3}
                                    required
                                    placeholder="Tell future guests about your stay, hospitality, or amenities..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="text-xs rounded-xl border-slate-200 resize-none bg-slate-50/50 p-3 focus:bg-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-semibold h-10 rounded-xl transition-all active:scale-[0.99] cursor-pointer"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin mr-1.5" />
                                        Submitting Verified Review...
                                    </>
                                ) : (
                                    "Submit Verified Review"
                                )}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
