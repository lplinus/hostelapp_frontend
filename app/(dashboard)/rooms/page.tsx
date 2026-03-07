"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getMyRooms, createRoom, deleteRoom, updateRoom, RoomType } from "@/services/room.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyHostels } from "@/services/hostel.service";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export default function RoomsPage() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const { data: rooms, isLoading: roomsLoading } = useQuery({
        queryKey: ["myRooms"],
        queryFn: getMyRooms,
    });

    const { data: hostels } = useQuery({
        queryKey: ["myHostels"],
        queryFn: getMyHostels,
    });

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<RoomType>>({
        room_category: "NON_AC",
        sharing_type: "1",
    });

    const createMutation = useMutation({
        mutationFn: (data: RoomType) => createRoom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myRooms"] });
            setIsCreating(false);
            setFormData({ room_category: "NON_AC", sharing_type: "1" });
            toast.success("Room created successfully!");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to create room.");
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; data: Partial<RoomType> }) => updateRoom(data.id, data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myRooms"] });
            setIsCreating(false);
            setIsEditing(false);
            setEditingId(null);
            setFormData({ room_category: "NON_AC", sharing_type: "1" });
            toast.success("Room updated successfully!");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to update room.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myRooms"] });
            toast.success("Room deleted successfully!");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to delete room.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData as RoomType);
        }
    };

    const handleEdit = (room: RoomType) => {
        setFormData({
            hostel: room.hostel,
            room_category: room.room_category,
            sharing_type: String(room.sharing_type),
            price: room.price,
        });
        setEditingId(room.id as number);
        setIsEditing(true);
        setIsCreating(true);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ room_category: "NON_AC", sharing_type: "1" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const totalPages = Math.ceil((rooms?.length || 0) / pageSize);
    const currentRooms = rooms?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">My Rooms</h2>
                    <button
                        onClick={() => {
                            if (isCreating) handleCancel();
                            else setIsCreating(true);
                        }}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        {isCreating ? "Cancel" : "Add Room"}
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Room" : "Create Room"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hostel</label>
                                    <select
                                        name="hostel"
                                        onChange={handleChange}
                                        required
                                        value={formData.hostel || ""}
                                        className="mt-1 block w-full rounded-md border p-2 bg-white"
                                    >
                                        <option value="" disabled>Select Hostel</option>
                                        {hostels?.map((h) => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Room Category</label>
                                    <select
                                        name="room_category"
                                        value={formData.room_category}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border p-2 bg-white"
                                        required
                                    >
                                        <option value="NON_AC">Non-AC</option>
                                        <option value="AC">AC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sharing Type</label>
                                    <select
                                        name="sharing_type"
                                        value={formData.sharing_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border p-2 bg-white"
                                        required
                                    >
                                        <option value="1">Single Sharing</option>
                                        <option value="2">Double Sharing</option>
                                        <option value="3">Triple Sharing</option>
                                        <option value="4">Four Sharing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (Base)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price || ""}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border p-2"
                                        required
                                    />
                                </div>
                                {!isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Beds to Generate</label>
                                        <input
                                            type="number"
                                            name="total_beds"
                                            value={formData.total_beds || ""}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border p-2"
                                            title="Beds are permanently generated and available"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                                {createMutation.isPending || updateMutation.isPending ? "Saving..." : isEditing ? "Update Room" : "Save Room"}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharing</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roomsLoading ? (<tr><td colSpan={8} className="px-6 py-4 text-center">Loading...</td></tr>) :
                                rooms?.length === 0 ? (<tr><td colSpan={8} className="px-6 py-4 text-center">No rooms found.</td></tr>) :
                                    currentRooms?.map((r, idx) => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hostels?.find(h => h.id === r.hostel)?.name || r.hostel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.category_display || r.room_category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.sharing_display || r.sharing_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{r.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.available_beds}/{r.total_beds} beds</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                                                <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-md transition" title="Edit">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => deleteMutation.mutate(r.id as number)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-4 py-2 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
