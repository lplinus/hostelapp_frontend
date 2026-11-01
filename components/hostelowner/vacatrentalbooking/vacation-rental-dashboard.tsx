"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
import {
    Home,
    Palmtree,
    Calendar,
    Search,
    RefreshCw,
    X,
    Clock,
    User,
    Users,
    Phone,
    Mail,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Receipt,
    Sparkles,
    ChevronRight,
    MapPin,
    ShieldCheck,
    Ban,
    Check,
    CheckCheck,
    Bed,
    Building,
    Compass,
    PawPrint,
    Baby,
    Sparkle,
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

export default function VacationRentalDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isAuthenticated = !!user && tokenManager.getAuthFlag() === "authenticated";

    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    // View Perspective: Guest trips vs Host inquiries
    const [perspective, setPerspective] = useState<"guest" | "host">(
        tabParam === "property" ? "host" : "guest"
    );

    useEffect(() => {
        if (tabParam === "property" && perspective !== "host") {
            setPerspective("host");
        } else if (tabParam === "bookings" && perspective !== "guest") {
            setPerspective("guest");
        }
    }, [tabParam, perspective]);

    const handlePerspectiveChange = (newPerspective: "guest" | "host") => {
        setPerspective(newPerspective);
        const targetTab = newPerspective === "host" ? "property" : "bookings";
        router.replace(`/vacanrentalbooking?tab=${targetTab}`, { scroll: false });
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<VacationRentalBookingStatus | "all">("all");
    const [selectedBooking, setSelectedBooking] = useState<VacationRentalBooking | null>(null);

    // Modals
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState("");

    // Queries
    const {
        data: guestBookings = [],
        isLoading: isGuestLoading,
        isRefetching: isGuestRefetching,
        refetch: refetchGuest,
    } = useQuery({
        queryKey: ["vacationRentalBookings", "guest", selectedStatus],
        queryFn: () =>
            getMyVacationRentalBookings({
                status: selectedStatus === "all" ? undefined : selectedStatus,
            }),
        enabled: isAuthenticated && perspective === "guest",
        refetchInterval: isAuthenticated ? 6000 : false,
    });

    const {
        data: hostedBookings = [],
        isLoading: isHostLoading,
        isRefetching: isHostRefetching,
        refetch: refetchHost,
    } = useQuery({
        queryKey: ["vacationRentalBookings", "host", selectedStatus],
        queryFn: () =>
            getHostedVacationRentalBookings({
                status: selectedStatus === "all" ? undefined : selectedStatus,
            }),
        enabled: isAuthenticated && perspective === "host",
        refetchInterval: isAuthenticated ? 6000 : false,
    });

    const activeList = perspective === "guest" ? guestBookings : hostedBookings;
    const isLoading = perspective === "guest" ? isGuestLoading : isHostLoading;
    const isRefetching = perspective === "guest" ? isGuestRefetching : isHostRefetching;
    const refetch = perspective === "guest" ? refetchGuest : refetchHost;

    // Mutations
    const approveMutation = useMutation({
        mutationFn: (id: string) => approveVacationRentalBooking(id),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["vacationRentalBookings"] });
            toast.success("Reservation approved!", {
                description: `Booking #${updated.booking_reference} confirmed & dates locked.`,
            });
            if (selectedBooking && selectedBooking.id === updated.id) {
                setSelectedBooking(updated);
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || "Failed to approve reservation.");
        },
    });

    const declineMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            declineVacationRentalBooking(id, reason),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["vacationRentalBookings"] });
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
            toast.error(err?.response?.data?.detail || "Failed to decline reservation.");
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            cancelVacationRentalBooking(id, reason),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ["vacationRentalBookings"] });
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
            toast.error(err?.response?.data?.detail || "Failed to cancel reservation.");
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
        status: VacationRentalBookingStatus
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
            case "pending_approval":
                return {
                    badgeVariant: "secondary",
                    dotClass: "bg-amber-500 animate-pulse",
                    textClass: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
                    label: "Pending Approval",
                };
            case "checked_in":
                return {
                    badgeVariant: "default",
                    dotClass: "bg-indigo-500",
                    textClass: "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
                    label: "Checked In",
                };
            case "completed":
                return {
                    badgeVariant: "outline",
                    dotClass: "bg-blue-500",
                    textClass: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
                    label: "Completed",
                };
            case "declined":
                return {
                    badgeVariant: "destructive",
                    dotClass: "bg-orange-500",
                    textClass: "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
                    label: "Declined",
                };
            case "cancelled":
                return {
                    badgeVariant: "destructive",
                    dotClass: "bg-rose-500",
                    textClass: "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
                    label: "Cancelled",
                };
            default:
                return {
                    badgeVariant: "outline",
                    dotClass: "bg-slate-400",
                    textClass: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                    label: "Pending",
                };
        }
    };

    // Client filtering
    const filteredBookings = activeList.filter((b) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const refMatch = b.booking_reference.toLowerCase().includes(query);
        const titleMatch = b.rental_title?.toLowerCase().includes(query);
        const guestMatch = b.guest_details?.guest_name.toLowerCase().includes(query);
        return refMatch || titleMatch || guestMatch;
    });

    // KPI Metrics
    const totalCount = activeList.length;
    const upcomingCount = activeList.filter((b) => b.status === "confirmed").length;
    const pendingCount = activeList.filter((b) => b.status === "pending_approval").length;
    const totalFolioSum = activeList
        .filter((b) => b.status !== "cancelled" && b.status !== "declined")
        .reduce((sum, b) => sum + parseFloat(b.total_price || "0"), 0);

    const statusOptions: Array<{ key: VacationRentalBookingStatus | "all"; label: string }> = [
        { key: "all", label: "All Reservations" },
        { key: "confirmed", label: "Confirmed" },
        { key: "pending_approval", label: "Pending Approval" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <Palmtree size={12} className="text-rose-500" />
                            Airbnb Style Stays
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border">
                            Vacation Rentals
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Vacation Rental Bookings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage private villas, holiday homes, guest trips, and host approvals.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Perspective Switcher */}
                    <div className="flex items-center p-0.5 bg-muted rounded-xl border">
                        <button
                            onClick={() => handlePerspectiveChange("guest")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${perspective === "guest"
                                    ? "bg-card text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Compass size={13} />
                            My Trips
                        </button>
                        <button
                            onClick={() => handlePerspectiveChange("host")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${perspective === "host"
                                    ? "bg-card text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Home size={13} />
                            Host Inquiries
                        </button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="gap-2 text-xs"
                    >
                        <RefreshCw size={13} className={isRefetching ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                {perspective === "guest" ? "Total Trips" : "Total Requests"}
                            </p>
                            <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Vacation reservations</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <Palmtree size={18} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Confirmed Stays</p>
                            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {upcomingCount}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Upcoming locked dates</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCheck size={18} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Pending Approval</p>
                            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                                {pendingCount}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {perspective === "guest" ? "Awaiting host" : "Action required"}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Clock size={18} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                {perspective === "guest" ? "Total Vacation Spend" : "Host Revenue"}
                            </p>
                            <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                {formatCurrency(totalFolioSum)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Total booking value</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <CreditCard size={18} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {statusOptions.map((opt) => {
                        const isSelected = selectedStatus === opt.key;
                        const count =
                            opt.key === "all"
                                ? activeList.length
                                : activeList.filter((b) => b.status === opt.key).length;

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
                        placeholder="Search ref, rental, or guest..."
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
            {isLoading ? (
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
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                            <Palmtree size={26} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-semibold text-foreground">
                                {searchQuery
                                    ? "No matching vacation rentals found"
                                    : perspective === "guest"
                                        ? "No vacation trips reserved yet"
                                        : "No host inquiries received yet"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {searchQuery
                                    ? `No reservations matching "${searchQuery}". Please check spelling or filters.`
                                    : perspective === "guest"
                                        ? "Book private beach houses, scenic villas, and cozy hillside retreats."
                                        : "When guests book your vacation rental properties, their requests will appear here."}
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
                        ) : perspective === "guest" ? (
                            <Button
                                asChild
                                size="sm"
                                className="text-xs bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white"
                            >
                                <Link href="/city">
                                    Discover Getaways
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </Card>
            ) : (
                <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-xs text-foreground py-3.5">
                                    Reservation Code
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Rental Property
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Stay Dates
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Guests
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Total Folio
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="text-right font-semibold text-xs text-foreground pr-4">
                                    Actions
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
                                        {/* Reference */}
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

                                        {/* Property Title */}
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                                                    <Palmtree size={14} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-semibold text-foreground truncate max-w-[220px]">
                                                        {b.rental_title || "Vacation Rental Property"}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground truncate">
                                                        Private Stay
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Dates */}
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
                                                    {b.guest_details?.total_guests || 1} Guest(s)
                                                    {b.guest_details?.pets ? " • Pets 🐾" : ""}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Pricing */}
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-semibold text-foreground tabular-nums">
                                                    {formatCurrency(b.total_price)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground capitalize">
                                                    {b.pricing_details?.payment_method?.replace(/_/g, " ") || "Online"}
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

                                        {/* Actions */}
                                        <TableCell className="text-right pr-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* If Host and Pending Approval: Show one-click approve/decline */}
                                                {perspective === "host" && b.status === "pending_approval" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                approveMutation.mutate(b.id);
                                                            }}
                                                            disabled={approveMutation.isPending}
                                                        >
                                                            <Check size={12} />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 gap-1 px-2.5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedBooking(b);
                                                                setIsDeclineModalOpen(true);
                                                            }}
                                                        >
                                                            <X size={12} />
                                                            Decline
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs gap-1 group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBooking(b);
                                                    }}
                                                >
                                                    Folio
                                                    <ChevronRight size={12} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Folio & Details Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedBooking && (
                        <>
                            <DialogHeader className="border-b pb-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <DialogTitle className="text-lg font-bold tracking-tight">
                                                Vacation Folio #{selectedBooking.booking_reference}
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
                                            Reserved on {formatDate(selectedBooking.created_at)}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-5 py-2">
                                {/* Property & Schedule Info */}
                                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Palmtree size={16} className="text-rose-500" />
                                                {selectedBooking.rental_title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Entire Vacation Home / Villa
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {selectedBooking.number_of_nights} Night Stay
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                Check-In
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatDate(selectedBooking.check_in_date)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                Check-Out
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatDate(selectedBooking.check_out_date)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                                                Headcount
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {selectedBooking.guest_details?.total_guests || 1} Total Guest(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Information */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <User size={13} />
                                        Guest Breakdown
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/50 bg-card text-xs">
                                        <div>
                                            <span className="text-muted-foreground text-[10px] block">Primary Guest</span>
                                            <span className="font-medium text-foreground">
                                                {selectedBooking.guest_details?.guest_name || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-[10px] block">Contact Mobile</span>
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

                                        <div className="col-span-full pt-2 border-t border-border/40 flex items-center gap-4 text-muted-foreground text-[11px]">
                                            <span>Adults: {selectedBooking.guest_details?.adults || 1}</span>
                                            <span>Children: {selectedBooking.guest_details?.children || 0}</span>
                                            <span>Infants: {selectedBooking.guest_details?.infants || 0}</span>
                                            <span>Pets: {selectedBooking.guest_details?.pets || 0}</span>
                                        </div>

                                        {selectedBooking.guest_details?.special_requests && (
                                            <div className="col-span-full pt-2 border-t border-border/40">
                                                <span className="text-muted-foreground text-[10px] block">
                                                    Special Guest Note
                                                </span>
                                                <p className="text-xs text-foreground italic mt-0.5">
                                                    "{selectedBooking.guest_details.special_requests}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Airbnb Pricing Folio */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Receipt size={13} />
                                        Airbnb Itemized Receipt
                                    </h4>
                                    <div className="p-4 rounded-xl border border-border/50 bg-card space-y-2.5 text-xs">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>
                                                Nightly Base Rate × {selectedBooking.number_of_nights} Night(s)
                                            </span>
                                            <span className="font-medium text-foreground tabular-nums">
                                                {formatCurrency(
                                                    selectedBooking.pricing_details?.stay_subtotal ||
                                                    selectedBooking.total_price
                                                )}
                                            </span>
                                        </div>

                                        {selectedBooking.pricing_details?.cleaning_fee &&
                                            parseFloat(selectedBooking.pricing_details.cleaning_fee) > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Cleaning Fee</span>
                                                    <span className="font-medium text-foreground tabular-nums">
                                                        {formatCurrency(selectedBooking.pricing_details.cleaning_fee)}
                                                    </span>
                                                </div>
                                            )}

                                        {selectedBooking.pricing_details?.service_fee &&
                                            parseFloat(selectedBooking.pricing_details.service_fee) > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Airbnb Platform & Host Service Fee</span>
                                                    <span className="font-medium text-foreground tabular-nums">
                                                        {formatCurrency(selectedBooking.pricing_details.service_fee)}
                                                    </span>
                                                </div>
                                            )}

                                        {selectedBooking.pricing_details?.discount_amount &&
                                            parseFloat(selectedBooking.pricing_details.discount_amount) > 0 && (
                                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                    <span>Weekly/Monthly Stay Discount</span>
                                                    <span className="font-medium tabular-nums">
                                                        -{formatCurrency(selectedBooking.pricing_details.discount_amount)}
                                                    </span>
                                                </div>
                                            )}

                                        <div className="pt-2.5 border-t border-border/50 flex justify-between items-center text-sm font-bold">
                                            <span>Total Reservation Price</span>
                                            <span className="text-base text-foreground tabular-nums">
                                                {formatCurrency(selectedBooking.total_price)}
                                            </span>
                                        </div>

                                        <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>
                                                Method: {selectedBooking.pricing_details?.payment_method_display || "Online"}
                                            </span>
                                            <span className="capitalize">
                                                Payment Status: {selectedBooking.pricing_details?.payment_status_display || "Pending"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cancellation Record if any */}
                                {selectedBooking.cancellation_details && (
                                    <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5 text-xs text-rose-800 dark:text-rose-200">
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <AlertCircle size={14} />
                                            <span>Stay Cancelled or Declined</span>
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
                                {/* Host Actions */}
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
                                            <X size={13} />
                                            Decline
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
                                    Close Folio
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Modal (for Guest or Host) */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                            <AlertCircle size={18} />
                            Cancel Vacation Rental Stay
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Are you sure you want to cancel reservation #{selectedBooking?.booking_reference}?
                            The calendar dates will be restored for other guests.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-xs font-medium text-foreground block">
                            Reason for cancellation (Optional):
                        </label>
                        <Input
                            placeholder="Travel plan changes, emergency, etc..."
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
                            Keep Reservation
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancelMutation.isPending}
                            onClick={() => {
                                if (selectedBooking) {
                                    cancelMutation.mutate({
                                        id: selectedBooking.id,
                                        reason: cancelReason.trim() || "Cancelled by user",
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

            {/* Host Decline Modal */}
            <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                            <AlertCircle size={18} />
                            Decline Reservation Request
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Are you sure you want to decline this booking request from{" "}
                            {selectedBooking?.guest_details?.guest_name || "the guest"}?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-xs font-medium text-foreground block">
                            Reason for declining (Optional):
                        </label>
                        <Input
                            placeholder="Property under maintenance, minimum nights not met..."
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            className="text-xs h-9"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeclineModalOpen(false)}
                            disabled={declineMutation.isPending}
                            className="text-xs"
                        >
                            Back
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={declineMutation.isPending}
                            onClick={() => {
                                if (selectedBooking) {
                                    declineMutation.mutate({
                                        id: selectedBooking.id,
                                        reason: declineReason.trim() || "Declined by host",
                                    });
                                }
                            }}
                            className="text-xs gap-1.5"
                        >
                            {declineMutation.isPending ? "Declining..." : "Confirm Decline"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
