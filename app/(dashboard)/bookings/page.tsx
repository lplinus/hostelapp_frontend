"use client";

import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getOwnerBookings, updateBookingStatus, deleteBooking, Booking } from "@/services/booking.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["ownerBookings"],
        queryFn: getOwnerBookings,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Manage Bookings</h2>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>) :
                                bookings?.length === 0 ? (<tr><td colSpan={6} className="px-6 py-4 text-center">No bookings found.</td></tr>) :
                                    bookings?.map((b) => (
                                        <tr key={b.id}>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-900 font-medium">
                                                STN-{b.id.substring(0, 6).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{b.guest_name}</div>
                                                <div className="text-gray-500">{b.guest_email}</div>
                                                <div className="text-xs text-gray-400">Age: {b.guest_age}</div>
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
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        value={b.status}
                                                        onChange={(e) => handleStatusChange(e, b.id)}
                                                        disabled={statusMutation.isPending}
                                                        className="border rounded p-1 text-sm bg-white"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                        <option value="completed">Completed</option>
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
                                                <div className="mt-1 font-bold text-gray-900">₹{parseFloat(b.total_price).toLocaleString()}</div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
