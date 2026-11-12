"use client";

import { Clock, BedDouble, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Booking } from "@/services/booking.service";
import { formatDate, formatCurrency, formatRoomCategory, getStatusMeta } from "./hostel-booking-utils";

interface HostelBookingTableProps {
    bookings?: Booking[];
    isLoading: boolean;
    mounted: boolean;
    search: string;
    onSelectBooking: (booking: Booking) => void;
    onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>, id: string) => void;
    onDelete: (id: string) => void;
    isUpdatingStatus: boolean;
    isDeleting: boolean;
}

export default function HostelBookingTable({
    bookings,
    isLoading,
    mounted,
    search,
    onSelectBooking,
    onStatusChange,
    onDelete,
    isUpdatingStatus,
    isDeleting,
}: HostelBookingTableProps) {
    return (
        <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/40 border-b border-border/50">
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
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                        {(!mounted || isLoading) && (
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
                        {mounted && !isLoading && (!bookings || bookings.length === 0) && (
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
                        {mounted && !isLoading &&
                            [...(bookings || [])]
                                .sort(
                                    (a, b) =>
                                        new Date(b.created_at ?? b.check_in).getTime() -
                                        new Date(a.created_at ?? a.check_in).getTime()
                                )
                                .map((b) => (
                                    <tr
                                        key={b.id}
                                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => onSelectBooking(b)}
                                    >
                                        {/* Booking ID */}
                                        <td className="px-5 py-4 align-middle whitespace-nowrap">
                                            <div className="font-mono text-xs font-semibold text-foreground">
                                                STN-{b.id.substring(0, 8).toUpperCase()}
                                            </div>
                                            <div className="mt-1">
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block ${b.booking_type === "visit"
                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                        }`}
                                                >
                                                    {b.booking_type}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Guest */}
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

                                        {/* Hostel */}
                                        <td className="px-5 py-4 align-middle whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground">
                                                {b.hostel_name || `Hostel ID: ${b.hostel}`}
                                            </div>
                                        </td>

                                        {/* Room Type */}
                                        <td className="px-5 py-4 align-middle whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground">
                                                {formatRoomCategory(b.room_category, b.room_type)}
                                            </div>
                                        </td>

                                        {/* Dates */}
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
                                                        className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${b.payment_method === "on_arrival"
                                                            ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                                                            : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                                                            }`}
                                                    >
                                                        {b.payment_method === "on_arrival"
                                                            ? "Pay at Hostel"
                                                            : "Paid Online"}
                                                    </span>
                                                    <span
                                                        className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${b.payment_status === "paid" ||
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
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleSelectStatus(e, b.id)}
                                                    disabled={
                                                        isUpdatingStatus ||
                                                        b.status === "completed" ||
                                                        b.status === "cancelled"
                                                    }
                                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer disabled:cursor-not-allowed ${b.status === "confirmed"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                                        : b.status === "completed"
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-bold"
                                                            : b.status === "cancelled"
                                                                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-bold"
                                                                : "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs gap-1 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectBooking(b);
                                                    }}
                                                >
                                                    Details
                                                    <ChevronRight size={12} />
                                                </Button>

                                                <button
                                                    onClick={() => onDelete(b.id)}
                                                    className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all"
                                                    title="Delete Booking"
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    function handleSelectStatus(e: React.ChangeEvent<HTMLSelectElement>, id: string) {
        onStatusChange(e, id);
    }
}

