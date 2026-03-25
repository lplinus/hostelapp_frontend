"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getOwnerBookings, updateBookingStatus, deleteBooking, checkInBooking } from "@/services/booking.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, QrCode, Search, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import BookingQRScanner from "@/components/user/qr/BookingQRScanner";

export default function BookingsPage() {
    const queryClient = useQueryClient();
    const [isScanning, setIsScanning] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["ownerBookings", search, startDate, endDate],
        queryFn: () => getOwnerBookings({
            search: search || undefined,
            check_in__gte: startDate || undefined,
            check_in__lte: endDate || undefined
        }),
        refetchInterval: 5000,
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
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Manage Bookings</h2>
                    
                    <button
                        onClick={() => setIsScanning(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-semibold transition-colors"
                    >
                        <QrCode size={18} />
                        Scan QR specifically
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-lg shadow sm:flex gap-4 items-end">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Search size={12} /> Search Bookings
                        </label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, email, mobile or ID..."
                                className="w-full pl-3 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} /> Date Range (From)
                        </label>
                        <input 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} /> Date Range (To)
                        </label>
                        <input 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button 
                        onClick={() => {setSearch(""); setStartDate(""); setEndDate("");}}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 flex-1">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        Loading bookings...
                                    </td>
                                </tr>
                            )}
                            {!isLoading && (!bookings || bookings.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">
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
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                    b.booking_type === 'visit' 
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
                                            <div className="text-[11px] text-gray-400">Age: {b.guest_age}</div>
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
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                                        b.payment_method === 'on_arrival' 
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                    }`}>
                                                        {b.payment_method === 'on_arrival' ? 'Pay at Hostel' : 'Paid Online'}
                                                    </span>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                                        b.payment_status === 'paid' || b.payment_status === 'captured'
                                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : b.payment_status === 'failed'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                        {b.payment_status || 'Pending'}
                                                    </span>
                                                </div>
                                                {b.payment_id && (
                                                    <div className="font-mono text-[8px] text-gray-400 break-all max-w-[120px] leading-tight">
                                                        ID: {b.payment_id}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleStatusChange(e, b.id)}
                                                    disabled={statusMutation.isPending || b.status === "completed"}
                                                    className={`border rounded p-1 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                                        b.status === "completed" 
                                                            ? "text-green-600 border-green-200 bg-green-50 font-bold" 
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
                                            <div className="mt-1 font-bold text-gray-900">₹{Number.parseFloat(b.total_price).toLocaleString()}</div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {isScanning && (
                    <BookingQRScanner
                        onScan={handleQRScan}
                        onClose={() => setIsScanning(false)}
                    />
                )}
            </main>
        </div>
    );
}
