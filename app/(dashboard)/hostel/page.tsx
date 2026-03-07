"use client";

import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getMyHostels, createHostel, updateHostel, deleteHostel } from "@/services/hostel.service";
import { uploadHostelImages, deleteHostelImage, updateHostelImages } from "@/services/hostel-image.service";
import { getCities, getAreas } from "@/services/location.service";
import { getAmenities } from "@/services/amenity.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HostelListItem } from "@/types/hostel.types";
import { toast } from "sonner";
import { Pencil, Image as ImageIcon, Trash2 } from "lucide-react";

export default function HostelsPage() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["myHostels"],
        queryFn: getMyHostels,
    });

    const { data: cities } = useQuery({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    const { data: areas } = useQuery({
        queryKey: ["areas"],
        queryFn: getAreas,
    });

    const { data: amenities } = useQuery({
        queryKey: ["amenities"],
        queryFn: getAmenities,
    });

    const [isCreating, setIsCreating] = useState(false);
    const [editingHostel, setEditingHostel] = useState<HostelListItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [editSelectedCity, setEditSelectedCity] = useState<string>("");

    // ── Image Upload State ──────────────────────────────────────
    const [uploadingFor, setUploadingFor] = useState<number | null>(null);

    // ── Image Previews and Upload Form Ref ──────────────────────
    const [imagePreviews, setImagePreviews] = useState({
        image: null as string | null,
        image2: null as string | null,
        image3: null as string | null,
        image4: null as string | null,
    });
    const uploadFormRef = useRef<HTMLFormElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            const maxSize = 30 * 1024 * 1024; // 30MB

            if (file.size > maxSize) {
                toast.error(`Image "${file.name}" is too large. Max size is 30MB.`);
                e.target.value = ""; // Clear input
                setImagePreviews((prev) => ({ ...prev, [name]: null }));
                return;
            }

            setImagePreviews((prev) => ({
                ...prev,
                [name]: URL.createObjectURL(file),
            }));
        } else {
            setImagePreviews((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const clearPreviewsAndForm = () => {
        setImagePreviews({ image: null, image2: null, image3: null, image4: null });
        if (uploadFormRef.current) uploadFormRef.current.reset();
    };

    // Filter areas based on selected city
    const filteredAreas = areas?.filter((a) => a.city === Number(selectedCity)) ?? [];
    const editFilteredAreas = areas?.filter((a) => a.city === Number(editSelectedCity)) ?? [];

    // ── Create ────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: FormData) => createHostel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            setIsCreating(false);
            toast.success("Hostel created successfully!");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to create hostel.");
        }
    });

    // ── Update ────────────────────────────────────────────────────
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

    // ── Delete ────────────────────────────────────────────────────
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

    // ── Image Upload ──────────────────────────────────────────────
    const imageUploadMutation = useMutation({
        mutationFn: (data: FormData) => uploadHostelImages(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            clearPreviewsAndForm();
            toast.success("Images uploaded successfully!");
        },
        onError: (error: any) => {
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
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to update images.");
        }
    });

    // Show toast when opening images panel for a hostel with no uploaded images
    useEffect(() => {
        if (uploadingFor && hostels) {
            clearPreviewsAndForm(); // Clear the form inputs and previews when switching hostels
            const hostel = hostels.find((h) => h.id === uploadingFor);
            if (hostel && (!hostel.images || hostel.images.length === 0)) {
                toast.info("No uploaded images found. Default images are shown. Please upload your hostel images.");
            }
        }
    }, [uploadingFor, hostels]);

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
        const formData = new FormData(e.currentTarget);

        // Handle checkboxes
        if (!formData.get("is_active")) formData.set("is_active", "false");
        if (!formData.get("is_discounted")) formData.set("is_discounted", "false");

        // Handle amenities (multiple checkbox values)
        const amenityIds = formData.getAll("amenities");
        formData.delete("amenities");
        amenityIds.forEach((id) => formData.append("amenities", id as string));

        createMutation.mutate(formData);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingHostel) return;
        const fd = new FormData(e.currentTarget);
        const payload: Record<string, any> = {};
        if (!fd.get("is_active")) payload.is_active = false;
        if (!fd.get("is_discounted")) payload.is_discounted = false;

        // Collect amenities
        const amenityIds = fd.getAll("amenities").map(Number);
        payload.amenities = amenityIds;

        fd.forEach((value, key) => {
            if (key === "amenities") return; // already handled
            if (value !== "") payload[key] = value;
        });
        updateMutation.mutate({ id: editingHostel.id, data: payload });
    };

    const handleDelete = (id: number) => {
        toast("Delete Hostel", {
            description: "Are you sure you want to delete this hostel? This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: () => deleteMutation.mutate(id),
            },
            cancel: { label: "Cancel", onClick: () => { } },
        });
    };

    const handleImageUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        // Remove empty file objects so we don't overwrite existing images with nothing
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

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

    const totalPages = Math.ceil((hostels?.length || 0) / pageSize);
    const currentHostels = hostels?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">My Hostels</h2>
                    <button
                        onClick={() => {
                            setIsCreating(!isCreating);
                            setEditingHostel(null);
                            setUploadingFor(null);
                        }}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                        {isCreating ? "Cancel" : "Add Hostel"}
                    </button>
                </div>

                {/* ── Create Form ─────────────────────────────────── */}
                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h3 className="text-xl font-bold mb-4">Create Hostel</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input id="create-name" type="text" name="name" required className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="create-hostel_type" className="block text-sm font-medium text-gray-700">Hostel Type</label>
                                    <select id="create-hostel_type" name="hostel_type" className="w-full border p-2 rounded mt-1 bg-white" required>
                                        <option value="boys">Boys</option>
                                        <option value="girls">Girls</option>
                                        <option value="co_living">Co-Living</option>
                                        <option value="working_professional">Working Professional</option>
                                        <option value="student">Student</option>
                                        <option value="luxury">Luxury</option>
                                        <option value="budget">Budget</option>
                                        <option value="pg">PG</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="create-city" className="block text-sm font-medium text-gray-700">City</label>
                                    <select
                                        id="create-city"
                                        name="city"
                                        required
                                        className="w-full border p-2 rounded mt-1 bg-white"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                    >
                                        <option value="" disabled>Select City</option>
                                        {cities?.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="create-area" className="block text-sm font-medium text-gray-700">Area</label>
                                    <select
                                        id="create-area"
                                        name="area"
                                        className="w-full border p-2 rounded mt-1 bg-white"
                                    >
                                        <option value="">Select Area (Optional)</option>
                                        {filteredAreas.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="create-price" className="block text-sm font-medium text-gray-700">Base Price</label>
                                    <input id="create-price" type="number" step="0.01" name="price" required className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="create-discount" className="block text-sm font-medium text-gray-700">Discount %</label>
                                    <input id="create-discount" type="number" step="0.01" name="discount_percentage" defaultValue={0} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="create-lat" className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <input id="create-lat" type="number" step="0.000001" name="latitude" className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="create-lng" className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <input id="create-lng" type="number" step="0.000001" name="longitude" className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input id="create-is_discounted" type="checkbox" name="is_discounted" value="true" className="w-4 h-4" />
                                    <label htmlFor="create-is_discounted" className="text-sm">Apply Discount?</label>
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input id="create-is_active" type="checkbox" name="is_active" value="true" defaultChecked className="w-4 h-4" />
                                    <label htmlFor="create-is_active" className="text-sm">Is Active / Visible</label>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="create-slug" className="block text-sm font-medium text-gray-700">Registration Slug (Unique URL)</label>
                                    <input id="create-slug" type="text" name="slug" required className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="create-short_desc" className="block text-sm font-medium text-gray-700">Short Description</label>
                                    <textarea id="create-short_desc" name="short_description" required className="w-full border p-2 rounded mt-1" rows={2} />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="create-desc" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea id="create-desc" name="description" required className="w-full border p-2 rounded mt-1" rows={4} />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="create-address" className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea id="create-address" name="address" required className="w-full border p-2 rounded mt-1" rows={2} />
                                </div>
                                <div>
                                    <label htmlFor="create-postal" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input id="create-postal" type="text" name="postal_code" required className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="create-checkin" className="block text-sm font-medium text-gray-700">Check-in Time</label>
                                    <input id="create-checkin" type="time" name="check_in_time" required className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="create-checkout" className="block text-sm font-medium text-gray-700">Check-out Time</label>
                                    <input id="create-checkout" type="time" name="check_out_time" required className="w-full border p-2 rounded mt-1" />
                                </div>

                                {/* ── Amenities ──────────────────────────── */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
                                        {amenities?.map((am) => (
                                            <label key={am.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded">
                                                <input type="checkbox" name="amenities" value={am.id} className="w-4 h-4 accent-blue-600" />
                                                {am.name}
                                            </label>
                                        ))}
                                        {!amenities?.length && <p className="text-gray-400 text-sm col-span-full">No amenities available.</p>}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={createMutation.isPending} className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                                {createMutation.isPending ? "Creating..." : "Save Hostel"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Edit Form ──────────────────────────────────── */}
                {editingHostel && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Edit Hostel: {editingHostel.name}</h3>
                            <button onClick={() => setEditingHostel(null)} className="text-gray-500 hover:text-gray-700 text-sm">✕ Cancel</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input id="edit-name" type="text" name="name" defaultValue={editingHostel.name} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="edit-hostel_type" className="block text-sm font-medium text-gray-700">Hostel Type</label>
                                    <select id="edit-hostel_type" name="hostel_type" defaultValue={editingHostel.hostel_type} className="w-full border p-2 rounded mt-1 bg-white">
                                        <option value="boys">Boys</option>
                                        <option value="girls">Girls</option>
                                        <option value="co_living">Co-Living</option>
                                        <option value="working_professional">Working Professional</option>
                                        <option value="student">Student</option>
                                        <option value="luxury">Luxury</option>
                                        <option value="budget">Budget</option>
                                        <option value="pg">PG</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-city" className="block text-sm font-medium text-gray-700">City</label>
                                    <select
                                        id="edit-city"
                                        name="city"
                                        required
                                        className="w-full border p-2 rounded mt-1 bg-white"
                                        value={editSelectedCity || editingHostel.city?.id?.toString() || ""}
                                        onChange={(e) => setEditSelectedCity(e.target.value)}
                                    >
                                        <option value="" disabled>Select City</option>
                                        {cities?.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-area" className="block text-sm font-medium text-gray-700">Area</label>
                                    <select
                                        id="edit-area"
                                        name="area"
                                        className="w-full border p-2 rounded mt-1 bg-white"
                                        defaultValue={editingHostel.area?.id ?? ""}
                                    >
                                        <option value="">Select Area (Optional)</option>
                                        {(editSelectedCity ? editFilteredAreas : areas?.filter((a) => a.city === editingHostel.city?.id) ?? []).map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Base Price</label>
                                    <input id="edit-price" type="number" step="0.01" name="price" defaultValue={editingHostel.price} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="edit-discount" className="block text-sm font-medium text-gray-700">Discount %</label>
                                    <input id="edit-discount" type="number" step="0.01" name="discount_percentage" defaultValue={editingHostel.discount_percentage ?? ""} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="edit-lat" className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <input id="edit-lat" type="number" step="0.000001" name="latitude" defaultValue={editingHostel.latitude ?? ""} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="edit-lng" className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <input id="edit-lng" type="number" step="0.000001" name="longitude" defaultValue={editingHostel.longitude ?? ""} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input id="edit-is_discounted" type="checkbox" name="is_discounted" defaultChecked={editingHostel.is_discounted ?? false} value="true" className="w-4 h-4" />
                                    <label htmlFor="edit-is_discounted" className="text-sm">Apply Discount?</label>
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input id="edit-is_active" type="checkbox" name="is_active" defaultChecked={editingHostel.is_active ?? false} value="true" className="w-4 h-4" />
                                    <label htmlFor="edit-is_active" className="text-sm">Is Active / Visible</label>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="edit-short_desc" className="block text-sm font-medium text-gray-700">Short Description</label>
                                    <textarea id="edit-short_desc" name="short_description" defaultValue={editingHostel.short_description} className="w-full border p-2 rounded mt-1" rows={2} />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="edit-desc" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea id="edit-desc" name="description" defaultValue={editingHostel.description} className="w-full border p-2 rounded mt-1" rows={4} />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea id="edit-address" name="address" defaultValue={editingHostel.address} className="w-full border p-2 rounded mt-1" rows={2} />
                                </div>
                                <div>
                                    <label htmlFor="edit-postal" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input id="edit-postal" type="text" name="postal_code" defaultValue={editingHostel.postal_code ?? ""} className="w-full border p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="edit-checkin" className="block text-sm font-medium text-gray-700">Check-in Time</label>
                                    <input id="edit-checkin" type="time" name="check_in_time" defaultValue={editingHostel.check_in_time} className="w-full border p-2 rounded mt-1" required />
                                </div>
                                <div>
                                    <label htmlFor="edit-checkout" className="block text-sm font-medium text-gray-700">Check-out Time</label>
                                    <input id="edit-checkout" type="time" name="check_out_time" defaultValue={editingHostel.check_out_time} className="w-full border p-2 rounded mt-1" required />
                                </div>

                                {/* ── Amenities ──────────────────────────── */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
                                        {/* Render selected amenities (highlighted) at the top */}
                                        {amenities?.filter(am => editingHostel.amenities?.some((a) => a.id === am.id)).map((am) => (
                                            <label key={am.id} className="flex items-center gap-2 text-sm cursor-pointer bg-blue-50 border border-blue-200 p-1.5 rounded shadow-sm transition">
                                                <input
                                                    type="checkbox"
                                                    name="amenities"
                                                    value={am.id}
                                                    defaultChecked
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                                <span className="font-medium text-blue-900">{am.name}</span>
                                            </label>
                                        ))}
                                        {/* Render unselected amenities below */}
                                        {amenities?.filter(am => !editingHostel.amenities?.some((a) => a.id === am.id)).map((am) => (
                                            <label key={am.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white border border-transparent p-1.5 rounded transition">
                                                <input
                                                    type="checkbox"
                                                    name="amenities"
                                                    value={am.id}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                                <span className="text-gray-700">{am.name}</span>
                                            </label>
                                        ))}
                                        {!amenities?.length && <p className="text-gray-400 text-sm col-span-full">No amenities available.</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </button>
                                <button type="button" onClick={() => setEditingHostel(null)} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Image Upload Form (for a specific hostel) ───── */}
                {uploadingFor && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                Upload Images: {hostels?.find((h) => h.id === uploadingFor)?.name}
                            </h3>
                            <button onClick={() => setUploadingFor(null)} className="text-gray-500 hover:text-gray-700 text-sm">✕ Close</button>
                        </div>

                        {/* Existing Images — Outer + Inner */}
                        {(() => {
                            const hostel = hostels?.find((h) => h.id === uploadingFor);
                            const imgs = hostel?.images ?? [];
                            if (imgs.length > 0) {
                                return (
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-600 mb-3 font-medium">Current Images:</p>
                                        {imgs.map((img) => (
                                            <div key={img.id} className="mb-4 border rounded-lg p-3 bg-gray-50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-medium text-gray-500">Image Set #{img.id} {img.is_primary && <span className="ml-1 text-blue-600">(Primary)</span>}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => imageDeleteMutation.mutate(img.id)}
                                                        className="text-xs text-red-500 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded transition"
                                                    >
                                                        Delete Set
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {/* Outer / Main Image */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Outer Image</p>
                                                        {img.image ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={`${API_BASE}${img.image}`} alt={img.alt_text || "Outer"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Inner Image 2 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Inner Image 2</p>
                                                        {img.image2 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={`${API_BASE}${img.image2}`} alt={img.alt_text || "Inner 2"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Inner Image 3 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Inner Image 3</p>
                                                        {img.image3 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={`${API_BASE}${img.image3}`} alt={img.alt_text || "Inner 3"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Inner Image 4 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Inner Image 4</p>
                                                        {img.image4 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={`${API_BASE}${img.image4}`} alt={img.alt_text || "Inner 4"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            return (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-700">⚠️ No uploaded images found. Default images are shown on the public page. Please upload your hostel images below.</p>
                                </div>
                            );
                        })()}

                        <form ref={uploadFormRef} onSubmit={handleImageUpload} className="space-y-4">
                            <input type="hidden" name="hostel" value={uploadingFor} />
                            {(() => {
                                const hostel = hostels?.find((h) => h.id === uploadingFor);
                                const existingSet = hostel?.images?.[0];

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label htmlFor="img-outer" className="block text-sm font-medium text-gray-700">Outer / Main Image</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-blue-300 transition-colors">
                                                <input id="img-outer" type="file" name="image" accept="image/*" required={!existingSet?.image} className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image || existingSet?.image) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image ? "New Input" : existingSet?.image?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image || (existingSet?.image ? `${API_BASE}${existingSet.image}` : "")} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-1" className="block text-sm font-medium text-gray-700">Inner Image 2</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-1" type="file" name="image2" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image2 || existingSet?.image2) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image2 ? "New Input" : existingSet?.image2?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image2 || (existingSet?.image2 ? `${API_BASE}${existingSet.image2}` : "")} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-2" className="block text-sm font-medium text-gray-700">Inner Image 3</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-2" type="file" name="image3" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image3 || existingSet?.image3) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image3 ? "New Input" : existingSet?.image3?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image3 || (existingSet?.image3 ? `${API_BASE}${existingSet.image3}` : "")} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-3" className="block text-sm font-medium text-gray-700">Inner Image 4</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-3" type="file" name="image4" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image4 || existingSet?.image4) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image4 ? "New Input" : existingSet?.image4?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image4 || (existingSet?.image4 ? `${API_BASE}${existingSet.image4}` : "")} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="img-alt" className="block text-sm font-medium text-gray-700">Alt Text</label>
                                            <input id="img-alt" type="text" name="alt_text" defaultValue={existingSet?.alt_text || ""} required className="w-full border p-2.5 rounded mt-1 shadow-sm text-sm" placeholder="Describe the images..." />
                                        </div>
                                        <div className="flex items-center gap-3 mt-6 bg-gray-50 p-2.5 rounded-lg border border-dashed hover:border-blue-300 transition-colors">
                                            <input id="img-primary" type="checkbox" name="is_primary" defaultChecked={existingSet?.is_primary || false} value="true" className="w-5 h-5 rounded accent-blue-600" />
                                            <label htmlFor="img-primary" className="text-sm font-medium text-gray-700 cursor-pointer">Set as Primary Image</label>
                                        </div>
                                    </div>
                                );
                            })()}
                            <button type="submit" disabled={imageUploadMutation.isPending || imageUpdateMutation.isPending} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition">
                                {(imageUploadMutation.isPending || imageUpdateMutation.isPending) ? "Saving..." : "Save Images"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Hostels Table ──────────────────────────────── */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={`skel-${i}`} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                    </tr>
                                ))
                            ) : hostels?.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hostels found. Click &quot;Add Hostel&quot; to get started.</td></tr>
                            ) : (
                                currentHostels?.map((h, idx) => (
                                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {(currentPage - 1) * pageSize + idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{h.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{h.city?.name ?? "N/A"}, {h.area?.name ?? "N/A"}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">₹{h.price}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{h.rating_avg > 0 ? h.rating_avg : "Unrated"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className="text-gray-700 font-medium">{h.images?.length ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingHostel(h);
                                                        setEditSelectedCity(h.city?.id?.toString() || "");
                                                        setIsCreating(false);
                                                        setUploadingFor(null);
                                                        globalThis.scrollTo({ top: 0, behavior: "smooth" });
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-md transition"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUploadingFor(h.id);
                                                        setEditingHostel(null);
                                                        setIsCreating(false);
                                                        globalThis.scrollTo({ top: 0, behavior: "smooth" });
                                                    }}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-md transition"
                                                    title="Images"
                                                >
                                                    <ImageIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(h.id)}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteMutation.isPending ? "..." : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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
