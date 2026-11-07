"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import {
    getOwnerBookings,
    updateBookingStatus,
    deleteBooking,
    checkInBooking,
    getOwnerInquiries,
    updateInquiryStatus,
    type Booking,
} from "@/services/booking.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Trash2,
    QrCode,
    Search,
    Calendar,
    X,
    Phone,
    Mail,
    User,
    Users,
    Building2,
    BedDouble,
    Eye,
    CreditCard,
    Wallet,
    Clock,
    Check,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import BookingQRScanner from "@/components/hostelowner/qr/BookingQRScanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function BookingsPage() {
    const { user } = useAuth();
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
        enabled: !!user?.id,
        refetchInterval: 5000,
    });

    const { data: inquiries, isLoading: isInquiriesLoading } = useQuery({
        queryKey: ["ownerInquiries", user?.id],
        queryFn: () => getOwnerInquiries(),
        refetchInterval: 5000,
        enabled: view === "inquiries" && !!user?.id,
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

    // Formatting Helpers
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCurrency = (val?: string | number) => {
        if (!val) return "₹0";
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) return "₹0";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatRoomCategory = (category?: string, roomType?: number) => {
        if (!category) return roomType ? `Room #${roomType}` : "Standard Room";
        return category
            .replace(/non_ac/gi, "Non-AC")
            .replace(/\bac\b/gi, "AC")
            .replace(/_/g, " ")
            .replace(/-/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const getDurationNights = (checkInStr?: string, checkOutStr?: string) => {
        if (!checkInStr || !checkOutStr) return null;
        const inDate = new Date(checkInStr);
        const outDate = new Date(checkOutStr);
        const diffTime = outDate.getTime() - inDate.getTime();
        if (isNaN(diffTime) || diffTime <= 0) return null;
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${nights} Night${nights > 1 ? "s" : ""}`;
    };

    const getStatusMeta = (status: string) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return {
                    dotClass: "bg-emerald-500",
                    badgeClass:
                        "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
                    label: "Confirmed",
                };
            case "completed":
                return {
                    dotClass: "bg-blue-500",
                    badgeClass:
                        "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
                    label: "Completed",
                };
            case "cancelled":
                return {
                    dotClass: "bg-rose-500",
                    badgeClass:
                        "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
                    label: "Cancelled",
                };
            case "pending":
            default:
                return {
                    dotClass: "bg-amber-500 animate-pulse",
                    badgeClass:
                        "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
                    label: "Pending",
                };
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Manage Bookings
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Review guest reservations, track check-ins, and manage hostel inquiries.
                            </p>
                        </div>

                        <Button
                            onClick={() => setIsScanning(true)}
                            size="sm"
                            className="inline-flex items-center gap-2 text-xs font-semibold shadow-xs"
                        >
                            <QrCode size={15} />
                            Scan QR Check-In
                        </Button>
                    </div>

                    {/* View Toggle Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl w-fit overflow-x-auto border border-border/40">
                        <button
                            onClick={() => setView("bookings")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                view === "bookings"
                                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                            <span>Bookings</span>
                            {bookings && bookings.length > 0 && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        view === "bookings"
                                            ? "bg-primary-foreground/20 text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {bookings.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setView("inquiries")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                view === "inquiries"
                                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                            <span>Inquiries (Contact Owner)</span>
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-card p-4 rounded-xl border border-border/50 shadow-xs flex flex-wrap md:flex-nowrap gap-3 items-end">
                        <div className="flex-1 min-w-[220px] space-y-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Search size={12} /> Search Bookings
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name, email, mobile or ID..."
                                    className="w-full pl-3 pr-8 py-2 border border-border/60 bg-background rounded-lg text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={12} /> Date (From)
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-border/60 bg-background rounded-lg text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={12} /> Date (To)
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-border/60 bg-background rounded-lg text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="h-9 px-4 text-xs font-medium"
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Table Container */}
                    <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/40 border-b border-border/50">
                                    {view === "bookings" ? (
                                        <tr>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Booking ID
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Guest
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Hostel
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Room Type
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Dates
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Payment
                                            </th>
                                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-foreground tracking-wider uppercase pr-5">
                                                Status & Actions
                                            </th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Date
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Guest Details
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Hostel
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Message
                                            </th>
                                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                                Status
                                            </th>
                                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-foreground tracking-wider uppercase pr-5">
                                                Action
                                            </th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-border/40 bg-card">
                                    {view === "bookings" ? (
                                        <>
                                            {isLoading && (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-6 py-12 text-center text-xs text-muted-foreground"
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Clock size={16} className="animate-spin text-primary" />
                                                            <span>Loading reservations...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!isLoading && (!bookings || bookings.length === 0) && (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-6 py-12 text-center text-xs text-muted-foreground"
                                                    >
                                                        <div className="max-w-sm mx-auto space-y-2">
                                                            <BedDouble size={28} className="mx-auto text-muted-foreground/60" />
                                                            <p className="font-semibold text-foreground">No bookings found</p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {search
                                                                    ? "No reservations match your search or date criteria."
                                                                    : "You do not have any hostel bookings registered yet."}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!isLoading &&
                                                [...(bookings || [])]
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(b.created_at ?? b.check_in).getTime() -
                                                            new Date(a.created_at ?? a.check_in).getTime()
                                                    )
                                                    .map((b) => {
                                                        const statusMeta = getStatusMeta(b.status);
                                                        return (
                                                            <tr
                                                                key={b.id}
                                                                className="hover:bg-muted/30 transition-colors cursor-pointer"
                                                                onClick={() => setSelectedHostelBooking(b)}
                                                            >
                                                                {/* Booking ID */}
                                                                <td className="px-5 py-4 align-middle whitespace-nowrap">
                                                                    <div className="font-mono text-xs font-semibold text-foreground">
                                                                        STN-{b.id.substring(0, 8).toUpperCase()}
                                                                    </div>
                                                                    <div className="mt-1">
                                                                        <span
                                                                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block ${
                                                                                b.booking_type === "visit"
                                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                                                                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                                            }`}
                                                                        >
                                                                            {b.booking_type}
                                                                        </span>
                                                                    </div>
                                                                </td>

                                                                {/* Guest: Main Data Only (Name & Mobile) */}
                                                                <td className="px-5 py-4 align-middle whitespace-nowrap">
                                                                    <div className="text-sm font-semibold text-foreground capitalize">
                                                                        {b.guest_name}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                                        Mob:{" "}
                                                                        <a
                                                                            href={`tel:${b.mobile_number}`}
                                                                            className="text-cyan-700 dark:text-cyan-400 font-medium hover:underline"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            {b.mobile_number}
                                                                        </a>
                                                                    </div>
                                                                </td>

                                                                {/* Hostel: Main Data Only (Name) */}
                                                                <td className="px-5 py-4 align-middle whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-foreground">
                                                                        {b.hostel_name || `Hostel ID: ${b.hostel}`}
                                                                    </div>
                                                                </td>

                                                                {/* Room Type: Main Data Only (Category) */}
                                                                <td className="px-5 py-4 align-middle whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-foreground">
                                                                        {formatRoomCategory(b.room_category, b.room_type)}
                                                                    </div>
                                                                </td>

                                                                {/* Dates: Main Data Only */}
                                                                <td className="px-5 py-4 align-middle whitespace-nowrap text-xs text-muted-foreground">
                                                                    <div className="font-medium text-foreground">
                                                                        {formatDate(b.check_in)}
                                                                    </div>
                                                                    <div className="text-[11px] text-muted-foreground">
                                                                        to {formatDate(b.check_out)}
                                                                    </div>
                                                                </td>

                                                                {/* Payment */}
                                                                <td className="px-5 py-4 align-middle whitespace-nowrap">
                                                                    <div className="flex flex-col gap-1">
                                                                        {b.total_price && (
                                                                            <span className="text-xs font-semibold text-foreground tabular-nums">
                                                                                {formatCurrency(b.total_price)}
                                                                            </span>
                                                                        )}
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span
                                                                                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                                                                                    b.payment_method === "on_arrival"
                                                                                        ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                                                                                        : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                                                                                }`}
                                                                            >
                                                                                {b.payment_method === "on_arrival"
                                                                                    ? "Pay at Hostel"
                                                                                    : "Paid Online"}
                                                                            </span>
                                                                            <span
                                                                                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                                                                                    b.payment_status === "paid" ||
                                                                                    b.payment_status === "captured"
                                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                                                                        : b.payment_status === "failed"
                                                                                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                                                                                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                                                                }`}
                                                                            >
                                                                                {b.payment_status || "Pending"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                {/* Status & Actions */}
                                                                <td className="px-5 py-4 align-middle text-right pr-5 whitespace-nowrap">
                                                                    <div
                                                                        className="flex items-center justify-end gap-2"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {/* Status Selector */}
                                                                        <select
                                                                            value={b.status}
                                                                            onChange={(e) =>
                                                                                handleStatusChange(e, b.id)
                                                                            }
                                                                            disabled={
                                                                                statusMutation.isPending ||
                                                                                b.status === "completed" ||
                                                                                b.status === "cancelled"
                                                                            }
                                                                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer disabled:cursor-not-allowed ${
                                                                                b.status === "confirmed"
                                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                                                                    : b.status === "completed"
                                                                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-bold"
                                                                                    : b.status === "cancelled"
                                                                                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-bold"
                                                                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                                                            }`}
                                                                        >
                                                                            <option value="pending">Pending</option>
                                                                            <option value="confirmed">
                                                                                Confirmed
                                                                            </option>
                                                                            <option value="completed">
                                                                                Completed
                                                                            </option>
                                                                            <option value="cancelled">
                                                                                Cancelled
                                                                            </option>
                                                                        </select>

                                                                        {/* Details Action Button */}
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 text-xs gap-1 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedHostelBooking(b);
                                                                            }}
                                                                        >
                                                                            Details
                                                                            <ChevronRight size={12} />
                                                                        </Button>

                                                                        {/* Delete Button */}
                                                                        <button
                                                                            onClick={() => handleDelete(b.id)}
                                                                            className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all"
                                                                            title="Delete Booking"
                                                                            disabled={deleteMutation.isPending}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                        </>
                                    ) : (
                                        <>
                                            {isInquiriesLoading && (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="px-6 py-12 text-center text-xs text-muted-foreground"
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Clock size={16} className="animate-spin text-primary" />
                                                            <span>Loading inquiries...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!isInquiriesLoading && (!inquiries || inquiries.length === 0) && (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="px-6 py-12 text-center text-xs text-muted-foreground"
                                                    >
                                                        <div className="max-w-sm mx-auto space-y-2">
                                                            <Mail size={28} className="mx-auto text-muted-foreground/60" />
                                                            <p className="font-semibold text-foreground">No inquiries found</p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Guest inquiry requests from prospective hostel residents will appear here.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!isInquiriesLoading &&
                                                (Array.isArray(inquiries)
                                                    ? inquiries
                                                    : (inquiries as any)?.results || []
                                                )?.map((iq: any) => (
                                                    <tr key={iq.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-5 py-3.5 text-xs text-muted-foreground align-middle whitespace-nowrap">
                                                            {iq.created_at ? formatDate(iq.created_at) : "N/A"}
                                                        </td>
                                                        <td className="px-5 py-3.5 align-middle">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-xs text-foreground capitalize">
                                                                    {iq.guest_name}
                                                                </span>
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {iq.guest_email}
                                                                </span>
                                                                <a
                                                                    href={`tel:${iq.mobile_number}`}
                                                                    className="text-cyan-700 dark:text-cyan-400 font-medium text-[11px] flex items-center gap-1 mt-0.5 hover:underline"
                                                                >
                                                                    <Phone size={10} />
                                                                    {iq.mobile_number}
                                                                </a>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-xs text-foreground align-middle font-medium">
                                                            {iq.hostel_name || `Hostel #${iq.hostel}`}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate align-middle">
                                                            {iq.message || <span className="italic opacity-60">No message provided</span>}
                                                        </td>
                                                        <td className="px-5 py-3.5 align-middle">
                                                            <select
                                                                value={iq.status || "pending"}
                                                                onChange={(e) => handleInquiryStatusChange(e, iq.id)}
                                                                disabled={
                                                                    inquiryStatusMutation.isPending ||
                                                                    iq.status === "enquired"
                                                                }
                                                                className={`border rounded-lg px-2.5 py-1 text-xs bg-card disabled:opacity-60 disabled:cursor-not-allowed font-semibold uppercase tracking-wider ${
                                                                    iq.status === "enquired"
                                                                        ? "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/40"
                                                                        : "text-muted-foreground border-border/60"
                                                                }`}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="enquired">Enquired</option>
                                                                <option value="responded">Responded</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right pr-5 align-middle">
                                                            <a
                                                                href={`tel:${iq.mobile_number}`}
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                                            >
                                                                <Phone size={13} /> Call Guest
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Hostel Booking Details Modal */}
                    <Dialog
                        open={!!selectedHostelBooking}
                        onOpenChange={(open) => !open && setSelectedHostelBooking(null)}
                    >
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg sm:rounded-lg border border-border/80 shadow-2xl p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]">
                            {selectedHostelBooking && (
                                <>
                                    <DialogHeader className="border-b pb-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <DialogTitle className="text-lg font-bold tracking-tight">
                                                        Reservation Details #STN-{selectedHostelBooking.id.substring(0, 8).toUpperCase()}
                                                    </DialogTitle>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                                            getStatusMeta(selectedHostelBooking.status).badgeClass
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                getStatusMeta(selectedHostelBooking.status).dotClass
                                                            }`}
                                                        />
                                                        {getStatusMeta(selectedHostelBooking.status).label}
                                                    </span>
                                                </div>
                                                <DialogDescription className="text-xs">
                                                    {selectedHostelBooking.created_at
                                                        ? `Booked on ${formatDate(selectedHostelBooking.created_at)}`
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
                                                        {selectedHostelBooking.hostel_name ||
                                                            `Hostel Property #${selectedHostelBooking.hostel}`}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Room Category: {formatRoomCategory(selectedHostelBooking.room_category, selectedHostelBooking.room_type)}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs rounded-md uppercase font-semibold"
                                                >
                                                    {selectedHostelBooking.booking_type}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                        Check-In Date
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {formatDate(selectedHostelBooking.check_in)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                        Check-Out Date
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {formatDate(selectedHostelBooking.check_out)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                        Stay Duration
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {getDurationNights(
                                                            selectedHostelBooking.check_in,
                                                            selectedHostelBooking.check_out
                                                        ) || "N/A"}
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
                                                        {selectedHostelBooking.guest_name || "N/A"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground text-[10px] block">
                                                        Contact Phone
                                                    </span>
                                                    <a
                                                        href={`tel:${selectedHostelBooking.mobile_number}`}
                                                        className="font-medium text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <Phone size={11} />
                                                        {selectedHostelBooking.mobile_number || "N/A"}
                                                    </a>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground text-[10px] block">
                                                        Email Address
                                                    </span>
                                                    <a
                                                        href={`mailto:${selectedHostelBooking.guest_email}`}
                                                        className="font-medium text-foreground truncate block hover:text-primary"
                                                    >
                                                        {selectedHostelBooking.guest_email || "N/A"}
                                                    </a>
                                                </div>

                                                <div className="col-span-full pt-2 border-t border-border/40 flex items-center gap-4 text-muted-foreground text-[11px]">
                                                    <span>Age: {selectedHostelBooking.guest_age || "N/A"} yrs</span>
                                                    <span>Adults: {selectedHostelBooking.adults || 1}</span>
                                                    <span>Children: {selectedHostelBooking.children || 0}</span>
                                                    <span>Total Headcount: {selectedHostelBooking.guests_count || 1}</span>
                                                </div>
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
                                                        {formatCurrency(selectedHostelBooking.total_price)}
                                                    </span>
                                                </div>

                                                <div className="pt-2.5 border-t border-border/50 flex justify-between items-center text-sm font-bold">
                                                    <span>Total Amount</span>
                                                    <span className="text-base text-foreground tabular-nums">
                                                        {formatCurrency(selectedHostelBooking.total_price)}
                                                    </span>
                                                </div>

                                                <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span className="capitalize">
                                                        Payment Method:{" "}
                                                        {selectedHostelBooking.payment_method === "on_arrival"
                                                            ? "Pay at Hostel"
                                                            : "Paid Online"}
                                                    </span>
                                                    <span className="capitalize">
                                                        Payment Status:{" "}
                                                        {selectedHostelBooking.payment_status || "Pending"}
                                                    </span>
                                                </div>

                                                {selectedHostelBooking.payment_id && (
                                                    <div className="text-[10px] text-muted-foreground font-mono pt-1">
                                                        Transaction Ref: {selectedHostelBooking.payment_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="border-t pt-3 flex items-center justify-between">
                                        {selectedHostelBooking.status !== "completed" &&
                                        selectedHostelBooking.status !== "cancelled" ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                                disabled={checkInMutation.isPending}
                                                onClick={() => {
                                                    checkInMutation.mutate(
                                                        `STN-${selectedHostelBooking.id.substring(0, 8).toUpperCase()}`
                                                    );
                                                    setSelectedHostelBooking(null);
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
                                            onClick={() => setSelectedHostelBooking(null)}
                                            className="text-xs"
                                        >
                                            Close
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* QR Code Check-In Scanner Modal */}
                    {isScanning && (
                        <BookingQRScanner
                            onScan={handleQRScan}
                            onClose={() => setIsScanning(false)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
