"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
    getOwnerBookings,
    updateBookingStatus,
    deleteBooking,
    checkInBooking,
    getOwnerInquiries,
    updateInquiryStatus,
    type Booking,
} from "@/services/booking.service";
import BookingQRScanner from "@/components/hostelowner/qr/BookingQRScanner";

import HostelBookingFilters from "./HostelBookingFilters";
import HostelBookingTable from "./HostelBookingTable";
import HostelInquiriesTable from "./HostelInquiriesTable";
import HostelBookingDetailModal from "./HostelBookingDetailModal";

export default function HostelBookingModule() {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const queryClient = useQueryClient();
    const [isScanning, setIsScanning] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [view, setView] = useState<"bookings" | "inquiries">("bookings");
    const [selectedHostelBooking, setSelectedHostelBooking] = useState<Booking | null>(null);

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["ownerBookings", user?.id, search, startDate, endDate],
        queryFn: () =>
            getOwnerBookings({
                search: search || undefined,
                check_in__gte: startDate || undefined,
                check_in__lte: endDate || undefined,
            }),
        enabled: mounted && !!user?.id,
        refetchInterval: 5000,
    });

    const { data: inquiries, isLoading: isInquiriesLoading } = useQuery({
        queryKey: ["ownerInquiries", user?.id],
        queryFn: () => getOwnerInquiries(),
        refetchInterval: 5000,
        enabled: mounted && view === "inquiries" && !!user?.id,
    });

    const checkInMutation = useMutation({
        mutationFn: (booking_id: string) => checkInBooking(booking_id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            toast.success(data.message || "Guest checked in successfully!");
            setIsScanning(false);
        },
        onError: (error: any) => {
            setIsScanning(false);
            toast.error(error.response?.data?.error || "Failed to check in guest.");
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            toast.success("Status updated successfully");
        },
        onError: () => {
            toast.error("Failed to update status");
        },
    });

    const inquiryStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateInquiryStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerInquiries"] });
            toast.success("Inquiry status updated successfully");
        },
        onError: () => {
            toast.error("Failed to update inquiry status");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteBooking(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            toast.success("Booking deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete booking");
        },
    });

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
        statusMutation.mutate({ id, status: e.target.value });
    };

    const handleInquiryStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
        inquiryStatusMutation.mutate({ id, status: e.target.value });
    };

    const handleDelete = (id: string) => {
        toast("Delete Booking?", {
            description: "Are you sure you want to delete this booking? This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: () => deleteMutation.mutate(id),
            },
        });
    };

    const handleQRScan = (decodedText: string) => {
        const stnMatch = decodedText.match(/STN-([A-Fa-f0-9]{8})/);
        const bookingTagMatch = decodedText.match(/BOOKING:([^\s\\]+)/);
        const uuidMatch = decodedText.match(
            /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
        );

        const bookingId = stnMatch
            ? `STN-${stnMatch[1].toUpperCase()}`
            : bookingTagMatch?.[1] || uuidMatch?.[1];

        if (bookingId) {
            setIsScanning(false);
            toast.promise(checkInMutation.mutateAsync(bookingId), {
                loading: "Checking in guest...",
                success: "Guest checked in successfully!",
                error: "Failed to check in guest via QR code.",
            });
        } else {
            toast.error("Invalid QR Code. Could not find booking ID.");
            setIsScanning(false);
        }
    };

    return (
        <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
            <HostelBookingFilters
                search={search}
                setSearch={setSearch}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                view={view}
                setView={setView}
                bookingsCount={bookings?.length}
                onScanQR={() => setIsScanning(true)}
            />

            {view === "bookings" ? (
                <HostelBookingTable
                    bookings={bookings}
                    isLoading={isLoading}
                    mounted={mounted}
                    search={search}
                    onSelectBooking={(b) => setSelectedHostelBooking(b)}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    isUpdatingStatus={statusMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                />
            ) : (
                <HostelInquiriesTable
                    inquiries={inquiries}
                    isLoading={isInquiriesLoading}
                    mounted={mounted}
                    onStatusChange={handleInquiryStatusChange}
                    isUpdatingStatus={inquiryStatusMutation.isPending}
                />
            )}

            <HostelBookingDetailModal
                booking={selectedHostelBooking}
                isOpen={!!selectedHostelBooking}
                onClose={() => setSelectedHostelBooking(null)}
                onCheckIn={(bookingId) => checkInMutation.mutate(bookingId)}
                isCheckingIn={checkInMutation.isPending}
            />

            {isScanning && (
                <BookingQRScanner
                    onScan={handleQRScan}
                    onClose={() => setIsScanning(false)}
                />
            )}
        </div>
    );
}

