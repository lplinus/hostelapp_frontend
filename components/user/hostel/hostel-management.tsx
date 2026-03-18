"use client";

import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { getMyHostels, createHostel, updateHostel, deleteHostel } from "@/services/hostel.service";
import { uploadHostelImages, deleteHostelImage, updateHostelImages } from "@/services/hostel-image.service";
import { getCities, getAreas, getStates } from "@/services/location.service";
import { getAmenities } from "@/services/amenity.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HostelListItem } from "@/types/hostel.types";
import { toast } from "sonner";
import { Pencil, Image as ImageIcon, Trash2 } from "lucide-react";
import HostelForm from "./hostel-form";
import { toLocalMediaPath } from "@/lib/utils";

export default function HostelManagement() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [priceView, setPriceView] = useState<"monthly" | "daily">("monthly");
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

    const { data: states } = useQuery({
        queryKey: ["states"],
        queryFn: getStates,
    });

    const [isCreating, setIsCreating] = useState(false);
    const [editingHostel, setEditingHostel] = useState<HostelListItem | null>(null);

    // ── Image Upload State ──────────────────────────────────────
    const [uploadingFor, setUploadingFor] = useState<number | null>(null);

    // ── Image Previews and Upload Form Ref ──────────────────────
    const [imagePreviews, setImagePreviews] = useState({
        image: null as string | null,
        image2: null as string | null,
        image3: null as string | null,
        image4: null as string | null,
        image5: null as string | null,
        image6: null as string | null,
        image7: null as string | null,
        image8: null as string | null,
        image9: null as string | null,
        image10: null as string | null,
    });
    const uploadFormRef = useRef<HTMLFormElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) {
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
        setImagePreviews({ 
            image: null, image2: null, image3: null, image4: null, 
            image5: null, image6: null, image7: null, image8: null, 
            image9: null, image10: null 
        });
        if (uploadFormRef.current) uploadFormRef.current.reset();
    };

    // ── Create ────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: FormData) => createHostel(data),
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
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 shadow-md transition-all font-semibold"
                    >
                        {isCreating ? "Cancel" : "Add Hostel"}
                    </button>
                </div>

                {/* ── Forms ──────────────────────────────────── */}
                {isCreating && (
                    <HostelForm
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setIsCreating(false)}
                        isPending={createMutation.isPending}
                        cities={cities}
                        areas={areas}
                        states={states}
                        amenities={amenities}
                    />
                )}

                {editingHostel && (
                    <HostelForm
                        initialData={editingHostel}
                        onSubmit={handleEditSubmit}
                        onCancel={() => setEditingHostel(null)}
                        isPending={updateMutation.isPending}
                        cities={cities}
                        areas={areas}
                        states={states}
                        amenities={amenities}
                    />
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
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                    {/* Image 1 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 1</p>
                                                        {img.image ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image) || ""} alt={img.alt_text || "Image 1"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 2 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 2</p>
                                                        {img.image2 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image2) || ""} alt={img.alt_text || "Image 2"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 3 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 3</p>
                                                        {img.image3 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image3) || ""} alt={img.alt_text || "Image 3"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 4 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 4</p>
                                                        {img.image4 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image4) || ""} alt={img.alt_text || "Image 4"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 5 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 5</p>
                                                        {img.image5 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image5) || ""} alt={img.alt_text || "Image 5"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 6 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 6</p>
                                                        {img.image6 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image6) || ""} alt={img.alt_text || "Image 6"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 7 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 7</p>
                                                        {img.image7 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image7) || ""} alt={img.alt_text || "Image 7"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 8 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 8</p>
                                                        {img.image8 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image8) || ""} alt={img.alt_text || "Image 8"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 9 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 9</p>
                                                        {img.image9 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image9) || ""} alt={img.alt_text || "Image 9"} className="w-full h-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                                                        )}
                                                    </div>
                                                    {/* Image 10 */}
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 mb-1 font-medium">Image 10</p>
                                                        {img.image10 ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={toLocalMediaPath(img.image10) || ""} alt={img.alt_text || "Image 10"} className="w-full h-28 object-cover rounded" />
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
                                            <label htmlFor="img-outer" className="block text-sm font-medium text-gray-700">Image 1</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-blue-300 transition-colors">
                                                <input id="img-outer" type="file" name="image" accept="image/*" required={!existingSet?.image} className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image || existingSet?.image) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image ? "New Input" : existingSet?.image?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image || (existingSet?.image ? toLocalMediaPath(existingSet.image) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-1" className="block text-sm font-medium text-gray-700">Image 2</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-1" type="file" name="image2" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image2 || existingSet?.image2) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image2 ? "New Input" : existingSet?.image2?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image2 || (existingSet?.image2 ? toLocalMediaPath(existingSet.image2) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-2" className="block text-sm font-medium text-gray-700">Image 3</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-2" type="file" name="image3" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image3 || existingSet?.image3) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image3 ? "New Input" : existingSet?.image3?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image3 || (existingSet?.image3 ? toLocalMediaPath(existingSet.image3) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-3" className="block text-sm font-medium text-gray-700">Image 4</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-3" type="file" name="image4" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image4 || existingSet?.image4) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image4 ? "New Input" : existingSet?.image4?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image4 || (existingSet?.image4 ? toLocalMediaPath(existingSet.image4) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-4" className="block text-sm font-medium text-gray-700">Image 5</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-4" type="file" name="image5" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image5 || existingSet?.image5) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image5 ? "New Input" : existingSet?.image5?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image5 || (existingSet?.image5 ? toLocalMediaPath(existingSet.image5) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-5" className="block text-sm font-medium text-gray-700">Image 6</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-5" type="file" name="image6" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image6 || existingSet?.image6) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image6 ? "New Input" : existingSet?.image6?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image6 || (existingSet?.image6 ? toLocalMediaPath(existingSet.image6) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-6" className="block text-sm font-medium text-gray-700">Image 7</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-6" type="file" name="image7" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image7 || existingSet?.image7) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image7 ? "New Input" : existingSet?.image7?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image7 || (existingSet?.image7 ? toLocalMediaPath(existingSet.image7) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-7" className="block text-sm font-medium text-gray-700">Image 8</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-7" type="file" name="image8" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image8 || existingSet?.image8) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image8 ? "New Input" : existingSet?.image8?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image8 || (existingSet?.image8 ? toLocalMediaPath(existingSet.image8) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-8" className="block text-sm font-medium text-gray-700">Image 9</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-8" type="file" name="image9" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image9 || existingSet?.image9) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image9 ? "New Input" : existingSet?.image9?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image9 || (existingSet?.image9 ? toLocalMediaPath(existingSet.image9) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="img-inner-9" className="block text-sm font-medium text-gray-700">Image 10</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-dashed hover:border-green-300 transition-colors">
                                                <input id="img-inner-9" type="file" name="image10" accept="image/*" className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" onChange={handleImageChange} />
                                                {(imagePreviews.image10 || existingSet?.image10) && (
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[80px] mb-1">
                                                            {imagePreviews.image10 ? "New Input" : existingSet?.image10?.split("/").pop()}
                                                        </span>
                                                        <img src={imagePreviews.image10 || (existingSet?.image10 ? toLocalMediaPath(existingSet.image10) : "") || ""} alt="Preview" className="w-10 h-10 object-cover rounded shadow-sm ring-1 ring-gray-200" />
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    <div className="flex items-center gap-2">
                                        Price (₹)
                                        <select
                                            className="ml-1 bg-transparent border-none text-[10px] font-bold text-blue-600 focus:ring-0 cursor-pointer outline-none uppercase bg-white px-1 py-0.5 rounded shadow-sm"
                                            value={priceView}
                                            onChange={(e) => setPriceView(e.target.value as "monthly" | "daily")}
                                        >
                                            <option value="monthly">/ Month</option>
                                            <option value="daily">/ Day</option>
                                        </select>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                [1, 2, 3].map((id) => (
                                    <tr key={`skel-${id}`} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                                    </tr>
                                ))
                            ) : (
                                <>
                                    {hostels?.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hostels found. Click &quot;Add Hostel&quot; to get started.</td></tr>
                                    ) : (
                                        currentHostels?.map((h, idx) => {
                                            const discountText = h.is_discounted ? (
                                                <span className="text-[10px] text-green-600 font-medium whitespace-nowrap">
                                                    {priceView === "monthly" ? `(₹${h.final_price})` : (h.final_price_per_day ? `(₹${h.final_price_per_day})` : "")}
                                                </span>
                                            ) : null;

                                            return (
                                                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                        {(currentPage - 1) * pageSize + idx + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{h.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{h.city?.name ?? "N/A"}, {h.area?.name ?? "N/A"}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                                                        <div className="flex flex-col">
                                                            <span>₹{priceView === "monthly" ? h.price : (h.price_per_day || "N/A")}</span>
                                                            {discountText}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{h.rating_avg > 0 ? h.rating_avg : "Unrated"}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <span className="text-gray-700 font-medium">{h.images?.length ?? 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${h.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {h.is_approved ? 'Verified' : 'Pending Verification'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingHostel(h);
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
                                            );
                                        })
                                    )}
                                </>
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
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={`page-${pageNum}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-4 py-2 border rounded ${currentPage === pageNum ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
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
