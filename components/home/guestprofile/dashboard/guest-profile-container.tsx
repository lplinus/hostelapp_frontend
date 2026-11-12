"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import GuestProfileHeader from "./guest-profile-header";
import GuestProfileStats from "./guest-profile-stats";
import GuestProfileOverviewCard from "./guest-profile-overview-card";
import GuestProfileDetailsSection from "./guest-profile-details-section";
import GuestProfileForm from "./guest-profile-form";
import GuestAadhaarCard from "./guest-aadhaar-card";
import GuestBookingsList from "./guest-bookings-list";
import type { GuestProfile, GuestTripSummary } from "../guest-profile-types";
import {
    getGuestProfile,
    updateGuestProfile,
    getGuestBookings,
    type GuestProfileAPIResponse,
    type GuestBookingAPIResponse,
} from "@/services/guestservices/guestprofile.service";

// ─── Mappers: API (snake_case) → Frontend (camelCase) ──────────────────────

function mapApiProfileToFrontend(
    api: GuestProfileAPIResponse,
    bookingsCount: number
): GuestProfile {
    const memberYear = api.created_at
        ? new Date(api.created_at).getFullYear().toString()
        : new Date().getFullYear().toString();

    return {
        id: api.id,
        fullName: api.full_name || api.username || "",
        email: api.email || "",
        phone: api.phone_number || "",
        avatarUrl: api.profile_picture || "",
        dateOfBirth: api.date_of_birth || undefined,
        gender: api.gender,
        city: api.city || undefined,
        state: api.state || undefined,
        country: api.nationality || "India",
        postalCode: api.pincode || undefined,
        emergencyContactName: api.emergency_contact_name || undefined,
        emergencyContactPhone: api.emergency_contact_phone || undefined,
        emergencyContactRelation: api.emergency_contact_relation || undefined,
        aadhaarNumber: api.aadhaar_number || undefined,
        aadhaarFileName: api.aadhaar_file_name || undefined,
        aadhaarFileUrl: api.aadhaar_file_url || undefined,
        idVerificationStatus: api.id_verification_status,
        isEmailVerified: api.is_email_verified,
        isPhoneVerified: api.is_phone_verified,
        verifiedAt: api.verified_at || undefined,
        rejectionReason: api.rejection_reason || undefined,
        stats: {
            totalTrips: bookingsCount,
            completedStays: 0, // computed from bookings below
            reviewsCount: 0,   // computed from bookings below
            memberSince: memberYear,
        },
    };
}

function mapApiBookingToFrontend(api: GuestBookingAPIResponse): GuestTripSummary {
    // Map API status to frontend status
    const statusMap: Record<string, GuestTripSummary["status"]> = {
        upcoming: "upcoming",
        active: "active",
        confirmed: "confirmed",
        pending: "pending",
        completed: "completed",
        cancelled: "cancelled",
        checked_in: "active",
        checked_out: "completed",
    };

    return {
        id: api.id,
        bookingRef: api.booking_reference || api.id.slice(0, 8).toUpperCase(),
        propertyName: api.property_name,
        propertyType: api.booking_type,
        roomTitle: api.room_title,
        checkIn: api.check_in || "",
        checkOut: api.check_out || "",
        status: statusMap[api.status] || "pending",
        totalAmount: parseFloat(api.total_price) || 0,
        paymentStatus: api.payment_status,
    };
}

/**
 * Convert camelCase frontend profile back to snake_case for the API PATCH.
 */
function mapFrontendToApi(
    profile: GuestProfile
): Partial<GuestProfileAPIResponse> {
    return {
        full_name: profile.fullName || undefined,
        email: profile.email || undefined,
        phone_number: profile.phone || undefined,
        date_of_birth: profile.dateOfBirth || undefined,
        gender: profile.gender,
        city: profile.city || undefined,
        state: profile.state || undefined,
        pincode: profile.postalCode || undefined,
        emergency_contact_name: profile.emergencyContactName || undefined,
        emergency_contact_phone: profile.emergencyContactPhone || undefined,
        emergency_contact_relation: profile.emergencyContactRelation || undefined,
        aadhaar_number: profile.aadhaarNumber || undefined,
    };
}

// ─── Skeleton loader ───────────────────────────────────────────────────────

function DashboardSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            {/* Header skeleton */}
            <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                        <div className="h-6 w-48 bg-muted rounded" />
                        <div className="h-3 w-64 bg-muted rounded" />
                    </div>
                </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-border/70 rounded-md bg-card p-3 sm:p-3.5">
                        <div className="h-3 w-16 bg-muted rounded mb-2" />
                        <div className="h-6 w-10 bg-muted rounded" />
                    </div>
                ))}
            </div>
            {/* Overview skeleton */}
            <div className="bg-card border border-border/80 rounded-lg p-5 shadow-2xs">
                <div className="h-5 w-56 bg-muted rounded mb-4" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Container ────────────────────────────────────────────────────────

export default function GuestProfileContainer() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [profile, setProfile] = useState<GuestProfile | null>(null);
    const [formData, setFormData] = useState<GuestProfile | null>(null);
    const [bookings, setBookings] = useState<GuestTripSummary[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab state: "dashboard" (summary & overview) vs "profile" (full details & documents)
    const activeTab = searchParams.get("tab") || "dashboard";

    // ── Fetch profile + bookings on mount ──────────────────────────────────
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [apiProfile, apiBookings] = await Promise.all([
                getGuestProfile(),
                getGuestBookings(),
            ]);

            const mappedBookings = apiBookings.map(mapApiBookingToFrontend);

            const completedCount = mappedBookings.filter(
                (b) => b.status === "completed"
            ).length;

            const mapped = mapApiProfileToFrontend(apiProfile, mappedBookings.length);
            mapped.stats = {
                ...mapped.stats!,
                completedStays: completedCount,
            };

            setProfile(mapped);
            setFormData(mapped);
            setBookings(mappedBookings);
        } catch (err: any) {
            console.error("[GuestProfile] Failed to load:", err);
            setError("Failed to load your profile. Please try again.");
            toast.error("Could not load guest profile.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Edit handlers ──────────────────────────────────────────────────────
    const handleToggleEdit = () => {
        if (!isEditing && profile) {
            setFormData({ ...profile });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setIsSaving(true);
        try {
            const payload = mapFrontendToApi(formData);
            const updated = await updateGuestProfile(payload);

            const mapped = mapApiProfileToFrontend(updated, bookings.length);
            const completedCount = bookings.filter(
                (b) => b.status === "completed"
            ).length;
            mapped.stats = {
                ...mapped.stats!,
                completedStays: completedCount,
            };

            setProfile(mapped);
            setFormData(mapped);
            setIsEditing(false);
            toast.success("Guest profile updated successfully!");
        } catch (err: any) {
            console.error("[GuestProfile] Save failed:", err);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAadhaarUpdate = (updated: Partial<GuestProfile>) => {
        setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
        setFormData((prev) => (prev ? { ...prev, ...updated } : prev));
    };

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // ── Error state ────────────────────────────────────────────────────────
    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        {error || "Unable to load your profile."}
                    </p>
                    <button
                        onClick={fetchData}
                        className="text-sm font-medium text-primary hover:underline cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <GuestProfileHeader
                profile={profile}
                isEditing={isEditing}
                onToggleEdit={handleToggleEdit}
            />

            {/* VIEW 1: MY BOOKINGS ONLY */}
            {activeTab === "bookings" ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                    <GuestBookingsList bookings={bookings} />
                </div>
            ) : activeTab === "profile" ? (
                /* VIEW 2: PROFILE & DOCUMENTS ONLY */
                <div className="space-y-5 animate-in fade-in duration-200">
                    <GuestProfileDetailsSection
                        profile={profile}
                        formData={formData!}
                        setFormData={setFormData as React.Dispatch<React.SetStateAction<GuestProfile>>}
                        onSave={handleSave}
                        isSaving={isSaving}
                        onAadhaarUpdate={handleAadhaarUpdate}
                    />
                </div>
            ) : (
                /* VIEW 3: GUEST DASHBOARD (Overview & Summary) */
                <div className="space-y-5 animate-in fade-in duration-200">
                    <GuestProfileStats stats={profile.stats} />

                    {isEditing && (
                        <div className="animate-in fade-in duration-200">
                            <GuestProfileForm
                                formData={formData!}
                                setFormData={setFormData as React.Dispatch<React.SetStateAction<GuestProfile>>}
                                onSave={handleSave}
                                onCancel={() => setIsEditing(false)}
                                isSaving={isSaving}
                            />
                        </div>
                    )}

                    {/* Snapshot summary card with quick link to profile documents */}
                    <GuestProfileOverviewCard
                        profile={profile}
                        onGoToProfile={() => router.push("/home/guestprofile?tab=profile")}
                    />

                    {/* Quick Bookings Snapshot */}
                    <div id="guest-bookings">
                        <GuestBookingsList bookings={bookings} />
                    </div>
                </div>
            )}
        </div>
    );
}
