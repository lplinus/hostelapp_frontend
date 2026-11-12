"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getGroupedMyRooms,
    createRoom,
    deleteRoom,
    updateRoom,
    RoomType,
    GroupedHostelRooms,
} from "@/services/hostelservices/room.service";
import { getMyHostels } from "@/services/hostelservices/hostel.service";

export function useHostelRooms(initialGroupedRooms: readonly GroupedHostelRooms[]) {
    const queryClient = useQueryClient();
    const [priceView, setPriceView] = useState<"monthly" | "daily">("monthly");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHostelFilter, setSelectedHostelFilter] = useState<string>("all");

    const { data: groupedRooms, isLoading: roomsLoading, refetch, isRefetching } = useQuery({
        queryKey: ["groupedRooms"],
        queryFn: getGroupedMyRooms,
        initialData: Array.from(initialGroupedRooms),
        refetchInterval: 5000,
    });

    const [collapsedHostels, setCollapsedHostels] = useState<Record<number, boolean>>({});

    const toggleHostelCollapse = (hostelId: number) => {
        setCollapsedHostels((prev) => ({
            ...prev,
            [hostelId]: !prev[hostelId],
        }));
    };

    const allCollapsed = Boolean(
        groupedRooms &&
        groupedRooms.length > 0 &&
        groupedRooms.every((h) => !!collapsedHostels[h.hostel_id])
    );

    const toggleAllHostels = () => {
        if (!groupedRooms) return;
        if (allCollapsed) {
            setCollapsedHostels({});
        } else {
            const newMap: Record<number, boolean> = {};
            groupedRooms.forEach((h) => {
                newMap[h.hostel_id] = true;
            });
            setCollapsedHostels(newMap);
        }
    };

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
        show_this_price: false,
        features: "",
    });

    const createMutation = useMutation({
        mutationFn: (data: RoomType) => createRoom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            setIsCreating(false);
            setFormData({ room_category: "NON_AC", sharing_type: "1", features: "" });
            toast.success("Room type created successfully!");
        },
        onError: (error: any) => {
            let message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            if (message && message.includes("must make a unique set")) {
                message = "This room configuration (Category + Sharing Type) already exists for this hostel. Please modify or delete the existing one.";
            }
            toast.error(message || "Failed to create room.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; data: Partial<RoomType> }) => updateRoom(data.id, data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            setIsCreating(false);
            setIsEditing(false);
            setEditingId(null);
            setFormData({ room_category: "NON_AC", sharing_type: "1", features: "" });
            toast.success("Room type updated successfully!");
        },
        onError: (error: any) => {
            let message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            if (message && message.includes("must make a unique set")) {
                message = "This room configuration (Category + Sharing Type) already exists for this hostel. Please modify or delete the existing one.";
            }
            toast.error(message || "Failed to update room.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            toast.success("Room variant deleted successfully!");
        },
        onError: () => {
            toast.error("Failed to delete room. It might have active bookings.");
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditing && editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData as RoomType);
        }
    };

    const handleEdit = (room: any, hostelId: number) => {
        setFormData({
            hostel: hostelId,
            room_category: room.room_category ? room.room_category.toUpperCase() : "NON_AC",
            sharing_type: String(room.sharing_type),
            price: room.price,
            price_per_day: room.price_per_day,
            total_beds: room.total_beds,
            show_this_price: !!room.show_this_price,
            features: room.features || "",
        });
        setEditingId(room.id as number);
        setIsEditing(true);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ room_category: "NON_AC", sharing_type: "1", show_this_price: false, features: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checkbox = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checkbox.checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Filter groupedRooms by selectedHostelFilter and searchQuery
    const filteredGroupedRooms = (groupedRooms || [])
        .filter((h) => {
            if (selectedHostelFilter !== "all" && String(h.hostel_id) !== selectedHostelFilter) {
                return false;
            }
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const matchesHostelName = h.hostel_name.toLowerCase().includes(q);
            const matchesRoom = h.categories.some((cat) =>
                cat.category_name.toLowerCase().includes(q) ||
                cat.rooms.some((r) =>
                    r.sharing.toLowerCase().includes(q) ||
                    (r.features && r.features.toLowerCase().includes(q))
                )
            );
            return matchesHostelName || matchesRoom;
        });

    return {
        groupedRooms,
        filteredGroupedRooms,
        roomsLoading,
        hostels,
        priceView,
        setPriceView,
        searchQuery,
        setSearchQuery,
        selectedHostelFilter,
        setSelectedHostelFilter,
        isCreating,
        setIsCreating,
        isEditing,
        editingId,
        formData,
        setFormData,
        createMutation,
        updateMutation,
        deleteMutation,
        handleSubmit,
        handleEdit,
        handleCancel,
        handleChange,
        collapsedHostels,
        toggleHostelCollapse,
        allCollapsed,
        toggleAllHostels,
        refetch,
        isRefetching,
    };
}

