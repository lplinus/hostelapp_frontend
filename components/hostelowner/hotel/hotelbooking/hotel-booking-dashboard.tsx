"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMyHotels,
    getMyHotelBookings,
    cancelHotelBooking,
} from "@/services/hotelservices/hotel.service";
import type {
    HotelBooking,
    HotelBookingStatus,
} from "@/types/hotel.types";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Hotel,
    Building2,
    Calendar,
    Search,
    RefreshCw,
    X,
    Clock,
    User,
    Phone,
    Mail,
    BedDouble,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Receipt,
    Sparkles,
    ChevronRight,
    MapPin,
    ShieldCheck,
    ArrowUpRight,
    Ban,
    DollarSign,
    FileCheck2,
    ExternalLink,
    Lock,
    Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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

export interface HotelBookingDashboardProps {
    hideTopTabs?: boolean;
}

export default function HotelBookingDashboard({ hideTopTabs = false }: HotelBookingDashboardProps = {}) {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isAuthenticated = !!user && tokenManager.getAuthFlag() === "authenticated";
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: hotels = [] } = useQuery({
        queryKey: ["myHotelsList", user?.id],
        queryFn: () => getMyHotels(),
        enabled: isAuthenticated && !hideTopTabs && !!user?.id,
    });

    const totalRoomsCount = hotels.reduce(
        (acc, h) => acc + (h.room_types?.length || 0),
        0
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<HotelBookingStatus | "all">("all");
    const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const {
        data: bookings = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ["hotelBookings", user?.id, selectedStatus],
        queryFn: () => getMyHotelBookings({
            status: selectedStatus === "all" ? undefined : selectedStatus,
        }),
        enabled: isAuthenticated && !!user?.id,
        refetchInterval: isAuthenticated ? 6000 : false,
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            cancelHotelBooking(id, reason),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["hotelBookings"] });
            toast.success("Reservation cancelled successfully", {
                description: `Booking #${updated.booking_reference} has been cancelled.`,
            });
            setIsCancelModalOpen(false);
            setCancelReason("");
            if (selectedBooking && selectedBooking.id === updated.id) {
                setSelectedBooking(updated);
            }
        },
        onError: (error: any) => {
            const msg =
                error?.response?.data?.detail ||
                error?.message ||
                "Failed to cancel booking. Please try again.";
            toast.error(msg);
        },
    });

    // Formatting Helpers
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCurrency = (val: string | number) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) return "₹0";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(num);
    };

    const getStatusVariant = (
        status: HotelBookingStatus
    ): {
        badgeVariant: "default" | "secondary" | "destructive" | "outline";
        dotClass: string;
        textClass: string;
        label: string;
    } => {
        switch (status) {
            case "confirmed":
                return {
                    badgeVariant: "default",
                    dotClass: "bg-emerald-500",
                    textClass: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
                    label: "Confirmed",
                };
            case "checked_in":
                return {
                    badgeVariant: "secondary",
                    dotClass: "bg-amber-500 animate-pulse",
                    textClass: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
                    label: "Checked In",
                };
            case "completed":
                return {
                    badgeVariant: "outline",
                    dotClass: "bg-blue-500",
                    textClass: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
                    label: "Completed",
                };
            case "cancelled":
                return {
                    badgeVariant: "destructive",
                    dotClass: "bg-rose-500",
                    textClass: "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
                    label: "Cancelled",
                };
            case "pending":
            default:
                return {
                    badgeVariant: "outline",
                    dotClass: "bg-slate-400",
                    textClass: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                    label: "Pending",
                };
        }
    };

    // Filter by client search query
    const filteredBookings = bookings.filter((b) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const refMatch = b.booking_reference.toLowerCase().includes(query);
        const hotelMatch = b.hotel_name?.toLowerCase().includes(query);
        const roomMatch = b.room_type_name?.toLowerCase().includes(query);
        const guestMatch = b.guest_details?.guest_name.toLowerCase().includes(query);
        return refMatch || hotelMatch || roomMatch || guestMatch;
    });

    // KPI Metrics
    const totalBookingsCount = bookings.length;
    const activeStaysCount = bookings.filter((b) => b.status === "checked_in").length;
    const upcomingCount = bookings.filter((b) => b.status === "confirmed").length;
    const totalSpentAmount = bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + parseFloat(b.total_amount || "0"), 0);

    const statusOptions: Array<{ key: HotelBookingStatus | "all"; label: string }> = [
        { key: "all", label: "All Bookings" },
        { key: "confirmed", label: "Confirmed" },
        { key: "checked_in", label: "Checked In" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
    ];

    const renderTopTabs = () => (
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5 sm:pb-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/80 shadow-2xs w-full sm:w-auto max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth [-webkit-overflow-scrolling:touch]">
                {/* 1. Hotel Properties */}
                <button
                    type="button"
                    onClick={() => router.replace("/hotel?tab=property")}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-none justify-center min-w-0 sm:shrink-0 whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800"
                >
                    <Building2 size={15} />
                    <span className="sm:hidden">Hotels</span><span className="hidden sm:inline">Hotel Properties</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {isMounted ? hotels.length : 0}
                    </span>
                </button>

                {/* 2. Rooms & Units */}
                <button
                    type="button"
                    onClick={() => router.replace("/hotel?tab=rooms")}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-none justify-center min-w-0 sm:shrink-0 whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800"
                >
                    <BedDouble size={15} />
                    <span className="sm:hidden">Rooms</span><span className="hidden sm:inline">Rooms & Units</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {isMounted ? totalRoomsCount : 0}
                    </span>
                </button>

                {/* 3. Hotel Bookings */}
                <button
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-none justify-center min-w-0 sm:shrink-0 whitespace-nowrap bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border"
                >
                    <Calendar size={15} className="text-[#312E81] dark:text-indigo-400" />
                    <span className="sm:hidden">Bookings</span><span className="hidden sm:inline">Hotel Bookings</span>
                    {bookings.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {bookings.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {!hideTopTabs && renderTopTabs()}
            {/* Page Header */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="hidden sm:flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles size={12} className="text-amber-500" />
                            Luxury & Suites
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border">
                            Hotel Reservations
                        </span>
                    </div>
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Hotel Bookings
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        <span className="sm:hidden">Reservations & receipts</span>
                        <span className="hidden sm:inline">Manage your hotel stays, room reservations, invoices, and payment receipts.</span>
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="gap-2 text-xs"
                    >
                        <RefreshCw size={13} className={isRefetching ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>

                    <Button
                        asChild
                        size="sm"
                        className="gap-2 text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-sm"
                    >
                        <Link href="/city">
                            <Hotel size={14} />
                            <span className="sm:hidden">Explore</span>
                            <span className="hidden sm:inline">Explore Hotels</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                    <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Bookings</p>
                            <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">
                                {isMounted ? totalBookingsCount : 0}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 truncate">All-time stays</p>
                        </div>
                        <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Hotel size={15} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                    <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Active Stays</p>
                            <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                                {isMounted ? activeStaysCount : 0}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 truncate">Checked in</p>
                        </div>
                        <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <BedDouble size={15} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                    <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Upcoming Stays</p>
                            <p className="text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums leading-none">
                                {isMounted ? upcomingCount : 0}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 truncate">Future check-ins</p>
                        </div>
                        <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Calendar size={15} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                    <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Spent</p>
                            <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">
                                {isMounted ? formatCurrency(totalSpentAmount) : "₹0"}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 truncate">Total revenue</p>
                        </div>
                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <CreditCard size={15} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs & Search Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth [-webkit-overflow-scrolling:touch] w-0 min-w-full md:w-auto md:min-w-0">
                    {statusOptions.map((opt) => {
                        const isSelected = selectedStatus === opt.key;
                        const count =
                            opt.key === "all"
                                ? bookings.length
                                : bookings.filter((b) => b.status === opt.key).length;

                        return (
                            <button
                                key={opt.key}
                                onClick={() => setSelectedStatus(opt.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${isSelected
                                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <span>{opt.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-72 shrink-0">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="text"
                        placeholder="Search ref, hotel, or guest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-8 text-xs h-9 bg-card border-border/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Bookings Table / Listing */}
            {!isMounted || isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border/40">
                            <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
                                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredBookings.length === 0 ? (
                <Card className="border-border/40 bg-card p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                            <Hotel size={26} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-semibold text-foreground">
                                {searchQuery ? "No matching hotel reservations" : "No hotel bookings found"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {searchQuery
                                    ? `We couldn't find any reservation matching "${searchQuery}". Try a different keyword.`
                                    : "You haven't reserved any hotel rooms yet. Discover premier suites and boutique hotels."}
                            </p>
                        </div>
                        {searchQuery ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="text-xs"
                            >
                                Clear Search
                            </Button>
                        ) : (
                            <Button
                                asChild
                                size="sm"
                                className="text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white"
                            >
                                <Link href="/city">
                                    Browse Hotels
                                </Link>
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs w-0 min-w-full">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-xs text-foreground py-3.5">
                                    Booking Reference
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Hotel & Room Type
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Stay Schedule
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Guests
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Total Amount
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="text-right font-semibold text-xs text-foreground pr-4">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.map((b) => {
                                const statusMeta = getStatusVariant(b.status);
                                return (
                                    <TableRow
                                        key={b.id}
                                        className="group hover:bg-muted/30 cursor-pointer transition-colors"
                                        onClick={() => setSelectedBooking(b)}
                                    >
                                        {/* Booking Reference */}
                                        <TableCell className="py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    #{b.booking_reference}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatDate(b.created_at)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Hotel & Room Type */}
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                                    <Hotel size={14} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                                                        {b.hotel_name || "Hotel Reservation"}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground truncate">
                                                        {b.room_type_name || "Standard Room"} • {b.number_of_rooms} Room(s)
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Schedule */}
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                                                    {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {b.number_of_nights} Night{b.number_of_nights > 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Guests */}
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                                                    {b.guest_details?.guest_name || "Guest"}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {b.guest_details?.adults_count || 1} Adult(s)
                                                    {b.guest_details?.children_count ? `, ${b.guest_details.children_count} Child` : ""}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Total Amount */}
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-semibold text-foreground tabular-nums">
                                                    {formatCurrency(b.total_amount)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground capitalize">
                                                    {b.payment_details?.payment_method?.replace(/_/g, " ") || "Pay at property"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.textClass}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                                {statusMeta.label}
                                            </span>
                                        </TableCell>

                                        {/* Action Button */}
                                        <TableCell className="text-right pr-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs gap-1 border border-border/80 text-foreground bg-card/60 hover:bg-[#1F1E1B] hover:text-[#EDE8DF] hover:border-[#1F1E1B] group-hover:bg-[#1F1E1B] group-hover:text-[#EDE8DF] group-hover:border-[#1F1E1B] dark:hover:bg-[#2A2926] dark:hover:text-[#EDE8DF] dark:hover:border-[#3D3A34] dark:group-hover:bg-[#2A2926] dark:group-hover:text-[#EDE8DF] dark:group-hover:border-[#3D3A34] transition-all cursor-pointer shadow-2xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBooking(b);
                                                }}
                                            >
                                                Details
                                                <ChevronRight size={12} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Booking Details Dialog */}
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
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusVariant(selectedBooking.status).textClass
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${getStatusVariant(selectedBooking.status).dotClass
                                                        }`}
                                                />
                                                {getStatusVariant(selectedBooking.status).label}
                                            </span>
                                        </div>
                                        <DialogDescription className="text-xs">
                                            Booked on {formatDate(selectedBooking.created_at)}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-5 py-2">
                                {/* Hotel & Stay Specs */}
                                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Hotel size={16} className="text-amber-500" />
                                                {selectedBooking.hotel_name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Room Category: {selectedBooking.room_type_name}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs rounded-md">
                                            {selectedBooking.number_of_rooms} Room(s)
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                Check-In Date
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatDate(selectedBooking.check_in_date)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                Check-Out Date
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatDate(selectedBooking.check_out_date)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                Duration
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {selectedBooking.number_of_nights} Night(s)
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
                                            <span className="text-muted-foreground text-[10px] block">Primary Guest</span>
                                            <span className="font-medium text-foreground">
                                                {selectedBooking.guest_details?.guest_name || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-[10px] block">Contact Phone</span>
                                            <span className="font-medium text-foreground">
                                                {selectedBooking.guest_details?.mobile_number || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-[10px] block">Email Address</span>
                                            <span className="font-medium text-foreground truncate block">
                                                {selectedBooking.guest_details?.guest_email || "N/A"}
                                            </span>
                                        </div>
                                        {selectedBooking.guest_details?.special_requests && (
                                            <div className="col-span-full pt-2 border-t border-border/40">
                                                <span className="text-muted-foreground text-[10px] block">
                                                    Special Requests
                                                </span>
                                                <p className="text-xs text-foreground italic mt-0.5">
                                                    "{selectedBooking.guest_details.special_requests}"
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
                                                <CheckCircle2 size={11} /> Authorized by Guest
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
                                                            name: selectedBooking.guest_id_document!.file_name || "Guest_Aadhaar_Document",
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

                                {/* Itemized Payment Breakdown */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Receipt size={13} />
                                        Pricing Breakdown
                                    </h4>
                                    <div className="p-4 rounded-lg border border-border/50 bg-card space-y-2.5 text-xs">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>
                                                Room Rate × {selectedBooking.number_of_nights} Night(s) ×{" "}
                                                {selectedBooking.number_of_rooms} Room(s)
                                            </span>
                                            <span className="font-medium text-foreground tabular-nums">
                                                {formatCurrency(
                                                    selectedBooking.payment_details?.stay_subtotal ||
                                                    selectedBooking.total_amount
                                                )}
                                            </span>
                                        </div>

                                        {selectedBooking.payment_details?.taxes_and_fees &&
                                            parseFloat(selectedBooking.payment_details.taxes_and_fees) > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Taxes & Service Hospitality Fees</span>
                                                    <span className="font-medium text-foreground tabular-nums">
                                                        {formatCurrency(selectedBooking.payment_details.taxes_and_fees)}
                                                    </span>
                                                </div>
                                            )}

                                        {selectedBooking.payment_details?.discount_amount &&
                                            parseFloat(selectedBooking.payment_details.discount_amount) > 0 && (
                                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                    <span>Promotional Discount</span>
                                                    <span className="font-medium tabular-nums">
                                                        -{formatCurrency(selectedBooking.payment_details.discount_amount)}
                                                    </span>
                                                </div>
                                            )}

                                        <div className="pt-2.5 border-t border-border/50 flex justify-between items-center text-sm font-bold">
                                            <span>Total Amount</span>
                                            <span className="text-base text-foreground tabular-nums">
                                                {formatCurrency(selectedBooking.total_amount)}
                                            </span>
                                        </div>

                                        <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>Payment Method: {selectedBooking.payment_details?.payment_method_display || "Pay at Property"}</span>
                                            <span className="capitalize">
                                                Status: {selectedBooking.payment_details?.payment_status_display || "Pending"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cancellation Record (if cancelled) */}
                                {selectedBooking.cancellation_details && (
                                    <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5 text-xs text-rose-800 dark:text-rose-200">
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <AlertCircle size={14} />
                                            <span>Reservation Cancelled</span>
                                        </div>
                                        <p className="text-[11px]">
                                            Reason: {selectedBooking.cancellation_details.reason}
                                        </p>
                                        <p className="text-[10px] opacity-80">
                                            Cancelled at: {formatDate(selectedBooking.cancellation_details.cancelled_at)} • Refund:{" "}
                                            {formatCurrency(selectedBooking.cancellation_details.refund_amount)} ({selectedBooking.cancellation_details.refund_status_display})
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="border-t pt-3 flex items-center justify-between">
                                {selectedBooking.status !== "cancelled" &&
                                    selectedBooking.status !== "completed" ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="text-xs gap-1.5"
                                        onClick={() => setIsCancelModalOpen(true)}
                                    >
                                        <Ban size={13} />
                                        Cancel Reservation
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBooking(null)}
                                    className="text-xs"
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Modal */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="max-w-md rounded-lg sm:rounded-lg border border-border/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                            <AlertCircle size={18} />
                            Cancel Hotel Stay
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Are you sure you want to cancel booking #{selectedBooking?.booking_reference}?
                            Your room will be released back to hotel inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-xs font-medium text-foreground block">
                            Reason for cancellation (Optional):
                        </label>
                        <Input
                            placeholder="Change of plans, schedule clash, etc..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="text-xs h-9"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCancelModalOpen(false)}
                            disabled={cancelMutation.isPending}
                            className="text-xs"
                        >
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancelMutation.isPending}
                            onClick={() => {
                                if (selectedBooking) {
                                    cancelMutation.mutate({
                                        id: selectedBooking.id,
                                        reason: cancelReason.trim() || "Cancelled by guest",
                                    });
                                }
                            }}
                            className="text-xs gap-1.5"
                        >
                            {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
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
        </div>
    );
}
