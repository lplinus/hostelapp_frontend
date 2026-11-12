"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHostel, updateHostel, deleteHostel } from "@/services/hostelservices/hostel.service";
import { uploadHostelImages, deleteHostelImage, updateHostelImages } from "@/services/hotelservices/hostel-image.service";
import type { HostelListItem } from "@/types/hostel.types";
import { toast } from "sonner";

interface UseHostelMutationsProps {
    setIsCreating: (val: boolean) => void;
    setEditingHostel: (val: HostelListItem | null) => void;
    clearPreviewsAndForm: () => void;
    hostels?: HostelListItem[];
    uploadingFor: number | null;
    editingHostel: HostelListItem | null;
}

export function useHostelMutations({
    setIsCreating,
    setEditingHostel,
    clearPreviewsAndForm,
    hostels,
    uploadingFor,
    editingHostel,
}: UseHostelMutationsProps) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Record<string, any>) => createHostel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            setIsCreating(false);
            toast.success("Hostel created successfully! Please wait for admin verification.");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to create hostel.");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
            updateHostel(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            setEditingHostel(null);
            toast.success("Hostel updated successfully!");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to update hostel.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteHostel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            toast.success("Hostel deleted successfully!");
        },
        onError: () => {
            toast.error("Failed to delete hostel. Please try again.");
        }
    });

    const imageUploadMutation = useMutation({
        mutationFn: (data: FormData) => uploadHostelImages(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            clearPreviewsAndForm();
            toast.success("Images uploaded successfully!");
        },
        onError: (error: any) => {
            if (error?.status === 413 || error?.response?.status === 413) {
                toast.error("Total upload size too large. Please upload fewer images at once or reduce image resolution.");
                return;
            }
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to upload images.");
        }
    });

    const imageUpdateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: FormData }) => updateHostelImages(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            clearPreviewsAndForm();
            toast.success("Images updated successfully!");
        },
        onError: (error: any) => {
            if (error?.status === 413 || error?.response?.status === 413) {
                toast.error("Total upload size too large. Please upload fewer images at once or reduce image resolution.");
                return;
            }
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to update images.");
        }
    });

    const imageDeleteMutation = useMutation({
        mutationFn: (id: number) => deleteHostelImage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            toast.success("Image deleted!");
        },
        onError: () => {
            toast.error("Failed to delete image.");
        }
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload: Record<string, any> = {};

        if (!fd.get("is_active")) payload.is_active = false;
        if (!fd.get("is_discounted")) payload.is_discounted = false;

        const amenityIds = fd.getAll("amenities").map(Number);
        payload.amenities = amenityIds;

        const suitableFor = fd.getAll("suitable_for").filter(Boolean);
        payload.suitable_for = suitableFor;

        fd.forEach((value, key) => {
            if (key === "amenities" || key === "extra_charges_json" || key === "suitable_for") return;
            if (value !== "") payload[key] = value;
        });

        const extraChargesJson = fd.get("extra_charges_json") as string;
        if (extraChargesJson) {
            try {
                payload.extra_charges = JSON.parse(extraChargesJson);
            } catch {
                payload.extra_charges = [];
            }
        } else {
            payload.extra_charges = [];
        }

        createMutation.mutate(payload);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingHostel) return;
        const fd = new FormData(e.currentTarget);
        const payload: Record<string, any> = {};
        if (!fd.get("is_active")) payload.is_active = false;
        if (!fd.get("is_discounted")) payload.is_discounted = false;

        const amenityIds = fd.getAll("amenities").map(Number);
        payload.amenities = amenityIds;

        const suitableFor = fd.getAll("suitable_for").filter(Boolean);
        payload.suitable_for = suitableFor;

        fd.forEach((value, key) => {
            if (key === "amenities" || key === "extra_charges_json" || key === "suitable_for") return;
            if (value !== "") payload[key] = value;
        });

        const extraChargesJson = fd.get("extra_charges_json") as string;
        if (extraChargesJson) {
            try {
                payload.extra_charges = JSON.parse(extraChargesJson);
            } catch {
                payload.extra_charges = [];
            }
        } else {
            payload.extra_charges = [];
        }

        updateMutation.mutate({ id: editingHostel.id, data: payload });
    };

    const handleImageUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        const keysToDelete: string[] = [];
        fd.forEach((value, key) => {
            if (value instanceof File && value.size === 0) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(k => fd.delete(k));

        const hostel = hostels?.find((h) => h.id === uploadingFor);
        const existingSet = hostel?.images && hostel.images.length > 0 ? hostel.images[0] : null;

        if (existingSet) {
            imageUpdateMutation.mutate({ id: existingSet.id, data: fd });
        } else {
            imageUploadMutation.mutate(fd);
        }
    };

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        imageUploadMutation,
        imageUpdateMutation,
        imageDeleteMutation,
        handleCreateSubmit,
        handleEditSubmit,
        handleImageUpload,
    };
}

