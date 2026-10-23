"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getOwnerBookings, updateBookingStatus, deleteBooking, checkInBooking, getOwnerInquiries, updateInquiryStatus } from "@/services/booking.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, QrCode, Search, Calendar, X, Phone } from "lucide-react";
import { toast } from "sonner";
import BookingQRScanner from "@/components/user/qr/BookingQRScanner";

export default function BookingsPage() {
    const queryClient = useQueryClient();
    const [isScanning, setIsScanning] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [view, setView] = useState<"bookings" | "inquiries">("bookings");

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["ownerBookings", search, startDate, endDate],
        queryFn: () => getOwnerBookings({
            search: search || undefined,
            check_in__gte: startDate || undefined,
            check_in__lte: endDate || undefined
        }),
        refetchInterval: 5000,
    });

    const { data: inquiries, isLoading: isInquiriesLoading } = useQuery({
        queryKey: ["ownerInquiries"],
        queryFn: () => getOwnerInquiries(),
        refetchInterval: 5000,
        enabled: view === "inquiries"
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
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            toast.success("Status updated successfully");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const inquiryStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => updateInquiryStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerInquiries"] });
            toast.success("Inquiry status updated successfully");
        },
        onError: () => {
            toast.error("Failed to update inquiry status");
        }
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
        }
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
        // Extract booking ID from QR code data — supports multiple formats:
        // 1. "Booking ID: STN-XXXXXXXX" (current format)
        // 2. "BOOKING:<uuid>" (legacy format)
        // 3. Raw UUID pattern (fallback)
        const stnMatch = decodedText.match(/STN-([A-Fa-f0-9]{8})/);
        const bookingTagMatch = decodedText.match(/BOOKING:([^\s\\]+)/);
        const uuidMatch = decodedText.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);

        // Prefer STN format (sends "STN-XXXXXXXX" to backend which handles it)
        const bookingId = stnMatch ? `STN-${stnMatch[1].toUpperCase()}` : (bookingTagMatch?.[1] || uuidMatch?.[1]);

        if (bookingId) {
            setIsScanning(false);
            toast.promise(checkInMutation.mutateAsync(bookingId), {
                loading: "Checking in guest...",
                success: "Guest checked in successfully!",
                error: "Failed to check in guest via QR code."
            });
        } else {
            toast.error("Invalid QR Code. Could not find booking ID.");
            setIsScanning(false);
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
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manage Bookings</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Review guest reservations, track check-ins, and manage inquiries.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsScanning(true)}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
                        >
                            <QrCode size={16} />
                            Scan QR Check-In
                        </button>
                    </div>

                    {/* View Toggle Tabs matching Vendor tabs */}
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit overflow-x-auto">
                        <button
                            onClick={() => setView("bookings")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                view === "bookings"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Bookings
                            {bookings && bookings.length > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    view === "bookings"
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-muted-foreground/15 text-muted-foreground"
                                }`}>
                                    {bookings.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setView("inquiries")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                view === "inquiries"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Inquiries (Contact Owner)
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white p-4 rounded-xl border border-border/40 shadow-xs flex flex-wrap md:flex-nowrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px] space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Search size={12} /> Search Bookings
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name, email, mobile or ID..."
                                    className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                {search && (
                                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={12} /> Date (From)
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={12} /> Date (To)
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>

                        <button
                            onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); }}
                            className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="border border-border/40 rounded-xl bg-card overflow-x-auto shadow-xs">
                        <table className="min-w-full divide-y divide-border/40">
                            <thead className="bg-muted/30">
                                {view === "bookings" ? (
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Booking ID</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Guest</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Hostel</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Room Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Dates</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Payment</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status & Actions</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Guest Details</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Hostel</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Message</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Action</th>
                                    </tr>
                                )}
                            </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {view === "bookings" ? (
                                <>
                                    {isLoading && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                Loading bookings...
                                            </td>
                                        </tr>
                                    )}
                                    {!isLoading && (!bookings || bookings.length === 0) && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500 italic">
                                                No bookings found.
                                            </td>
                                        </tr>
                                    )}
                                    {!isLoading && [...(bookings || [])]
                                        .sort((a, b) => new Date(b.created_at ?? b.check_in).getTime() - new Date(a.created_at ?? a.check_in).getTime())
                                        .map((b) => (
                                            <tr key={b.id}>
                                                <td className="px-6 py-4 text-sm font-mono text-gray-900 font-medium">
                                                    STN-{b.id.substring(0, 8).toUpperCase()}
                                                    <div className="mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${b.booking_type === 'visit'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-indigo-100 text-indigo-700'
                                                            }`}>
                                                            {b.booking_type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-gray-900">{b.guest_name}</div>
                                                    <div className="text-gray-500">{b.guest_email}</div>
                                                    <div className="text-cyan-700 font-medium flex items-center gap-1 mt-0.5">
                                                        <span className="text-[10px] text-gray-400 font-normal">Mob:</span> {b.mobile_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{b.hostel_name || `Hostel ID: ${b.hostel}`}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div>{b.room_category || `Room Type: ${b.room_type}`}</div>
                                                    <div className="text-xs text-gray-400">{b.adults} Adults, {b.children} Children</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(b.check_in).toLocaleDateString()} - <br />
                                                    {new Date(b.check_out).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="space-y-2">
                                                        <div className="flex gap-1 flex-wrap">
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${b.payment_method === 'on_arrival'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                }`}>
                                                                {b.payment_method === 'on_arrival' ? 'Pay at Hostel' : 'Paid Online'}
                                                            </span>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${b.payment_status === 'paid' || b.payment_status === 'captured'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : b.payment_status === 'failed'
                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                }`}>
                                                                {b.payment_status || 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <select
                                                            value={b.status}
                                                            onChange={(e) => handleStatusChange(e, b.id)}
                                                            disabled={statusMutation.isPending || b.status === "completed" || b.status === "cancelled"}
                                                            className={`border rounded p-1 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${b.status === "completed"
                                                                ? "text-green-600 border-green-200 bg-green-50 font-bold"
                                                                : b.status === "cancelled"
                                                                    ? "text-red-600 border-red-200 bg-red-50 font-bold"
                                                                    : "text-gray-700"
                                                                }`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                            <option value="completed" className="text-green-600 font-bold">Completed</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleDelete(b.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                                            title="Delete Booking"
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </>
                            ) : (
                                <>
                                    {isInquiriesLoading && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                Loading inquiries...
                                            </td>
                                        </tr>
                                    )}
                                    {!isInquiriesLoading && (!inquiries || inquiries.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">
                                                No inquiries found.
                                            </td>
                                        </tr>
                                    )}
                                    {!isInquiriesLoading && (Array.isArray(inquiries) ? inquiries : (inquiries as any)?.results || [])?.map((iq: any) => (
                                        <tr key={iq.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {iq.created_at ? new Date(iq.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{iq.guest_name}</div>
                                                <div className="text-gray-500 text-xs">{iq.guest_email}</div>
                                                <div className="text-cyan-700 font-medium text-xs mt-0.5">{iq.mobile_number}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {iq.hostel_name || `ID: ${iq.hostel}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {iq.message || <span className="italic text-gray-400">No message</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <select
                                                    value={iq.status || 'pending'}
                                                    onChange={(e) => handleInquiryStatusChange(e, iq.id)}
                                                    disabled={inquiryStatusMutation.isPending || iq.status === "enquired"}
                                                    className={`border rounded p-1 text-[11px] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed font-bold uppercase tracking-wider ${iq.status === "enquired"
                                                        ? "text-blue-600 border-blue-200 bg-blue-50"
                                                        : "text-gray-600"
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="enquired">Enquired</option>
                                                    <option value="responded">Responded</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span 
                                                    title="This feature is available soon"
                                                    className="text-gray-400 cursor-not-allowed font-semibold flex items-center gap-1 opacity-60"
                                                >
                                                    <Phone size={14} /> Call Guest
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

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
