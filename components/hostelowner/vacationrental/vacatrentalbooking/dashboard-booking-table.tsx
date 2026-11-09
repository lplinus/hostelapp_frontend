"use client";

import Link from "next/link";
import type { VacationRentalBooking, VacationRentalBookingStatus } from "@/types/vacationrental.types";
import {
    Palmtree,
    Search,
    X,
    Clock,
    Check,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { statusOptions, getStatusVariant, formatDate, formatCurrency } from "./dashboard-types";
import type { UseMutationResult } from "@tanstack/react-query";

interface DashboardBookingTableProps {
    perspective: "guest" | "host";
    isLoading: boolean;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedStatus: VacationRentalBookingStatus | "all";
    setSelectedStatus: (s: VacationRentalBookingStatus | "all") => void;
    activeList: VacationRentalBooking[];
    filteredBookings: VacationRentalBooking[];
    setSelectedBooking: (b: VacationRentalBooking | null) => void;
    setIsDeclineModalOpen: (open: boolean) => void;
    approveMutation: UseMutationResult<VacationRentalBooking, any, string, unknown>;
}

export function DashboardBookingTable({
    perspective,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    activeList,
    filteredBookings,
    setSelectedBooking,
    setIsDeclineModalOpen,
    approveMutation,
}: DashboardBookingTableProps) {
    return (
        <>
            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
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
                <div className="relative w-full md:w-72 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

            {/* Table / Loading / Empty */}
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
                            <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="text-xs">
                                Clear Search
                            </Button>
                        ) : perspective === "guest" ? (
                            <Button
                                asChild
                                size="sm"
                                className="text-xs bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white"
                            >
                                <Link href="/city">Discover Getaways</Link>
                            </Button>
                        ) : null}
                    </div>
                </Card>
            ) : (
                <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-xs text-foreground py-3.5">Reservation Code</TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">Rental Property</TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">Stay Dates</TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">Guests</TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">Total Amount</TableHead>
                                <TableHead className="font-semibold text-xs text-foreground">Status</TableHead>
                                <TableHead className="text-right font-semibold text-xs text-foreground pr-4">Actions</TableHead>
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
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                                                    <Palmtree size={14} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-semibold text-foreground truncate max-w-[220px]">
                                                        {b.rental_title || "Vacation Rental Property"}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground truncate">Private Stay</span>
                                                </div>
                                            </div>
                                        </TableCell>
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
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.textClass}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                                {statusMeta.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex items-center justify-end gap-1.5">
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
                                                    Details
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
        </>
    );
}

