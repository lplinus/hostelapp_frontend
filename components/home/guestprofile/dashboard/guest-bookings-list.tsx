"use client";

import React, { useState } from "react";
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
    Star,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authApiClient } from "@/lib/api/auth-client";
import type { GuestTripSummary } from "../guest-profile-types";

interface GuestBookingsListProps {
    bookings: GuestTripSummary[];
}

export default function GuestBookingsList({ bookings: initialBookings }: GuestBookingsListProps) {
    const [bookings, setBookings] = useState<GuestTripSummary[]>(initialBookings);
    const [filter, setFilter] = useState<"all" | "upcoming" | "active" | "completed">("all");

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
        if (filter === "all") return true;
        if (filter === "upcoming") return b.status === "upcoming" || b.status === "confirmed";
        if (filter === "active") return b.status === "active";
        if (filter === "completed") return b.status === "completed";
        return true;
    });

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

    return (
        <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <div>
                        <h2 className="text-sm font-semibold text-foreground tracking-tight">
                            My Stays & Bookings
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage all hostel, hotel, and vacation rental reservations.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md text-xs">
                    {(["all", "upcoming", "active", "completed"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setFilter(tab)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                                filter === tab
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                    No bookings found matching this filter.
                </div>
            ) : (
                <div className="divide-y divide-border/60">
                    {filteredBookings.map((b) => (
                        <div
                            key={b.id}
                            className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-muted/80">{getPropertyIcon(b.propertyType)}</div>
                                    <h3 className="text-xs font-semibold text-foreground">
                                        {b.propertyName}
                                    </h3>
                                    {getStatusBadge(b.status)}
                                </div>

                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                                    <span>Ref: <strong className="font-mono text-foreground">{b.bookingRef}</strong></span>
                                    <span>•</span>
                                    <span>{b.roomTitle || "Standard"}</span>
                                    <span>•</span>
                                    <span>{b.checkIn} to {b.checkOut}</span>
                                    {b.location && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-0.5">
                                                <MapPin size={11} /> {b.location}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                                <span className="text-xs font-semibold text-foreground mr-1">
                                    ₹{b.totalAmount.toLocaleString()}
                                </span>

                                {/* Verified Stay Review Action */}
                                {b.hasReviewed ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                        <Star size={11} className="fill-amber-400 text-amber-400" />
                                        {b.reviewRating ? `${b.reviewRating}★ Reviewed` : "Reviewed"}
                                    </span>
                                ) : (b.status === "completed" || b.status === "active") ? (
                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={() => handleOpenReviewModal(b)}
                                        className="h-7 text-[11px] font-semibold bg-[#312E81] hover:bg-[#1E1B4B] text-white gap-1 px-2.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                                    >
                                        <Star size={11} className="fill-amber-300 text-amber-300" />
                                        Rate Stay
                                    </Button>
                                ) : null}

                                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2.5">
                                    Details <ArrowUpRight size={11} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                                                        <Star
                                                            size={18}
                                                            className={`${
                                                                star <= hotelRatings[cat.key as keyof typeof hotelRatings]
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-slate-300 fill-slate-100"
                                                            }`}
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
                                                        <Star
                                                            size={17}
                                                            className={`${
                                                                star <= rentalRatings[cat.key as keyof typeof rentalRatings]
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-slate-300 fill-slate-100"
                                                            }`}
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
                                                        <Star
                                                            size={18}
                                                            className={`${
                                                                star <= hostelRatings[cat.key as keyof typeof hostelRatings]
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-slate-300 fill-slate-100"
                                                            }`}
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
