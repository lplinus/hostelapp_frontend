"use client";

import { Search, Calendar, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HostelBookingFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    view: "bookings" | "inquiries";
    setView: (view: "bookings" | "inquiries") => void;
    bookingsCount?: number;
    onScanQR: () => void;
}

export default function HostelBookingFilters({
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    view,
    setView,
    bookingsCount = 0,
    onScanQR,
}: HostelBookingFiltersProps) {
    return (
        <div className="space-y-6">
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
                    onClick={onScanQR}
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
                    {bookingsCount > 0 && (
                        <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                view === "bookings"
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {bookingsCount}
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
        </div>
    );
}

