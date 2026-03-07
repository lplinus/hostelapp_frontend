"use client";

import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getOwnerBookings, updateBookingStatus, Booking } from "@/services/booking.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function BookingsPage() {
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["ownerBookings"],
        queryFn: getOwnerBookings,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) => updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
        }
    });

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, id: number) => {
        statusMutation.mutate({ id, status: e.target.value });
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>) :
                                bookings?.length === 0 ? (<tr><td colSpan={5} className="px-6 py-4 text-center">No bookings found.</td></tr>) :
                                    bookings?.map((b) => (
                                        <tr key={b.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{b.user_name || `User ID: ${b.user}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{b.hostel_name || `Hostel ID: ${b.hostel}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{b.room_category || `Room Type: ${b.room_type}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(b.check_in_date).toLocaleDateString()} - <br />
                                                {new Date(b.check_out_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleStatusChange(e, b.id)}
                                                    disabled={statusMutation.isPending}
                                                    className="border rounded p-1"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="completed">Completed</option>
                                                </select>
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
