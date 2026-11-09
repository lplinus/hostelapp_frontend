"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMyVacationRentals,
    getMyVacationRentalBookings,
    getHostedVacationRentalBookings,
    approveVacationRentalBooking,
    declineVacationRentalBooking,
    cancelVacationRentalBooking,
} from "@/services/vacanatinalrentalservices/vacationrental.service";
import type {
    VacationRentalBooking,
    VacationRentalBookingStatus,
} from "@/types/vacationrental.types";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";
import { toast } from "sonner";

export function useVacationDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isAuthenticated =
        !!user && tokenManager.getAuthFlag() === "authenticated";

    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    /* ── Tab state ─────────────────────────────────────────────── */

    const [localTab, setLocalTab] = useState<
        "properties" | "rooms" | "bookings"
    >(
        tabParam === "bookings"
            ? "bookings"
            : tabParam === "rooms"
              ? "rooms"
              : "properties"
    );
    const [isSwitchingTab, setIsSwitchingTab] = useState(false);

    useEffect(() => {
        const target =
            tabParam === "bookings"
                ? "bookings"
                : tabParam === "rooms"
                  ? "rooms"
                  : "properties";
        if (target !== localTab) {
            setIsSwitchingTab(true);
            setLocalTab(target);
            const timer = setTimeout(() => setIsSwitchingTab(false), 280);
            return () => clearTimeout(timer);
        }
    }, [tabParam, localTab]);

    const handleTabChange = (
        newTab: "properties" | "rooms" | "bookings"
    ) => {
        if (newTab === localTab) return;
        setIsSwitchingTab(true);
        setLocalTab(newTab);
        const queryParam =
            newTab === "bookings"
                ? "bookings"
                : newTab === "rooms"
                  ? "rooms"
                  : "property";
        router.replace(`/vacanrentalbooking?tab=${queryParam}`, {
            scroll: false,
        });
        setTimeout(() => {
            setIsSwitchingTab(false);
        }, 280);
    };

    /* ── Perspective state ─────────────────────────────────────── */

    const [perspective, setPerspective] = useState<"guest" | "host">("host");

    const handlePerspectiveChange = (newPerspective: "guest" | "host") => {
        setPerspective(newPerspective);
    };

    /* ── Filter / selection state ──────────────────────────────── */

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<
        VacationRentalBookingStatus | "all"
    >("all");
    const [selectedBooking, setSelectedBooking] =
        useState<VacationRentalBooking | null>(null);

    /* ── Modal state ───────────────────────────────────────────── */

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState("");

    /* ── Queries ───────────────────────────────────────────────── */

    const {
        data: guestBookings = [],
        isLoading: isGuestLoading,
        isRefetching: isGuestRefetching,
        refetch: refetchGuest,
    } = useQuery({
        queryKey: [
            "vacationRentalBookings",
            "guest",
            user?.id,
            selectedStatus,
        ],
        queryFn: () =>
            getMyVacationRentalBookings({
                status:
                    selectedStatus === "all" ? undefined : selectedStatus,
            }),
        enabled:
            isAuthenticated && perspective === "guest" && !!user?.id,
        refetchInterval: isAuthenticated ? 6000 : false,
    });

    const {
        data: hostedBookings = [],
        isLoading: isHostLoading,
        isRefetching: isHostRefetching,
        refetch: refetchHost,
    } = useQuery({
        queryKey: [
            "vacationRentalBookings",
            "host",
            user?.id,
            selectedStatus,
        ],
        queryFn: () =>
            getHostedVacationRentalBookings({
                status:
                    selectedStatus === "all" ? undefined : selectedStatus,
            }),
        enabled:
            isAuthenticated && perspective === "host" && !!user?.id,
        refetchInterval: isAuthenticated ? 6000 : false,
    });

    const { data: myRentals = [] } = useQuery({
        queryKey: ["myVacationRentalsList", user?.id],
        queryFn: () => getMyVacationRentals(),
        enabled: isAuthenticated && !!user?.id,
    });

    /* ── Derived values ────────────────────────────────────────── */

    const activeList =
        perspective === "guest" ? guestBookings : hostedBookings;
    const isLoading =
        perspective === "guest" ? isGuestLoading : isHostLoading;
    const isRefetching =
        perspective === "guest" ? isGuestRefetching : isHostRefetching;
    const refetch =
        perspective === "guest" ? refetchGuest : refetchHost;

    /* ── Mutations ─────────────────────────────────────────────── */

    const approveMutation = useMutation({
        mutationFn: (id: string) => approveVacationRentalBooking(id),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({
                queryKey: ["vacationRentalBookings"],
            });
            toast.success("Reservation approved!", {
                description: `Booking #${updated.booking_reference} confirmed & dates locked.`,
            });
            if (selectedBooking && selectedBooking.id === updated.id) {
                setSelectedBooking(updated);
            }
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.detail ||
                    "Failed to approve reservation."
            );
        },
    });

    const declineMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            declineVacationRentalBooking(id, reason),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({
                queryKey: ["vacationRentalBookings"],
            });
            toast.success("Reservation declined", {
                description: `Booking #${updated.booking_reference} has been declined.`,
            });
            setIsDeclineModalOpen(false);
            setDeclineReason("");
            if (selectedBooking && selectedBooking.id === updated.id) {
                setSelectedBooking(updated);
            }
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.detail ||
                    "Failed to decline reservation."
            );
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            cancelVacationRentalBooking(id, reason),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({
                queryKey: ["vacationRentalBookings"],
            });
            toast.success("Reservation cancelled", {
                description: `Booking #${updated.booking_reference} has been cancelled.`,
            });
            setIsCancelModalOpen(false);
            setCancelReason("");
            if (selectedBooking && selectedBooking.id === updated.id) {
                setSelectedBooking(updated);
            }
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.detail ||
                    "Failed to cancel reservation."
            );
        },
    });

    /* ── Client-side search filtering ──────────────────────────── */

    const filteredBookings = activeList.filter((b) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const refMatch = b.booking_reference.toLowerCase().includes(query);
        const titleMatch = b.rental_title?.toLowerCase().includes(query);
        const guestMatch = b.guest_details?.guest_name
            .toLowerCase()
            .includes(query);
        return refMatch || titleMatch || guestMatch;
    });

    /* ── KPI metrics ───────────────────────────────────────────── */

    const totalCount = activeList.length;
    const upcomingCount = activeList.filter(
        (b) => b.status === "confirmed"
    ).length;
    const pendingCount = activeList.filter(
        (b) => b.status === "pending_approval"
    ).length;
    const totalRevenueSum = activeList
        .filter((b) => b.status !== "cancelled" && b.status !== "declined")
        .reduce((sum, b) => sum + parseFloat(b.total_price || "0"), 0);

    /* ── Return everything ─────────────────────────────────────── */

    return {
        // Tab
        localTab,
        isSwitchingTab,
        handleTabChange,
        // Perspective
        perspective,
        handlePerspectiveChange,
        // Filter / selection
        searchQuery,
        setSearchQuery,
        selectedStatus,
        setSelectedStatus,
        selectedBooking,
        setSelectedBooking,
        // Modals
        isCancelModalOpen,
        setIsCancelModalOpen,
        cancelReason,
        setCancelReason,
        isDeclineModalOpen,
        setIsDeclineModalOpen,
        declineReason,
        setDeclineReason,
        // Lists
        myRentals,
        hostedBookings,
        activeList,
        filteredBookings,
        // Loading
        isLoading,
        isRefetching,
        refetch,
        // Mutations
        approveMutation,
        declineMutation,
        cancelMutation,
        // KPI
        totalCount,
        upcomingCount,
        pendingCount,
        totalRevenueSum,
    };
}
